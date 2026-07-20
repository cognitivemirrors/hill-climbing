/* Hill Climbing — agent interface (window.HC).
   One symmetric programmatic surface for humans and LLM agents. Every action
   routes through the same internal function the UI handler calls (same
   validation, same sync marking); export/import move raw store contents
   verbatim, so either party can seed history — timestamps and ids included.
   Nothing here touches the network, and nothing records where a write came
   from: a snapshot produced through this interface is indistinguishable from
   one produced through the UI. That symmetry is the point (see REQUIREMENTS
   §1.4). Apps call HC.register(manifest) at the end of their main script so
   action handlers close over internal functions.
   Load order: classic script, after hc-sync.js / hc-usage.js. */
(function () {
  'use strict';
  if (window.HC) return;

  let manifest = null;

  function stores() { return (manifest && manifest.stores) || []; }

  function findStore(key) {
    return stores().find((s) => s.key === key) || null;
  }

  function parseMaybe(raw) {
    if (raw === null) return null;
    try { return JSON.parse(raw); } catch (e) { return raw; }
  }

  function actionDescriptors() {
    const acts = (manifest && manifest.actions) || {};
    return Object.keys(acts).map((name) => ({
      name,
      description: acts[name].description || '',
      params: acts[name].params || {},
    }));
  }

  window.HC = {
    interface: 1,

    register(m) { manifest = m; },

    describe() {
      if (!manifest) return null;
      return {
        interface: 1,
        app: manifest.app,
        version: manifest.version,
        title: manifest.title || '',
        description: manifest.description || '',
        stores: stores().map((s) => ({
          key: s.key,
          kind: s.kind,
          description: s.description || '',
          sensitivity: s.sensitivity || 'practice',
          schema: s.schema || null,
          synced: !!s.syncKey || !!s.synced,
          importable: s.kind === 'localStorage' ? s.importable !== false : !!s.write,
        })),
        actions: actionDescriptors(),
        urlParams: manifest.urlParams || null,
        notes: manifest.notes || null,
      };
    },

    /* Parsed-for-comprehension snapshot. Stores may provide a custom read()
       (IndexedDB, or trimmed views — e.g. Reflect omits raw photo bytes);
       pass {full: true} for untrimmed records. */
    read(key, opts) {
      if (!manifest) return Promise.resolve(null);
      const list = key ? [findStore(key)].filter(Boolean) : stores();
      const out = {};
      return Promise.all(list.map((s) =>
        Promise.resolve(s.read ? s.read(opts || {}) : parseMaybe(localStorage.getItem(s.key)))
          .then((v) => { out[s.key] = v; })
      )).then(() => (key ? out[key] : out));
    },

    /* Byte-faithful envelope. localStorage stores carry the raw string
       verbatim; IndexedDB stores carry full records (tombstones included). */
    export() {
      if (!manifest) return Promise.resolve(null);
      const out = {};
      return Promise.all(stores().map((s) => {
        if (s.kind === 'localStorage') {
          out[s.key] = { kind: 'localStorage', raw: localStorage.getItem(s.key) };
          return Promise.resolve();
        }
        const reader = s.exportRead || s.read;
        return Promise.resolve(reader ? reader({ full: true }) : null)
          .then((records) => { out[s.key] = { kind: 'idb', records }; });
      })).then(() => ({
        format: 'hc-export',
        interface: 1,
        app: manifest.app,
        version: manifest.version,
        exportedAt: new Date().toISOString(),
        stores: out,
      }));
    },

    /* Verbatim restore/seed. Destructive by design — requires {confirm: true}.
       localStorage values are written exactly as exported (then sync-marked
       via the same queueBlobPush a native save makes); IndexedDB records go
       through the store's write(), which persists + sync-marks identically
       to a native save. Reloads afterwards so the app rehydrates through its
       normal boot path — otherwise stale in-memory state would clobber the
       import on its next save. Pass {reload: false} to manage that yourself. */
    import(payload, opts) {
      opts = opts || {};
      if (opts.confirm !== true) {
        return Promise.reject(new Error('HC.import replaces stored state; call with {confirm: true} once the person has approved it.'));
      }
      if (!manifest) return Promise.reject(new Error('No app registered.'));
      if (!payload || payload.format !== 'hc-export') {
        return Promise.reject(new Error('Not an hc-export payload.'));
      }
      if (payload.app !== manifest.app) {
        return Promise.reject(new Error('Payload is for "' + payload.app + '", this page is "' + manifest.app + '".'));
      }
      const written = [], skipped = [];
      const work = Object.keys(payload.stores || {}).map((key) => {
        const s = findStore(key);
        const entry = payload.stores[key] || {};
        if (!s) { skipped.push(key); return Promise.resolve(); }
        if (s.kind === 'localStorage' && entry.kind === 'localStorage' && s.importable !== false) {
          if (entry.raw === null || entry.raw === undefined) localStorage.removeItem(key);
          else localStorage.setItem(key, entry.raw);
          if (s.syncKey && window.HCSync && HCSync.queueBlobPush) HCSync.queueBlobPush(s.syncKey);
          if (s.afterWrite) s.afterWrite();
          written.push(key);
          return Promise.resolve();
        }
        if (s.kind === 'idb' && entry.kind === 'idb' && s.write) {
          return Promise.resolve(s.write(entry.records || []))
            .then(() => { written.push(key); });
        }
        skipped.push(key);
        return Promise.resolve();
      });
      return Promise.all(work).then(() => {
        const result = { written, skipped, reloading: opts.reload !== false };
        /* A blob push debounces 1.5s and won't survive the reload, but
           queueBlobPush bumps the store's clock immediately, so the next
           pullAll reconcile pushes it — same as closing the tab mid-edit. */
        if (opts.reload !== false) setTimeout(() => location.reload(), 250);
        return result;
      });
    },

    actions() { return actionDescriptors(); },

    invoke(name, params) {
      if (!manifest || !manifest.actions || !manifest.actions[name]) {
        return Promise.reject(new Error('Unknown action "' + name + '". HC.actions() lists what this app offers.'));
      }
      try {
        return Promise.resolve(manifest.actions[name].handler(params || {}));
      } catch (e) {
        return Promise.reject(e);
      }
    },
  };
})();
