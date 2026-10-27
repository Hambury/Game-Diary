// Game Diary service worker: lets the app load offline.
// Bump CACHE_VERSION whenever you change index.html to be sure old copies are replaced.
const CACHE_VERSION = 'game-diary-v2';
const LOCAL_FILES = ['./', './index.html', './manifest.webmanifest',
                     './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png'];
const JSZIP_URL = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_VERSION);
    await cache.addAll(LOCAL_FILES);
    // JSZip comes from a CDN; store a copy so export/import works offline too.
    try {
      const res = await fetch(JSZIP_URL, { mode: 'no-cors' });
      await cache.put(JSZIP_URL, res);
    } catch (e) { /* offline during install: it will be cached on first online use */ }
    self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // JSZip: cache first
  if (req.url === JSZIP_URL) {
    event.respondWith((async () => {
      const cached = await caches.match(req.url);
      if (cached) return cached;
      const res = await fetch(req);
      const cache = await caches.open(CACHE_VERSION);
      cache.put(req.url, res.clone());
      return res;
    })());
    return;
  }

  // Our own files: network first (so updates arrive), fall back to cache offline
  if (url.origin === self.location.origin) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_VERSION);
      try {
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
      } catch (e) {
        const cached = await cache.match(req, { ignoreSearch: true });
        if (cached) return cached;
        if (req.mode === 'navigate') return cache.match('./index.html');
        throw e;
      }
    })());
  }
});
