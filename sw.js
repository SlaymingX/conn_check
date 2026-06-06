const CACHE = 'conncheck-v1';
const SHELL = [
  '/conn_check/',
  '/conn_check/index.html',
  '/conn_check/manifest.json',
  '/conn_check/icon-192.png',
  '/conn_check/icon-512.png',
  '/conn_check/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Network-first for probe requests (gstatic, telegram, yandex)
  const url = e.request.url;
  if (url.includes('gstatic') || url.includes('telegram') || url.includes('yandex')) {
    e.respondWith(fetch(e.request).catch(() => new Response('', { status: 503 })));
    return;
  }
  // Cache-first for app shell
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
