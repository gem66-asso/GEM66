// Service Worker GEM 66 — cache simple pour mode hors-ligne
const CACHE_NAME = 'gem66-v1';
const CORE_ASSETS = [
  '/GEM66/',
  '/GEM66/index.html',
  '/GEM66/manifest.webmanifest',
  '/GEM66/icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  // Network-first pour la navigation, fallback cache
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('/GEM66/index.html'))
    );
    return;
  }
  // Cache-first pour les assets statiques
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
