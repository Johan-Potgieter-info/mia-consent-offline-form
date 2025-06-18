
// PWA Builder Service Worker with Workbox - Combined offline experience
const CACHE = "mia-consent-offline-page-v3";

importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

// Offline fallback page
const offlineFallbackPage = "offline.html";

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener('install', async (event) => {
  console.log('🔧 Mia Healthcare PWA Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => {
        return cache.add(offlineFallbackPage).catch(err => {
          console.log('Could not cache offline page:', err);
        });
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('✅ Mia Healthcare PWA Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE) {
            console.log('🧹 Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

// Cache strategy for all routes with GitHub Pages base path handling
workbox.routing.registerRoute(
  new RegExp('.*'),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: CACHE,
    plugins: [{
      cacheKeyWillBeUsed: async ({ request }) => {
        // Normalize URLs for consistent caching
        const url = new URL(request.url);
        // Remove base path for caching consistency
        if (url.pathname.startsWith('/mia-consent-offline-form-50/')) {
          url.pathname = url.pathname.replace('/mia-consent-offline-form-50', '');
        }
        return url.href;
      }
    }]
  })
);

// Enhanced fetch handler with offline fallback
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const preloadResp = await event.preloadResponse;

        if (preloadResp) {
          return preloadResp;
        }

        const networkResp = await fetch(event.request);
        return networkResp;
      } catch (error) {
        console.log('🌐 Network failed, serving offline page');
        const cache = await caches.open(CACHE);
        const cachedResp = await cache.match(offlineFallbackPage);
        return cachedResp || new Response('Offline - Please check your connection', {
          status: 200,
          headers: { 'Content-Type': 'text/html' }
        });
      }
    })());
  }
});

console.log('🚀 Mia Healthcare PWA Service Worker loaded with Workbox v5.1.2');
