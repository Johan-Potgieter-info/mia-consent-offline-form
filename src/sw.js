
// Required for Workbox injection
self.__WB_MANIFEST;

const CACHE_NAME = 'mia-consent-cache-v8';
const BASE_PATH = self.location.pathname.includes('/mia-consent-offline-form/') 
  ? '/mia-consent-offline-form/' 
  : '/';

const OFFLINE_FILES = [
  BASE_PATH,
  `${BASE_PATH}index.html`,
  `${BASE_PATH}terms.html`,
  `${BASE_PATH}manifest.json`,
  `${BASE_PATH}lovable-uploads/9a0a9907-375b-48ce-a1bc-8009bc27059c.png`
];

self.addEventListener('install', (event) => {
  console.log('[SW] Installing with base path:', BASE_PATH);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(
        OFFLINE_FILES.map((url) =>
          fetch(url).then((res) => {
            if (!res.ok) {
              console.warn(`[SW] Failed to fetch ${url}:`, res.status);
              return Promise.resolve();
            }
            return cache.put(url, res.clone());
          }).catch((err) => {
            console.warn(`[SW] Error caching ${url}:`, err);
            return Promise.resolve();
          })
        )
      )
    ).catch((err) => {
      console.error('[SW] Precache failed:', err);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activated with base path:', BASE_PATH);
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => key !== CACHE_NAME && caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (!url.protocol.startsWith("http")) return;
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

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-consent') {
    console.log('[SW] Background sync triggered for consent data');
    event.waitUntil(Promise.resolve());
  }
});

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-consent-data') {
    console.log('[SW] Periodic sync triggered');
    event.waitUntil(Promise.resolve());
  }
});
