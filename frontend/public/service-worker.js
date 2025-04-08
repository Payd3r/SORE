const CACHE_NAME = 'memory-grove-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-152x152.png',
  '/splash.png'
];

// Installazione del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Attivazione del Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Gestione evento push (notifiche)
self.addEventListener('push', (event) => {
  let notificationData = {};
  
  try {
    notificationData = event.data.json();
  } catch (e) {
    notificationData = {
      title: 'Notifica Memory Grove',
      body: event.data ? event.data.text() : 'Nuova notifica',
      icon: '/icons/icon-152x152.png'
    };
  }
  
  const options = {
    body: notificationData.body || 'Hai ricevuto una notifica',
    icon: notificationData.icon || '/icons/icon-152x152.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [100, 50, 100],
    data: {
      url: notificationData.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(
      notificationData.title || 'Memory Grove',
      options
    )
  );
});

// Gestione click sulla notifica
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // Verifica se c'è già una finestra/tab aperta con la nostra app
        const hadWindowToFocus = clientList.some((client) => {
          if (client.url === event.notification.data.url && 'focus' in client) {
            client.focus();
            return true;
          }
          return false;
        });
        
        // Se non c'è una finestra aperta, aprine una nuova
        if (!hadWindowToFocus && clients.openWindow) {
          return clients.openWindow(event.notification.data.url || '/');
        }
      })
  );
});

// Intercettazione delle richieste
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone della richiesta
        const fetchRequest = event.request.clone();

        // Fetch dalla rete
        return fetch(fetchRequest).then(
          (response) => {
            // Verifica se abbiamo ricevuto una risposta valida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone della risposta
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
}); 