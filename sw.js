const CACHE = "tadabbur-shell-v2";
const FILES = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/data.js",
  "./js/app.js",
  "./manifest.webmanifest"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", e =>
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  )
);

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(c =>
      c ||
      fetch(e.request).then(r => {
        if (r.ok && new URL(e.request.url).origin === self.location.origin) {
          caches.open(CACHE).then(cache => cache.put(e.request, r.clone()));
        }
        return r;
      }).catch(() => caches.match("./index.html"))
    )
  );
});