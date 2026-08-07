/**
 * sw.js — Service worker for AryterLog
 *
 * Strategy:
 *  - App shell (index.html, manifest, icons) → cache-first, so the shell
 *    loads instantly and works offline.
 *  - posts-info.json / socials.json / *.md → network-first, falling back
 *    to cache. Content changes often, so always prefer fresh data when
 *    online, but don't leave the user stranded if offline.
 *  - Everything else (fonts, marked.js CDN, etc.) → stale-while-revalidate.
 *
 * Bump CACHE_VERSION whenever the app shell changes so old caches get
 * cleared out on the next visit.
 */

const CACHE_VERSION = "aryterlog-v1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

function isDataRequest(url) {
  return (
    url.pathname.endsWith(".json") ||
    url.pathname.endsWith(".md")
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Only handle same-origin requests — let the browser deal with
  // cross-origin (Google Fonts, jsDelivr, etc.) normally.
  if (url.origin !== self.location.origin) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Network-first for post/category data — always want the freshest content.
  if (isDataRequest(url)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Cache-first for the app shell and static pages (HTML, icons, etc.)
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
