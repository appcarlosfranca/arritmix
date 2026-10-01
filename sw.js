self.addEventListener("install", event => {
  event.waitUntil(
    caches.open("financeflow").then(cache => {
      return cache.addAll([
        "./",
        "./index.html",
        "./app.css",
        "./styles.js"
      ]);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
