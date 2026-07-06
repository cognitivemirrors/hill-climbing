/* Hill Climbing — hc-sync.js
   ────────────────────────────────────────────────────────────────────────────
   Shared, app-agnostic END-TO-END-ENCRYPTED cross-device sync.

   This is deliberately a CLASSIC <script> (not type="module"): it must share the
   classic global scope so an app's read/write adapters can close over the app's
   own globals (state, load, save, apply, idbAll, idbPutMany, render). Supabase
   JS is pulled lazily via dynamic import() inside init(), so first paint stays
   offline-capable and the suite keeps its no-build, single-file ethos.

   Trust model (zero-knowledge): a random Data Encryption Key (DEK) encrypts every
   document (AES-GCM). The DEK is itself wrapped twice — by a passphrase-derived
   key and by a recovery-code-derived key (PBKDF2-SHA256, 600k iterations). The
   server stores ONLY ciphertext plus the two wrapped-DEK blobs; it can never read
   content. What DOES leave the device: ciphertext, doc keys, sizes, counts,
   timestamps, and the account email. Content never does. This is opt-in.

   Registered as window.HCSync. See registerStore() for how an app opts a store
   into sync. Nothing is synced unless a store is explicitly registered — an
   allowlist, which is what keeps device-local secrets (API keys, UI flags) out.
   ──────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  const SUPA_MODULE   = 'https://esm.sh/@supabase/supabase-js@2';
  const META_KEY      = 'hill-climbing-sync-meta';  // device-local; NEVER a registered store
  const KDF_ITERS     = 600000;                     // OWASP 2024 PBKDF2-SHA256 floor
  const BLOB_DEBOUNCE = 1500;                        // coalesce rapid edits before pushing a blob
  const KEY_DB        = 'hc-sync';                   // device-local IDB holding the cached DEK
  const KEY_STORE     = 'keys';

  // ── codec helpers ──────────────────────────────────────────────────────────
  const te = new TextEncoder(), td = new TextDecoder();
  const enc = (s) => te.encode(s);
  function b64(buf) {
    const bytes = new Uint8Array(buf); let s = '';
    for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return btoa(s);
  }
  function unb64(str) {
    const s = atob(str); const bytes = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) bytes[i] = s.charCodeAt(i);
    return bytes;
  }
  // Crockford base32 (no I, L, O, U) for the recovery code.
  function crockford(bytes) {
    const A = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
    let bits = 0, value = 0, out = '';
    for (let i = 0; i < bytes.length; i++) {
      value = (value << 8) | bytes[i]; bits += 8;
      while (bits >= 5) { out += A[(value >>> (bits - 5)) & 31]; bits -= 5; }
    }
    if (bits > 0) out += A[(value << (5 - bits)) & 31];
    return out;
  }
  function genRecoveryCode() {
    const raw = crypto.getRandomValues(new Uint8Array(20));   // 160-bit
    return crockford(raw).replace(/(.{5})/g, '$1-').replace(/-$/, '');
  }
  // Canonicalize a typed recovery code so setup and unlock derive the same key.
  function canonCode(s) {
    return (s || '').toUpperCase().replace(/[^0-9A-Z]/g, '')
      .replace(/O/g, '0').replace(/I/g, '1').replace(/L/g, '1');
  }

  // ── crypto primitives ──────────────────────────────────────────────────────
  function deriveKek(secretStr, saltBytes) {
    return crypto.subtle.importKey('raw', enc(secretStr), 'PBKDF2', false, ['deriveKey'])
      .then((base) => crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt: saltBytes, iterations: KDF_ITERS, hash: 'SHA-256' },
        base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']));
  }
  function importDek(rawBytes) {
    // Non-extractable: the working DEK can never be read back out as raw bytes.
    return crypto.subtle.importKey('raw', rawBytes, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
  }
  async function wrapDekWith(kek, rawDek) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const wrapped = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, kek, rawDek);
    return { iv: b64(iv), wrapped: b64(wrapped) };
  }
  async function unwrapDekWith(kek, wrappedB64, ivB64) {
    const raw = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(ivB64) }, kek, unb64(wrappedB64));
    return new Uint8Array(raw);
  }
  const aad = (userId, docKey, clock) => userId + '|' + docKey + '|' + String(clock);
  async function sealDoc(dekKey, plaintextStr, aadStr) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv, additionalData: enc(aadStr) }, dekKey, enc(plaintextStr));
    return { iv: b64(iv), ct: b64(ct) };
  }
  async function openDoc(dekKey, ctB64, ivB64, aadStr) {
    const pt = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: unb64(ivB64), additionalData: enc(aadStr) }, dekKey, unb64(ctB64));
    return td.decode(pt);
  }

  // ── device-local DEK cache (IndexedDB — CryptoKey stored, raw bytes never) ──
  function openKeyDb() {
    return new Promise((res, rej) => {
      const req = indexedDB.open(KEY_DB, 1);
      req.onupgradeneeded = () => {
        const d = req.result;
        if (!d.objectStoreNames.contains(KEY_STORE)) d.createObjectStore(KEY_STORE, { keyPath: 'id' });
      };
      req.onsuccess = () => res(req.result);
      req.onerror   = () => rej(req.error);
    });
  }
  async function cacheDek(cryptoKey) {
    const d = await openKeyDb();
    return new Promise((res, rej) => {
      const tx = d.transaction(KEY_STORE, 'readwrite');
      tx.objectStore(KEY_STORE).put({ id: 'dek', key: cryptoKey });
      tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error);
    });
  }
  async function loadCachedDek() {
    const d = await openKeyDb();
    return new Promise((res) => {
      const req = d.transaction(KEY_STORE, 'readonly').objectStore(KEY_STORE).get('dek');
      req.onsuccess = () => res(req.result ? req.result.key : null);
      req.onerror   = () => res(null);
    });
  }
  async function clearDekCache() {
    const d = await openKeyDb();
    return new Promise((res) => {
      const tx = d.transaction(KEY_STORE, 'readwrite');
      tx.objectStore(KEY_STORE).delete('dek');
      tx.oncomplete = () => res(); tx.onerror = () => res();
    });
  }

  // ── device-local sync meta (localStorage — clocks + pull cursors) ───────────
  function loadMeta() { try { return JSON.parse(localStorage.getItem(META_KEY) || '{}') || {}; } catch (e) { return {}; } }
  function saveMeta(m) { try { localStorage.setItem(META_KEY, JSON.stringify(m)); } catch (e) { /* quota/private */ } }
  function getDeviceId() {
    const m = loadMeta();
    if (!m.deviceId) { m.deviceId = (crypto.randomUUID && crypto.randomUUID()) || (Date.now() + '-' + Math.random().toString(36).slice(2)); saveMeta(m); }
    return m.deviceId;
  }
  function getClock(k)  { const m = loadMeta(); return (m.clocks && m.clocks[k]) || 0; }
  function setClock(k, n) { const m = loadMeta(); m.clocks = m.clocks || {}; m.clocks[k] = n; saveMeta(m); }
  function bumpClock(k) { const m = loadMeta(); m.clocks = m.clocks || {}; m.clocks[k] = Math.max((m.clocks[k] || 0) + 1, Date.now()); saveMeta(m); return m.clocks[k]; }
  function getSeq(k)    { const m = loadMeta(); return (m.seq && m.seq[k]) || 0; }
  function setSeq(k, n) { const m = loadMeta(); m.seq = m.seq || {}; if (n > (m.seq[k] || 0)) { m.seq[k] = n; saveMeta(m); } }

  // ── module state ────────────────────────────────────────────────────────────
  const S = {
    sb: null, config: null, user: null, dek: null,
    stores: new Map(),
    status: { state: 'signed_out', syncing: false, online: navigator.onLine !== false, lastSyncAt: null, error: null, email: null },
    subs: [], pushArmed: false, applyingRemote: false, blobTimers: {}, srv: {},
  };
  function setStatus(patch) {
    Object.assign(S.status, patch);
    const snap = Object.assign({}, S.status);
    S.subs.forEach((fn) => { try { fn(snap); } catch (e) { /* subscriber threw */ } });
  }
  function getStatus() { return Object.assign({}, S.status); }
  function subscribe(fn) {
    S.subs.push(fn); try { fn(getStatus()); } catch (e) { /* ignore */ }
    return () => { const i = S.subs.indexOf(fn); if (i >= 0) S.subs.splice(i, 1); };
  }
  function errMsg(e) { return (e && (e.message || e.error_description || e.msg)) || 'Sync error'; }
  function requireSb()   { if (!S.sb)   throw new Error('Sync not ready.'); }
  function requireUser() { if (!S.user) throw new Error('Not signed in.'); }
  function isUnlocked()  { return !!S.dek && !!S.user; }

  // ── registration ────────────────────────────────────────────────────────────
  // store = { key, kind:'blob'|'log',
  //   blob: read()->plaintext, write(plaintext)   (write MUST bypass the app's apply())
  //   log:  readAll()->records[], writeMany(records)->void, recordId(record)->id }
  function registerStore(store) { S.stores.set(store.key, store); }

  // ── auth ─────────────────────────────────────────────────────────────────────
  async function signup(email, password) {
    requireSb();
    const { data, error } = await S.sb.auth.signUp({ email, password });
    if (error) throw error;
    const hasSession = !!(data && data.session);
    S.user = hasSession ? data.user : null;
    setStatus({ email, state: hasSession ? 'locked' : 'signed_out' });
    return { user: data.user, needsConfirmation: !hasSession };
  }
  async function login(email, password) {
    requireSb();
    const { data, error } = await S.sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    S.user = data.user;
    setStatus({ email, state: 'locked' });
    return { user: data.user };
  }
  async function logout() {
    try { if (S.sb) await S.sb.auth.signOut(); } catch (e) { /* ignore */ }
    S.user = null; S.dek = null; S.pushArmed = false;
    await clearDekCache().catch(() => {});
    setStatus({ state: 'signed_out', email: null });
  }
  function currentUser() { return S.user ? { id: S.user.id, email: S.user.email } : null; }

  async function fetchKeyBundle() {
    const { data, error } = await S.sb.from('sync_keybundle').select('*').eq('user_id', S.user.id).maybeSingle();
    if (error) throw error;
    return data || null;
  }
  async function hasKeyBundle() { try { return !!(await fetchKeyBundle()); } catch (e) { return false; } }

  // ── encryption setup / unlock ────────────────────────────────────────────────
  async function setupEncryption(passphrase) {
    requireSb(); requireUser();
    if (await fetchKeyBundle()) throw new Error('Encryption is already set up for this account — use "Enter passphrase" instead.');
    const rawDek   = crypto.getRandomValues(new Uint8Array(32));
    const passSalt = crypto.getRandomValues(new Uint8Array(16));
    const recSalt  = crypto.getRandomValues(new Uint8Array(16));
    const recoveryCode = genRecoveryCode();
    const passKek = await deriveKek(passphrase, passSalt);
    const recKek  = await deriveKek(canonCode(recoveryCode), recSalt);
    const passW = await wrapDekWith(passKek, rawDek);
    const recW  = await wrapDekWith(recKek, rawDek);
    const { error } = await S.sb.from('sync_keybundle').upsert({
      user_id: S.user.id, kdf: 'PBKDF2-SHA256-' + KDF_ITERS,
      pass_salt: b64(passSalt), pass_iv: passW.iv, pass_wrapped: passW.wrapped,
      rec_salt: b64(recSalt),  rec_iv: recW.iv,  rec_wrapped: recW.wrapped,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
    if (error) throw error;
    S.dek = await importDek(rawDek); rawDek.fill(0);
    await cacheDek(S.dek);
    setStatus({ state: 'unlocked' });
    await pullAll();
    return { recoveryCode };
  }
  async function unlockWith(secretStr, saltB64, wrappedB64, ivB64, wrongMsg) {
    const kek = await deriveKek(secretStr, unb64(saltB64));
    let rawDek;
    try { rawDek = await unwrapDekWith(kek, wrappedB64, ivB64); }
    catch (e) { throw new Error(wrongMsg); }
    S.dek = await importDek(rawDek); rawDek.fill(0);
    await cacheDek(S.dek);
    setStatus({ state: 'unlocked' });
    await pullAll();
  }
  async function unlock(passphrase) {
    requireSb(); requireUser();
    const b = await fetchKeyBundle();
    if (!b) throw new Error('No encryption set up for this account yet.');
    await unlockWith(passphrase, b.pass_salt, b.pass_wrapped, b.pass_iv, 'Wrong passphrase.');
  }
  async function unlockWithRecoveryCode(code) {
    requireSb(); requireUser();
    const b = await fetchKeyBundle();
    if (!b) throw new Error('No encryption set up for this account yet.');
    await unlockWith(canonCode(code), b.rec_salt, b.rec_wrapped, b.rec_iv, 'That recovery code did not work.');
  }
  async function changePassphrase(oldPass, newPass) {
    requireSb(); requireUser();
    const b = await fetchKeyBundle();
    if (!b) throw new Error('Nothing to change yet.');
    const oldKek = await deriveKek(oldPass, unb64(b.pass_salt));
    let rawDek;
    try { rawDek = await unwrapDekWith(oldKek, b.pass_wrapped, b.pass_iv); }
    catch (e) { throw new Error('Old passphrase is wrong.'); }
    const newSalt = crypto.getRandomValues(new Uint8Array(16));
    const newKek  = await deriveKek(newPass, newSalt);
    const w = await wrapDekWith(newKek, rawDek); rawDek.fill(0);
    const { error } = await S.sb.from('sync_keybundle').update({
      pass_salt: b64(newSalt), pass_iv: w.iv, pass_wrapped: w.wrapped, updated_at: new Date().toISOString(),
    }).eq('user_id', S.user.id);
    if (error) throw error;
  }
  function lock() {
    S.dek = null; S.pushArmed = false;
    clearDekCache().catch(() => {});
    setStatus({ state: S.user ? 'locked' : 'signed_out' });
  }

  // ── delete everything on the server (honors CONSTRAINTS P1/C3: real deletion) ─
  async function deleteRemoteData() {
    requireSb(); requireUser();
    const uid = S.user.id;
    const a = await S.sb.from('sync_docs').delete().eq('user_id', uid);
    if (a.error) throw a.error;
    const b = await S.sb.from('sync_keybundle').delete().eq('user_id', uid);
    if (b.error) throw b.error;
    // Reset local sync cursors and lock, so a later re-setup starts clean.
    const m = loadMeta(); delete m.clocks; delete m.seq; saveMeta(m);
    S.pushArmed = false; S.dek = null;
    await clearDekCache().catch(() => {});
    setStatus({ state: S.user ? 'locked' : 'signed_out' });
  }

  // ── encrypt + push helpers ────────────────────────────────────────────────────
  async function _pushBlob(store) {
    if (!isUnlocked()) return;
    let clock = getClock(store.key); if (!clock) clock = bumpClock(store.key);
    const plaintext = await store.read();
    const sealed = await sealDoc(S.dek, plaintext, aad(S.user.id, store.key, clock));
    const { error } = await S.sb.rpc('sync_put_blob', {
      p_doc_key: store.key, p_ct: sealed.ct, p_iv: sealed.iv, p_updated_at: clock, p_device: getDeviceId(),
    });
    if (error) throw error;
  }
  async function _putLogRecord(store, record) {
    if (!isUnlocked()) return;
    const docKey = store.key + '/' + store.recordId(record);
    const clock = Number(record.ts) || Date.now();
    const sealed = await sealDoc(S.dek, JSON.stringify(record), aad(S.user.id, docKey, clock));
    const { error } = await S.sb.rpc('sync_put_log', {
      p_doc_key: docKey, p_ct: sealed.ct, p_iv: sealed.iv, p_updated_at: clock, p_device: getDeviceId(),
    });
    if (error) throw error;
  }
  async function _pushLogAll(store) {
    if (!isUnlocked()) return;
    const records = await store.readAll();
    for (let i = 0; i < records.length; i += 8) {
      await Promise.all(records.slice(i, i + 8).map((r) => _putLogRecord(store, r).catch(() => {})));
    }
  }

  // Public push entry points — called from the app's apply() choke point.
  function queueBlobPush(key) {
    if (!isUnlocked()) return;
    bumpClock(key);                    // reflect the local mutation time even before push is armed
    if (!S.pushArmed) return;          // …but don't transmit until the initial pull has reconciled
    clearTimeout(S.blobTimers[key]);
    S.blobTimers[key] = setTimeout(() => {
      if (S.applyingRemote) return;    // a remote apply is in flight; its own state will be pushed by its author
      _pushBlob(S.stores.get(key)).catch((err) => setStatus({ error: errMsg(err) }));
    }, BLOB_DEBOUNCE);
  }
  function pushLogRecord(key, record) {
    if (!isUnlocked() || !S.pushArmed) return;
    _putLogRecord(S.stores.get(key), record).catch((err) => setStatus({ error: errMsg(err) }));
  }
  async function push(key) {
    const keys = key ? [key] : Array.from(S.stores.keys());
    for (const k of keys) {
      const store = S.stores.get(k);
      if (store.kind === 'blob') await _pushBlob(store).catch(() => {});
      else await _pushLogAll(store).catch(() => {});
    }
  }

  // ── pull + merge ──────────────────────────────────────────────────────────────
  async function pullStore(store) {
    if (!isUnlocked()) return;
    if (store.kind === 'blob') {
      const { data, error } = await S.sb.from('sync_docs')
        .select('ciphertext,iv,updated_at').eq('doc_key', store.key).maybeSingle();
      if (error) throw error;
      if (data) {
        const serverClock = Number(data.updated_at);
        S.srv[store.key] = serverClock;
        if (serverClock > getClock(store.key)) {
          const pt = await openDoc(S.dek, data.ciphertext, data.iv, aad(S.user.id, store.key, serverClock));
          S.applyingRemote = true;
          try { await store.write(pt); } finally { S.applyingRemote = false; }
          setClock(store.key, serverClock);
        }
        // local newer → reconciled (pushed) by pullAll's seed pass
      } else {
        S.srv[store.key] = 0;
      }
    } else {
      const prefix = store.key + '/';
      const hwm = getSeq(store.key);
      const { data, error } = await S.sb.from('sync_docs')
        .select('doc_key,ciphertext,iv,updated_at,server_seq')
        .like('doc_key', prefix + '%').gt('server_seq', hwm).order('server_seq', { ascending: true });
      if (error) throw error;
      if (data && data.length) {
        const recs = []; let maxSeq = hwm;
        for (const row of data) {
          try {
            const pt = await openDoc(S.dek, row.ciphertext, row.iv, aad(S.user.id, row.doc_key, Number(row.updated_at)));
            recs.push(JSON.parse(pt));
          } catch (e) { /* skip a record we can't decrypt rather than abort the whole pull */ }
          if (row.server_seq > maxSeq) maxSeq = row.server_seq;
        }
        if (recs.length) {
          S.applyingRemote = true;
          try { await store.writeMany(recs); } finally { S.applyingRemote = false; }
        }
        setSeq(store.key, maxSeq);
      }
    }
  }
  async function pull(key) {
    if (!isUnlocked() || S.status.syncing) return;
    setStatus({ syncing: true, error: null });
    try {
      const keys = key ? [key] : Array.from(S.stores.keys());
      for (const k of keys) await pullStore(S.stores.get(k));
      setStatus({ syncing: false, lastSyncAt: Date.now() });
    } catch (err) {
      setStatus({ syncing: false, error: errMsg(err) });
    }
  }
  async function pullAll() {
    if (!isUnlocked()) return;
    setStatus({ syncing: true, error: null });
    S.srv = {};
    try {
      for (const store of S.stores.values()) await pullStore(store);
      // Seed / reconcile: push local-newer blobs and union all local log records.
      for (const store of S.stores.values()) {
        if (store.kind === 'blob') {
          const serverClock = S.srv[store.key] || 0;
          if (serverClock === 0 || getClock(store.key) > serverClock) await _pushBlob(store).catch(() => {});
        } else {
          await _pushLogAll(store).catch(() => {});
        }
      }
      S.pushArmed = true;             // only now may the apply() hook transmit
      setStatus({ syncing: false, lastSyncAt: Date.now() });
    } catch (err) {
      S.pushArmed = true;            // still arm, so edits push once connectivity returns
      setStatus({ syncing: false, error: errMsg(err) });
    }
  }

  // ── init ──────────────────────────────────────────────────────────────────────
  function looksConfigured(url, anon) {
    return !!url && /^https:\/\//.test(url) && !/YOUR-PROJECT|example\.supabase|<|>/.test(url) && !!anon && anon.length > 20;
  }
  async function init(config) {
    S.config = config;
    if (!looksConfigured(config.supabaseUrl, config.supabaseAnonKey)) {
      setStatus({ state: 'signed_out', error: 'not_configured' });
      return;
    }
    window.addEventListener('online',  () => { setStatus({ online: true });  if (isUnlocked()) pull(); });
    window.addEventListener('offline', () => setStatus({ online: false }));
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && isUnlocked()) pull(); });
    if (config.pullOnFocus !== false) window.addEventListener('focus', () => { if (isUnlocked()) pull(); });
    try {
      const mod = await import(SUPA_MODULE);
      S.sb = mod.createClient(config.supabaseUrl, config.supabaseAnonKey);
    } catch (e) {
      setStatus({ error: 'offline' });   // Supabase JS couldn't load (offline / blocked) — app stays usable
      return;
    }
    S.sb.auth.onAuthStateChange((_evt, session) => {
      S.user = session ? session.user : null;
      setStatus({ email: S.user ? S.user.email : null, state: S.user ? (S.dek ? 'unlocked' : 'locked') : 'signed_out' });
    });
    let session = null;
    try { const r = await S.sb.auth.getSession(); session = r.data ? r.data.session : null; } catch (e) { /* ignore */ }
    S.user = session ? session.user : null;
    if (S.user) {
      const dek = await loadCachedDek().catch(() => null);
      if (dek) { S.dek = dek; setStatus({ state: 'unlocked', email: S.user.email }); await pullAll(); }
      else { setStatus({ state: 'locked', email: S.user.email }); }
    } else {
      setStatus({ state: 'signed_out' });
    }
    const ms = config.pullIntervalMs;
    if (ms !== 0) setInterval(() => { if (isUnlocked() && document.visibilityState === 'visible') pull(); }, ms || 45000);
  }

  window.HCSync = {
    init, signup, login, logout, currentUser,
    hasKeyBundle, setupEncryption, unlock, unlockWithRecoveryCode, changePassphrase, lock, isUnlocked,
    deleteRemoteData,
    registerStore, push, pushLogRecord, queueBlobPush, pull, pullAll,
    getStatus, subscribe,
  };
})();
