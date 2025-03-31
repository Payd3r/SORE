/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = 'memory-grove-cache-v1';
const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
];

// Installazione del Service Worker
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        STATIC_RESOURCES.map(resource => 
          cache.add(resource).catch(error => {
            console.warn(`Impossibile cacheare ${resource}:`, error);
          })
        )
      );
    })
  );
});

// Attivazione del Service Worker
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});

// Intercettazione delle richieste
self.addEventListener('fetch', (event: FetchEvent) => {
  // Ignora le richieste non GET
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Ritorna la risposta dalla cache se esiste
      if (response) {
        return response;
      }
      // Altrimenti, fai la richiesta alla rete
      return fetch(event.request).then((networkResponse) => {
        // Salva la risposta nella cache
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      });
    })
  );
}); 