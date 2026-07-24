// File: service-worker.js
const CACHE_NAME = 'csif-heatsafe-v1';
const APP_SHELL = ['./', './index.html', './css/styles.css', './js/app.js', './js/utils.js', './js/wbgt.js', './js/weather.js', './js/aemet.js', './js/gps.js', './js/history.js', './js/charts.js', './js/pdf.js', './js/pwa.js', './manifest.json', './img/logo.png', './img/icon-192.png', './img/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') {
    return;
  }
  if (request.url.startsWith('http') && !request.url.startsWith(self.location.origin)) {
    return;
  }
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).catch(() => caches.match('./index.html')))
  );
});
