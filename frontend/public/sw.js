/* Service Worker — Tantsaha Connect (étape 9 : fonctionne hors ligne)
   - statiques (js/css/images) : d'abord le cache, puis le réseau
   - pages/navigations : réseau d'abord, repli sur le cache (app React)
   - API en GET : réseau d'abord avec repli cache (données récentes) */
const CACHE = 'tantsaha-v1';
const SHELL = ['/'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((cles) => Promise.all(cles.filter((c) => c !== CACHE).map((c) => caches.delete(c))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;              // les écritures passent par la file d'attente
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   // externe (Open-Meteo, etc.) : réseau

  const statique = ['script', 'style', 'image', 'font'].includes(req.destination);

  if (statique) {
    // cache d'abord (les fichiers Vite ont un nom unique)
    e.respondWith(
      caches.match(req).then((r) => r || fetch(req).then((rep) => {
        const copie = rep.clone();
        caches.open(CACHE).then((c) => c.put(req, copie));
        return rep;
      })),
    );
    return;
  }

  // pages et API : réseau d'abord, repli sur le cache
  e.respondWith(
    fetch(req)
      .then((rep) => {
        if (rep.ok) {
          const copie = rep.clone();
          caches.open(CACHE).then((c) => c.put(req, copie));
        }
        return rep;
      })
      .catch(() =>
        caches.match(req).then((r) => r || caches.match('/'))),   // app hors ligne
  );
});
