// DeepQuiz service worker — deliberately NETWORK-FIRST.
// The app ships fixes often; an aggressive cache would pin friends to stale
// versions (we already fight the browser cache). So: always try the network,
// fall back to the last cached copy only when offline. Supabase and CDN
// requests are cross-origin and pass through untouched.
const CACHE = 'dq-v2';

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

  // "Network first" is not enough on its own: a plain fetch() still honours the
  // browser's HTTP cache, and GitHub Pages allows 10 minutes of caching. That meant
  // a fresh upload could keep serving the old app for minutes. Revalidate instead
  // (cheap: the server answers 304 when nothing changed).
  const revalidated = new Request(url.pathname + url.search, {
    cache: 'no-cache',
    credentials: 'same-origin'
  });

  e.respondWith(
    fetch(revalidated).then(res => {
      if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req))
  );
});
