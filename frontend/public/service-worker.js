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
          return Promise.resolve();
        })
      );
    })
  );
});

// Gestione evento push (notifiche)
self.addEventListener('push', (event) => {
  let notificationData = {};
  
  try {
    if (event.data) {
      try {
        notificationData = event.data.json();
      } catch (e) {
        try {
          notificationData = {
            title: 'Notifica Memory Grove',
            body: event.data.text(),
            icon: '/icons/icon-152x152.png'
          };
        } catch (textError) {
          notificationData = {
            title: 'Notifica Memory Grove',
            body: 'Nuova notifica',
            icon: '/icons/icon-152x152.png'
          };
        }
      }
    } else {
      notificationData = {
        title: 'Notifica Memory Grove',
        body: 'Nuova notifica',
        icon: '/icons/icon-152x152.png'
      };
    }
  } catch (error) {
    console.error('Errore nella gestione dei dati push:', error);
    notificationData = {
      title: 'Notifica Memory Grove',
      body: 'Nuova notifica',
      icon: '/icons/icon-152x152.png'
    };
  }
  
  const options = {
    body: notificationData.body || 'Hai ricevuto una notifica',
    icon: notificationData.icon || '/icons/icon-152x152.png',
    badge: '/icons/icon-96x96.png',
    data: {
      url: notificationData.url || '/'
    }
  };
  
  // Utilizziamo il vibrate solo se supportato (non su iOS)
  if ('vibrate' in navigator) {
    options.vibrate = [100, 50, 100];
  }
  
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
  
  const urlToOpen = (event.notification.data && event.notification.data.url) ? 
    event.notification.data.url : '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // Verifica se c'è già una finestra/tab aperta con la nostra app
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Se non c'è una finestra aperta, aprine una nuova
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
        
        return Promise.resolve();
      })
  );
});

// Intercettazione delle richieste
self.addEventListener('fetch', (event) => {
  if (!event || !event.request) {
    return;
  }
  
  // Per migliorare la compatibilità con Safari, evitiamo di intercettare richieste non HTTP/HTTPS
  if (!event.request.url.startsWith('http')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone della richiesta
        const fetchRequest = event.request.clone();
        
        // Fetch dalla rete con gestione errori migliorata per Safari
        return fetch(fetchRequest)
          .then((response) => {
            // Verifica se abbiamo ricevuto una risposta valida
            if (!response || response.status !== 200) {
              return response;
            }
            
            // La verifica del tipo 'basic' causa problemi su alcuni browser, verifichiamo in modo più sicuro
            const isBasicType = response.type === 'basic' || 
                               response.url.indexOf(self.location.origin) === 0;
            
            if (!isBasicType) {
              return response;
            }

            // Clone della risposta
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              })
              .catch(err => console.error('Errore nel salvataggio nella cache:', err));

            return response;
          })
          .catch(error => {
            console.error('Errore fetch:', error);
            // Tenta di recuperare una risposta offline per le pagine HTML
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            throw error;
          });
      })
  );
}); 