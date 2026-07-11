/* Hill Climbing — hc-sync-chip.js
   ────────────────────────────────────────────────────────────────────────────
   Optional, shared sync-STATUS chip. Pairs with hc-sync.js (which is kept
   deliberately DOM-free). Any app that registers a store can drop in one small,
   consistent "This device only / Syncing… / Synced" pill that links to the
   hub's account page (index.html#account) — where all sign-in, unlock, and
   passphrase management lives. Keeping this UI here, rather than copy-pasting
   ~60 lines into every practice app, means the whole suite shares one status
   affordance and one place to change it.

   climb.html predates this and wires its own menu-integrated status; it is
   intentionally left alone. This chip is for the apps that have no such menu.

   Usage (after hc-sync.js is loaded and the app's stores are registered):
       HCSyncChip.mount({ position: 'bottom-left' });
       HCSync.init({ … });

   It injects its own styles, creates its own element, and needs zero per-app
   HTML. Registered as window.HCSyncChip.
   ──────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  var HC = window.HCSync;
  if (!HC) return;                     // engine must load first; nothing to do otherwise

  var STYLE_ID = 'hc-sync-chip-style';
  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var css =
      '.hc-sync-chip{position:fixed;z-index:60;display:none;align-items:center;gap:7px;' +
      'font:500 11px/1 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;' +
      'letter-spacing:.04em;color:rgba(232,232,244,.72);text-decoration:none;' +
      'padding:6px 11px 6px 9px;border-radius:999px;white-space:nowrap;' +
      'background:rgba(18,18,30,.55);border:1px solid rgba(255,255,255,.10);' +
      '-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);' +
      'transition:opacity .3s ease,color .2s,border-color .2s;cursor:pointer;' +
      '-webkit-user-select:none;user-select:none;}' +
      '.hc-sync-chip.show{display:inline-flex;}' +
      '.hc-sync-chip:hover{color:rgba(248,248,255,.96);border-color:rgba(255,255,255,.22);opacity:1!important;}' +
      '.hc-sync-chip .hcs-dot{width:7px;height:7px;border-radius:50%;background:rgba(184,184,204,.5);flex:0 0 auto;}' +
      '.hc-sync-chip .hcs-dot.ok{background:hsl(150,48%,55%);}' +
      '.hc-sync-chip .hcs-dot.warn{background:hsl(38,80%,60%);}' +
      '.hc-sync-chip .hcs-dot.err{background:hsl(8,62%,62%);}' +
      '.hc-sync-chip .hcs-dot.busy{background:#b9a8f0;animation:hcs-pulse 1.2s ease-in-out infinite;}' +
      '@keyframes hcs-pulse{0%,100%{opacity:1;}50%{opacity:.35;}}' +
      '.hc-sync-chip.pos-bottom-left{left:16px;bottom:16px;}' +
      '.hc-sync-chip.pos-bottom-right{right:16px;bottom:16px;}' +
      '.hc-sync-chip.pos-top-left{left:16px;top:16px;}' +
      '.hc-sync-chip.pos-top-right{right:16px;top:16px;}' +
      '@media (max-width:640px){' +
      '.hc-sync-chip{font-size:10px;padding:5px 9px 5px 8px;}' +
      '.hc-sync-chip.pos-bottom-left,.hc-sync-chip.pos-bottom-right{bottom:calc(14px + env(safe-area-inset-bottom));}}';
    var el = document.createElement('style');
    el.id = STYLE_ID; el.textContent = css;
    (document.head || document.documentElement).appendChild(el);
  }

  // Map an HCSync status snapshot → what the chip should show, or null to hide.
  function view(s) {
    if (!s || s.error === 'not_configured') return null;             // sync unavailable → offer nothing
    if (s.state === 'signed_out') return { dot: '',    text: 'This device only', faded: true };
    if (s.state === 'locked')     return { dot: 'warn', text: 'Unlock to sync',  faded: false };
    // unlocked from here on
    if (s.syncing)                              return { dot: 'busy', text: 'Syncing…',      faded: false };
    if (s.error && s.error !== 'offline')       return { dot: 'err',  text: 'Sync issue',    faded: false };
    if (!s.online || s.error === 'offline')     return { dot: 'warn', text: 'Offline',       faded: false };
    return { dot: 'ok', text: 'Synced', faded: true };
  }

  function mount(opts) {
    opts = opts || {};
    if (!document.body) {                       // called before <body> exists — defer
      document.addEventListener('DOMContentLoaded', function () { mount(opts); });
      return;
    }
    injectStyle();
    var chip = document.createElement('a');
    chip.className = 'hc-sync-chip pos-' + (opts.position || 'bottom-left');
    chip.href = opts.href || 'index.html#account';
    chip.setAttribute('role', 'status');
    var dot  = document.createElement('span'); dot.className  = 'hcs-dot';
    var text = document.createElement('span'); text.className = 'hcs-text';
    chip.appendChild(dot); chip.appendChild(text);
    document.body.appendChild(chip);

    function render(s) {
      var v = view(s);
      if (!v) { chip.classList.remove('show'); return; }
      chip.classList.add('show');
      dot.className = 'hcs-dot' + (v.dot ? ' ' + v.dot : '');
      text.textContent = v.text;
      chip.style.opacity = v.faded ? '0.6' : '1';
      chip.setAttribute('aria-label', 'Sync: ' + v.text + ' — manage at the hub');
      chip.title = 'Sync: ' + v.text + ' · manage at the hub';
    }
    HC.subscribe(render);                        // fires immediately with the current status
    return { el: chip, render: render };
  }

  window.HCSyncChip = { mount: mount };
})();
