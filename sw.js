/* Hill Climbing — service worker.
   Bump CACHE_VERSION on every deploy so clients pull fresh HTML.
   Strategy: network-first for page navigations (so version bumps reach
   users immediately when online), cache-first for static assets, and a
   full offline fallback to the cached app shell when the network is gone. */
const CACHE_VERSION = 'hc-v2.24';
const CACHE_NAME = `hill-climbing-${CACHE_VERSION}`;

const APP_SHELL = [
  '/',
  '/index.html',
  '/meditate.html',
  '/breathe.html',
  '/reflect.html',
  '/nourish.html',
  '/savor.html',
  '/levity.html',
  '/climb.html',
  '/train.html',
  '/council.html',
  '/companion.html',
  '/erp.html',
  '/echo.html',
  '/garden.html',
  '/hc-sync.js',
  '/hc-usage.js',
  '/hc-sync-chip.js',
  '/manifest.webmanifest',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/favicon.ico',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  // Only handle same-origin GETs; let everything else hit the network.
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) {
    return;
  }

  // Page navigations: network-first, fall back to cache, then to the hub.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/index.html')))
    );
    return;
  }

  // Static assets: cache-first, revalidate in the background.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request).then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      }).catch(() => cached);
      return cached || network;
    })
  );
});

/* ── Web Push ───────────────────────────────────────────────────────────
   A scheduled sender (GitHub Actions) posts a VAPID-signed message; we show
   it as a notification. Payload is JSON: { title, body, url, tag }. These
   reminders are user-initiated — the person turned them on in the app. */
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; }
  catch (e) { data = { body: event.data && event.data.text() }; }

  const title = data.title || 'Hill Climbing';
  const body  = data.body  || 'A moment to come back to stillness.';
  const url   = data.url   || '/';

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: data.tag || 'hc-reminder',
      data: { url },
    })
  );
});

// Tapping a reminder focuses an open window (navigating it) or opens the app.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) { client.navigate(url); return client.focus(); }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
