const CACHE_NAME = 'mia-consent-cache-v3';
const OFFLINE_FILES = [
  '/',
  '/mia-consent-offline-form/',
  '/mia-consent-offline-form/index.html',
  '/mia-consent-offline-form/terms.html',
  '/mia-consent-offline-form/icon-uploads/2741077b-1d2b-4fa2-9829-1d43a1a54427.png',
  '/mia-consent-offline-form/manifest.json'
];

self.addEventListener('install', (event) => {
  console.log('[SW] Installing new service worker and caching offline files...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_FILES))
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activated');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => key !== CACHE_NAME && caches.delete(key)))
    )
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
