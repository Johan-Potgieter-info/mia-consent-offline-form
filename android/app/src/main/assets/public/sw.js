const CACHE_NAME = 'mia-consent-cache-v5';
const OFFLINE_FILES = [
  '/mia-consent-offline-form/',
  '/mia-consent-offline-form/index.html',
  '/mia-consent-offline-form/terms.html',
  '/mia-consent-offline-form/manifest.json',
  '/mia-consent-offline-form/icon-uploads/2741077b-1d2b-4fa2-9829-1d43a1a54427.png'
];

self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(
        OFFLINE_FILES.map((url) =>
          fetch(url).then((res) => {
            if (!res.ok) throw new Error(`Failed to fetch ${url}`);
            return cache.put(url, res.clone());
          })
        )
      )
    ).catch((err) => {
      console.error('[SW] Precache failed:', err);
    })
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

// BACKGROUND SYNC
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-consent') {
    console.log('[SW] Background sync triggered for consent data');
    // Put sync logic here, e.g., send drafts to Supabase
    event.waitUntil(Promise.resolve());
  }
});

// PERIODIC SYNC
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-consent-data') {
    console.log('[SW] Periodic sync triggered');
    // Place your daily refresh logic here if needed
    event.waitUntil(Promise.resolve());
  }
});
