// Network first, so a reload always gets the newest files; cache is only
// the offline fallback.
const CACHE = 'kalabendu-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    (async () => {
      try {
        const res = await fetch(new Request(req.url, { cache: 'no-cache' }));
        if (res.ok) {
          const cache = await caches.open(CACHE);
          await cache.put(req.url, res.clone());
        }
        return res;
      } catch (err) {
        const hit = await caches.match(req.url);
        if (hit) return hit;
        throw err;
      }
    })(),
  );
});
