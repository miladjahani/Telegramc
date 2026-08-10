const CACHE = 'tgdrive-v4';
const CORE = ['index.html', 'manifest.webmanifest', 'icon.svg', 'icon-maskable.svg'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE.map((p) => new URL(p, self.registration.scope).href))).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== CACHE).map((x) => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then((r) => { const c = r.clone(); caches.open(CACHE).then((x) => x.put(req, c)); return r; }).catch(() => caches.match(req).then((r) => r || caches.match(new URL('index.html', self.registration.scope).href))));
    return;
  }
  e.respondWith(caches.match(req).then((c) => c || fetch(req).then((r) => { if (r && r.ok) { const cp = r.clone(); caches.open(CACHE).then((x) => x.put(req, cp)); } return r; })));
});