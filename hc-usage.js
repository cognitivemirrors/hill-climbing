/* Hill Climbing — hc-usage.js
   ────────────────────────────────────────────────────────────────────────────
   Shared usage log: per-app day-flags + per-session practice durations, with
   opt-in cross-device sync via hc-sync.js.

   Loaded as a CLASSIC <script> (like hc-sync.js / hc-sync-chip.js), AFTER
   hc-sync.js and BEFORE each app's own script, so it can register its sync
   store before the app calls HCSync.init(). Loaded by the six practice apps
   that log usage (meditate · breathe · nourish · foresee · climb · train),
   the hub, and companion (read-only).

   ── Why a log store, not the blob everything else uses ──────────────────────
   Usage is a per-day UNION across devices: if your phone logs a sit today and
   your laptop logs breathwork today, both must count — a last-write-wins blob
   would have one device's push overwrite the other's. So usage syncs as an
   insert-only LOG of immutable per-session (and per-day-flag) records, each
   tagged with the device that wrote it, and the totals are SUMMED at read time.
   Records never collide across devices (the device id is in the record id) and
   are never mutated in place, so nothing is ever clobbered.

   ── Two stores, on purpose ──────────────────────────────────────────────────
   1. Legacy localStorage `hill-climbing-usage` (per-device aggregate) — kept
      exactly as before so companion.html and any offline reader keep working.
      NON-cross-device (it only ever holds this device's activity).
   2. IndexedDB `hc-usage/records` (this file) — the synced source of truth.
      The hub aggregates it (local + pulled-remote) for its dashboard.

   Every write updates BOTH; the hub reads (2). Nothing leaves the device unless
   the user has turned sync on and unlocked at the hub (hc-sync.js is opt-in).
   ──────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  const USAGE_KEY    = 'hill-climbing-usage';            // legacy per-device aggregate (companion + offline)
  const DEVICE_KEY   = 'hill-climbing-usage-device';     // stable device id; device-local, NEVER synced
  const BACKFILL_KEY = 'hill-climbing-usage-backfilled';  // one-time migration guard (device-local)
  const SYNC_KEY     = 'usage';                           // hc-sync log-store key (server doc_key prefix)
  const DB_NAME = 'hc-usage', STORE = 'records';

  // Canonical zero-padded local day key — MUST match hc-sync-era hcDayKey in the
  // apps and the hub. (Deliberately different from meditate's todayKey/reflect's
  // dayKey; see CLAUDE.md.)
  function hcDayKey(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function deviceId() {
    let id = null;
    try { id = localStorage.getItem(DEVICE_KEY); } catch (_) {}
    if (!id) {
      id = 'd' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      try { localStorage.setItem(DEVICE_KEY, id); } catch (_) {}
    }
    return id;
  }
  function rid() { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }

  // ── IndexedDB (tiny wrapper; keyPath 'id' → put == idempotent upsert) ────────
  let _dbp = null;
  function db() {
    if (_dbp) return _dbp;
    _dbp = new Promise(function (res, rej) {
      let req;
      try { req = indexedDB.open(DB_NAME, 1); } catch (e) { return rej(e); }
      req.onupgradeneeded = function () {
        const d = req.result;
        if (!d.objectStoreNames.contains(STORE)) d.createObjectStore(STORE, { keyPath: 'id' });
      };
      req.onsuccess = function () { res(req.result); };
      req.onerror = function () { rej(req.error); };
    });
    return _dbp;
  }
  function idbAll() {
    return db().then(function (d) {
      return new Promise(function (res) {
        try {
          const r = d.transaction(STORE, 'readonly').objectStore(STORE).getAll();
          r.onsuccess = function () { res(r.result || []); };
          r.onerror = function () { res([]); };
        } catch (e) { res([]); }
      });
    }).catch(function () { return []; });
  }
  function idbPutMany(recs) {
    if (!recs || !recs.length) return Promise.resolve();
    return db().then(function (d) {
      return new Promise(function (res) {
        try {
          const tx = d.transaction(STORE, 'readwrite'), os = tx.objectStore(STORE);
          recs.forEach(function (r) { if (r && r.id) os.put(r); });
          tx.oncomplete = function () { res(); };
          tx.onerror = function () { res(); };
        } catch (e) { res(); }
      });
    }).catch(function () {});
  }

  // ── Legacy localStorage aggregate (unchanged shape; this-device only) ────────
  function legacyRead() { try { return JSON.parse(localStorage.getItem(USAGE_KEY) || '{}') || {}; } catch (e) { return {}; } }
  function legacyWrite(log) { try { localStorage.setItem(USAGE_KEY, JSON.stringify(log)); } catch (e) {} }
  function legacyMark(app) {
    const log = legacyRead(); log.v = 1;
    const bucket = (log[app] || (log[app] = {})), day = hcDayKey();
    if (!bucket[day]) bucket[day] = 1;   // NON-clobbering: never overwrite an accumulated { s, n } with a flag
    legacyWrite(log);
  }
  function legacyDuration(app, secs) {
    const log = legacyRead(); log.v = 1;
    const bucket = (log[app] || (log[app] = {})), day = hcDayKey();
    const cur = bucket[day], rec = (cur && typeof cur === 'object') ? cur : { s: 0, n: 0 };
    rec.s += secs; rec.n += 1; bucket[day] = rec;
    legacyWrite(log);
  }

  // ── Record append + push ─────────────────────────────────────────────────────
  function putRecord(rec) {
    idbPutMany([rec]);
    if (window.HCSync) HCSync.pushLogRecord(SYNC_KEY, rec);   // no-op until sync is unlocked + armed
  }

  // Mark the day active (no duration) — e.g. cooking, a climb edit, session start.
  // Deterministic id per (device, app, day) → idempotent, one flag row per day.
  function mark(app) {
    if (!app) return;
    legacyMark(app);
    const day = hcDayKey(), dev = deviceId();
    putRecord({ id: dev + ':' + app + ':' + day + ':f', device: dev, app: app, day: day, s: 0, n: 0, ts: Date.now() });
  }

  // Record a completed session's duration. Unique id → appends and sums.
  function addDuration(app, secs) {
    if (!app) return;
    secs = Math.round(Number(secs) || 0);
    if (secs <= 0 || secs > 21600) return;   // ignore nothing / a stuck tab (>6h)
    legacyDuration(app, secs);
    const day = hcDayKey(), dev = deviceId();
    putRecord({ id: dev + ':' + app + ':' + day + ':' + rid(), device: dev, app: app, day: day, s: secs, n: 1, ts: Date.now() });
  }

  // ── One-time backfill: existing localStorage history → per-device-day records.
  // Runs at most once per device (guarded). Must run BEFORE any new session that
  // day so a day's pre-upgrade total is captured once as a `:h` record and new
  // sessions add their own rows — no double counting. Historical granularity is
  // per-day (that's all the legacy aggregate held); new activity is per-session.
  function backfill() {
    let done = null;
    try { done = localStorage.getItem(BACKFILL_KEY); } catch (e) { return Promise.resolve(); }
    if (done) return Promise.resolve();
    const log = legacyRead(), dev = deviceId(), recs = [];
    Object.keys(log).forEach(function (app) {
      if (app === 'v' || !log[app] || typeof log[app] !== 'object') return;
      Object.keys(log[app]).forEach(function (day) {
        const val = log[app][day];
        const s = (val && typeof val === 'object' && typeof val.s === 'number') ? val.s : 0;
        const n = (val && typeof val === 'object' && typeof val.n === 'number') ? val.n : 0;
        recs.push({ id: dev + ':' + app + ':' + day + ':h', device: dev, app: app, day: day, s: s, n: n, ts: 0 });
      });
    });
    return idbPutMany(recs).then(function () {
      try { localStorage.setItem(BACKFILL_KEY, String(Date.now())); } catch (e) {}
      if (window.HCSync && recs.length) recs.forEach(function (r) { HCSync.pushLogRecord(SYNC_KEY, r); });
    });
  }

  // ── Aggregate for the hub: sum s and n across every record, per app+day. ─────
  // Returns { app: { 'YYYY-MM-DD': { s, n } } } summed across all devices.
  function aggregate() {
    return idbAll().then(function (recs) {
      const out = {};
      recs.forEach(function (r) {
        if (!r || !r.app || !r.day) return;
        const a = (out[r.app] || (out[r.app] = {}));
        const c = (a[r.day] || (a[r.day] = { s: 0, n: 0 }));
        c.s += r.s || 0; c.n += r.n || 0;
      });
      return out;
    });
  }

  // ── Register the sync store (idempotent per page; safe if HCSync absent). ────
  function register() {
    if (!window.HCSync || api._registered) return;
    api._registered = true;
    HCSync.registerStore({
      key: SYNC_KEY, kind: 'log',
      readAll: function () { return idbAll(); },
      writeMany: function (recs) {
        return idbPutMany(recs).then(function () { if (typeof api.onMerge === 'function') { try { api.onMerge(); } catch (e) {} } });
      },
      recordId: function (r) { return r.id; },
    });
  }

  const api = {
    hcDayKey: hcDayKey,
    mark: mark,
    addDuration: addDuration,
    aggregate: aggregate,
    register: register,
    onMerge: null,          // hub sets this to re-render when a remote pull merges records
    ready: null,            // resolves once this device's history is migrated into records
    SYNC_KEY: SYNC_KEY,
    _registered: false,
  };
  window.HCUsage = api;

  // Auto-wire: register the store (before the app's HCSync.init pulls), then
  // migrate this device's existing history into records exactly once. Readers
  // (the hub) can await `ready` so the first aggregate isn't missing old days.
  register();
  api.ready = backfill();
})();
