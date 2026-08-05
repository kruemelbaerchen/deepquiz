// DeepQuiz service worker — deliberately NETWORK-FIRST.
// The app ships fixes often; an aggressive cache would pin friends to stale
// versions (we already fight the browser cache). So: always try the network,
// fall back to the last cached copy only when offline. Supabase and CDN
// requests are cross-origin and pass through untouched.
const CACHE = 'dq-v1';

self.addEventListener('install', e => { self.skipWaiting(); });

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // supabase / CDN: straight to network
  e.respondWith(
    fetch(req).then(res => {
      if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req))
  );
});
