
const CACHE = "tadabbur-shell-v3";

const FILES = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/data.js",
  "./js/quran.js",
  "./js/app.js",
  "./manifest.webmanifest"
];

// Install: cache the files required to run Tadabbur offline.
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(FILES))
      .then(() => self.skipWaiting())
  );
});

// Activate: remove outdated caches and take control.
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key.startsWith("tadabbur-shell-") && key !== CACHE)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch: serve pages and assets from cache when possible.
self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Let external requests, such as Google Fonts, use normal networking.
  if (url.origin !== self.location.origin) return;

  // Navigation: try the network first, then show the cached app offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Assets: use the cache first, then the network.
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request).then(response => {
        if (response.ok) {
          const copy = response.clone();

          caches.open(CACHE).then(cache => {
            cache.put(request, copy);
          });
        }

        return response;
      });
    })
  );
});
