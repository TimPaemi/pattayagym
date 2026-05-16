const CACHE_NAME = 'pattaya-gym-v237-20260516';
const CORE_ASSETS = [
  '/styles.css?v=237',
  '/venue.css?v=237',
  '/app.js?v=237',
  '/app.bundle.js?v=237',
  '/data.js?v=237',
  '/share.js?v=237',
  '/compare.js?v=237',
  '/favorites.js?v=237',
  '/recent.js?v=237',
  '/shortcuts.js?v=237',
  '/site-ui.js?v=237',
  '/analytics.js?v=237',
  '/og-image.png',
  '/manifest.json',
  '/icon-180.png',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_ASSETS.map(url => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => response)
        .catch(() => caches.match(request).then(cached => cached || caches.match('/')))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      const refresh = fetch(request).then(response => {
        if (response && response.ok && isCacheableAsset(url)) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      }).catch(() => cached);
      return cached || refresh;
    })
  );
});

function isCacheableAsset(url) {
  return url.searchParams.has('v') ||
    /^\/(?:og|icons?)\//.test(url.pathname) ||
    /\.(?:png|jpg|jpeg|webp|svg|ico|css|js|json|woff2?)$/i.test(url.pathname);
}
