const CACHE = 'sharenode-v3';
const CORE = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
const EXTERNAL = [
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/peerjs/1.5.4/peerjs.min.js',
  'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js'
];

// Installation : chaque fichier est mis en cache séparément, un échec isolé n'annule plus tout
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      Promise.allSettled([...CORE, ...EXTERNAL].map((url) => cache.add(url)))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE && k !== 'sn-share').map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  const ours = url.origin === location.origin || ['cdnjs.cloudflare.com','cdn.jsdelivr.net'].includes(url.hostname);
  if (req.method === 'POST' && url.origin === location.origin && url.pathname.endsWith('/share')) {
    event.respondWith((async () => {
      const files = (await req.formData()).getAll('files');
      const c = await caches.open('sn-share');
      for (const k of await c.keys()) await c.delete(k);
      let i = 0;
      for (const f of files) {
        await c.put('/shared/' + i++, new Response(f, { headers: { 'X-Name': encodeURIComponent(f.name), 'Content-Type': f.type || 'application/octet-stream' } }));
      }
      return Response.redirect(new URL('./index.html?shared=1', self.registration.scope).href, 303);
    })());
    return;
  }
  if (req.method !== 'GET' || !ours) return; // le serveur PeerJS n'est pas intercepté

  // Pages : réseau d'abord (mises à jour immédiates), cache en secours hors-ligne
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
    );
    return;
  }

  // Autres fichiers : cache d'abord, puis réseau
  event.respondWith(
    caches.match(req).then((cached) =>
      cached ||
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => new Response('', { status: 504, statusText: 'Hors-ligne' }))
    )
  );
});
