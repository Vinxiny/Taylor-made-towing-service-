const CACHE = "tmtn-v1";
const SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/logo.png",
  "./icons/apple-touch.png",
  "./photos/bmw-dollies-front.jpg",
  "./photos/bmw-dollies-headon.jpg",
  "./photos/edge-roadside.jpg",
  "./photos/truck-sedan-hills.jpg",
  "./photos/gmc-residential.jpg",
  "./photos/truck-night.jpg",
  "./photos/bmw-m2-night.jpg",
  "./photos/worker-dollies.jpg",
  "./photos/edge-highway.jpg",
  "./photos/truck-logo-sunny.jpg",
  "./photos/truck-black-car.jpg",
  "./photos/truck-night-front.jpg",
  "./photos/truck-logo-side.jpg"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return c.addAll(SHELL);
    }).then(function () {
      return self.skipWaiting();
    }).catch(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) {
        return caches.delete(k);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  var url = new URL(e.request.url);
  if (e.request.mode === "navigate") {
    e.respondWith(
      caches.match("./index.html").then(function (cached) {
        var net = fetch(e.request).then(function (r) {
          if (r && r.ok) {
            var clone = r.clone();
            caches.open(CACHE).then(function (c) { c.put("./index.html", clone); });
          }
          return r;
        }).catch(function () {
          return cached || caches.match("./index.html");
        });
        return cached || net;
      })
    );
    return;
  }
  // Same-origin: cache-first for shell + photos
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(e.request).then(function (cached) {
        if (cached) return cached;
        return fetch(e.request).then(function (r) {
          if (r && r.ok) {
            var clone = r.clone();
            caches.open(CACHE).then(function (c) { c.put(e.request, clone); });
          }
          return r;
        }).catch(function () {
          return cached;
        });
      })
    );
  }
});
