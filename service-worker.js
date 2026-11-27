const STATIC_CACHE = "sunblock-static-v3";
const DATA_CACHE = "sunblock-api-v3";

const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./admin.html",
  "./manifest.json",
  "./css/styles.css",
  "./js/api.js",
  "./js/timer.js",
  "./js/encyclopedia.js",
  "./js/app.js",
  "./assets/icon.svg",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/ex-hang20.webp",
  "./assets/ex-invrow.webp",
  "./assets/ex-warm-hip.webp",
  "./assets/ex-warm-thoracic.webp"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  const validCaches = new Set([STATIC_CACHE, DATA_CACHE]);
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => (validCaches.has(key) ? null : caches.delete(key)))
      )
    )
  );
  self.clients.claim();
});

function isAppsScriptRequest(url) {
  return (
    url.hostname === "script.google.com" ||
    url.hostname === "script.googleusercontent.com"
  );
}

async function networkFirst(request) {
  const cache = await caches.open(DATA_CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw err;
  }
}

async function cacheFirst(request, url) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response && response.ok && response.type === "basic") {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    if (request.mode === "navigate") {
      const fallbackUrl = url.pathname.endsWith("admin.html")
        ? "./admin.html"
        : "./index.html";
      const fallback = await caches.match(fallbackUrl);
      if (fallback) return fallback;
    }
    throw err;
  }
}

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  if (isAppsScriptRequest(url)) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(event.request, url));
  }
});
