const global: ServiceWorkerGlobalScope = globalThis as any;

global.addEventListener('install', (event) => {
  event.waitUntil(global.skipWaiting());
});

global.addEventListener('activate', (event) => {
  event.waitUntil(global.clients.claim());
});

global.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open('app').then((cache) =>
      cache.match(event.request.url.toString()).then((response) => {
        return response || fetch(event.request.url);
      }),
    ),
  );
});

export {};
