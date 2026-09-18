const CACHE_VERSION = 'arabic-language-lab-exercise-engine-v12.3-2026-09-18-dammatan-shadda-kasra';
const CORE = [
  './', './index.html', './manifest.webmanifest', './LICENSE.txt',
  './assets/css/tailwind.css', './assets/css/app.css',
  './assets/js/app.js', './assets/js/pwa.js', './assets/js/ui/board-piece-view.js',
  './assets/js/core/arabic-text.js', './assets/js/core/arabic-identity.js', './assets/js/core/ligature-engine.js', './assets/js/core/board-piece.js', './assets/js/core/board-state.js', './assets/js/core/board-history.js', './assets/js/core/board-commands.js', './assets/js/core/sound-engine.js', './assets/js/core/confetti-lite.js',
  './assets/js/core/exercise-engine.js', './assets/js/core/phrase-exercise-engine.js', './assets/js/core/platform-profile.js', './assets/js/core/platform-adapter.js', './assets/js/core/harakat-renderer.js',
  './assets/icons/icon-192.png', './assets/icons/icon-512.png', './assets/icons/apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_VERSION).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // Do not proxy, cache, or modify any cross-origin request.
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(async response => {
          if (response.ok && response.type === 'basic') {
            const cache = await caches.open(CACHE_VERSION);
            await cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  const networkFirst = ['script', 'style', 'worker'].includes(request.destination)
    || /\.(?:json|webmanifest)$/i.test(url.pathname);

  if (networkFirst) {
    event.respondWith(
      fetch(request)
        .then(async response => {
          if (response.ok && response.type === 'basic') {
            const cache = await caches.open(CACHE_VERSION);
            await cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(async cached => {
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok && response.type === 'basic') {
        const cache = await caches.open(CACHE_VERSION);
        await cache.put(request, response.clone());
      }
      return response;
    })
  );
});
