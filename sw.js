const CACHE_NAME = "wordfreak-v58";
const READER_DOCUMENT_CACHE_NAME = "wordfreak-reader-documents-v3";
const ASSETS = [
  "./",
  "./index.html",
  "./index.html?reader-engine=1",
  "./improved.html",
  "./improved.css?v=1",
  "./improved.js?v=2",
  "./desktop.html",
  "./desktop.css?v=1",
  "./styles.css?v=33",
  "./app.js?v=57",
  "./piper-worker.js?v=1",
  "./manifest.webmanifest",
  "./assets/icon.svg",
  "./data/ru-core.json",
  "./data/fa-core.json",
  "./data/es-core.json",
  "./data/fr-core.json",
  "./data/hi-core.json",
  "./data/ja-core.json",
  "./data/ko-core.json",
  "./data/en-vernacular.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key !== CACHE_NAME && key !== READER_DOCUMENT_CACHE_NAME)
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || event.request.method !== "GET") {
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      });
    })
  );
});
