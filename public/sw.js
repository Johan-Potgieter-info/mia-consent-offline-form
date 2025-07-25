
self.addEventListener('install', (event) => {
  console.log('[SW] Installing – clearing old cache');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating – cleaning all caches');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
