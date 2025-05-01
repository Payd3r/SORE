/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

// Definizione delle strategie di cache
const CACHE_STRATEGIES = {
  STATIC: 'static',        // Per risorse statiche (HTML, CSS, JS, immagini)
  DYNAMIC: 'dynamic',      // Per risorse dinamiche (API calls)
  NETWORK_FIRST: 'network-first', // Per dati che devono essere sempre aggiornati
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate' // Per risorse che possono essere mostrate da cache ma aggiornate in background
} as const;

// Configurazione delle cache
const CACHE_CONFIG = {
  STATIC: {
    name: 'memory-grove-static-v1',
    urls: [
      '/',
      '/index.html',
      '/manifest.json',
      '/favicon.ico',
      '/offline.html',
      '/icons/icon-152x152.png',
      '/splash.png'
    ]
  },
  DYNAMIC: {
    name: 'memory-grove-dynamic-v1',
    maxAge: 24 * 60 * 60 * 1000, // 24 ore
    maxEntries: 100
  },
  NETWORK_FIRST: {
    name: 'memory-grove-network-first-v1',
    maxAge: 5 * 60 * 1000, // 5 minuti
    maxEntries: 50
  }
} as const;

// Funzione per determinare la strategia di cache per una richiesta
const getCacheStrategy = (request: Request): string => {
  const url = new URL(request.url);
  
  // Risorse statiche
  if (url.pathname.endsWith('.html') || 
      url.pathname.endsWith('.css') || 
      url.pathname.endsWith('.js') || 
      url.pathname.endsWith('.png') || 
      url.pathname.endsWith('.webp') || 
      url.pathname.endsWith('.svg') ||
      url.pathname.endsWith('.jpg') ||
      url.pathname.endsWith('.ico')) {
    return CACHE_STRATEGIES.STATIC;
  }
  
  // API calls
  if (url.pathname.startsWith('/api/')) {
    // Per le API di lettura, usa stale-while-revalidate
    if (request.method === 'GET') {
      return CACHE_STRATEGIES.STALE_WHILE_REVALIDATE;
    }
    // Per le API di scrittura, usa network-first
    return CACHE_STRATEGIES.NETWORK_FIRST;
  }
  
  // Default per altre risorse
  return CACHE_STRATEGIES.DYNAMIC;
};

// Funzione per gestire la cache statica
const handleStaticCache = async (request: Request): Promise<Response> => {
  const cache = await caches.open(CACHE_CONFIG.STATIC.name);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  const networkResponse = await fetch(request);
  cache.put(request, networkResponse.clone());
  return networkResponse;
};

// Funzione per gestire la cache dinamica
const handleDynamicCache = async (request: Request): Promise<Response> => {
  const cache = await caches.open(CACHE_CONFIG.DYNAMIC.name);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    const cachedData = await cachedResponse.json();
    const cacheAge = Date.now() - new Date(cachedData.timestamp).getTime();
    
    if (cacheAge < CACHE_CONFIG.DYNAMIC.maxAge) {
      return cachedResponse;
    }
  }
  
  const networkResponse = await fetch(request);
  const responseData = await networkResponse.json();
  responseData.timestamp = new Date().toISOString();
  
  const newResponse = new Response(JSON.stringify(responseData), {
    headers: networkResponse.headers
  });
  
  cache.put(request, newResponse.clone());
  return newResponse;
};

// Funzione per gestire la strategia network-first
const handleNetworkFirst = async (request: Request): Promise<Response> => {
  const cache = await caches.open(CACHE_CONFIG.NETWORK_FIRST.name);
  
  try {
    // Impostiamo un timeout per le richieste di rete
    const controller = new AbortController();
    const signal = controller.signal;
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 secondi di timeout
    
    try {
      const networkResponse = await fetch(request, { signal });
      clearTimeout(timeoutId);
      
      // Se la risposta non è OK (es. 404, 500), lanciamo un errore
      if (!networkResponse.ok) {
        throw new Error(`HTTP error! status: ${networkResponse.status}`);
      }
      
      // Salva nella cache e restituisci la risposta
      cache.put(request, networkResponse.clone());
      return networkResponse;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError; // Rilancia l'errore per gestirlo sotto
    }
  } catch (error) {
    //console.log(`[SW] Errore di rete per ${request.url}. Cerco nella cache...`);
    
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      //console.log(`[SW] Risposta trovata nella cache per ${request.url}`);
      return cachedResponse;
    }
    
    // Se non c'è risposta nella cache, restituisci una risposta generica di errore
    //console.log(`[SW] Nessuna risposta nella cache per ${request.url}`);
    
    // Se la richiesta è per un'API, restituisci un JSON di errore
    if (request.url.includes('/api/')) {
      return new Response(JSON.stringify({
        error: 'Connessione di rete non disponibile',
        offline: true,
        message: 'Verifica la tua connessione di rete'
      }), {
        status: 503,
        headers: {'Content-Type': 'application/json'}
      });
    }
    
    // Per richieste di navigazione, mantieni il comportamento originale
    if (request.mode === 'navigate') {
      const offlineResponse = await caches.match('/offline.html');
      if (offlineResponse) {
        return offlineResponse;
      }
    }
    
    // Per altre richieste (es. immagini, CSS, JS), ritorna una risposta vuota
    return new Response('', { 
      status: 408, 
      statusText: 'Richiesta scaduta, connessione non disponibile' 
    });
  }
};

// Funzione per gestire la strategia stale-while-revalidate
const handleStaleWhileRevalidate = async (request: Request): Promise<Response> => {
  const cache = await caches.open(CACHE_CONFIG.DYNAMIC.name);
  const cachedResponse = await cache.match(request);
  
  // Ritorna immediatamente la risposta dalla cache se disponibile
  if (cachedResponse) {
    // Aggiorna la cache in background
    fetch(request).then(async (networkResponse) => {
      try {
        if (!networkResponse.ok) {
          throw new Error(`HTTP error! status: ${networkResponse.status}`);
        }
        
        const responseData = await networkResponse.clone().json();
        responseData.timestamp = new Date().toISOString();
        
        const newResponse = new Response(JSON.stringify(responseData), {
          headers: networkResponse.headers
        });
        
        cache.put(request, newResponse);
      } catch (error) {
        console.error(`[SW] Errore nell'aggiornamento della cache:`, error);
        // Non lanciamo l'errore, perché l'operazione è in background
      }
    }).catch(error => {
      console.error(`[SW] Errore nel fetch di rete:`, error);
      // Non facciamo nulla, perché abbiamo già restituito la risposta dalla cache
    });
    
    return cachedResponse;
  }
  
  // Se non c'è cache, fai la richiesta di rete
  try {
    const networkResponse = await fetch(request);
    
    if (!networkResponse.ok) {
      throw new Error(`HTTP error! status: ${networkResponse.status}`);
    }
    
    const responseData = await networkResponse.clone().json();
    responseData.timestamp = new Date().toISOString();
    
    const newResponse = new Response(JSON.stringify(responseData), {
      headers: networkResponse.headers
    });
    
    cache.put(request, newResponse.clone());
    return newResponse;
  } catch (error) {
    console.error(`[SW] Errore nella richiesta di rete:`, error);
    
    // Per richieste di API, ritorna un JSON di errore
    if (request.url.includes('/api/')) {
      return new Response(JSON.stringify({
        error: 'Connessione di rete non disponibile',
        offline: true,
        message: 'Verifica la tua connessione di rete'
      }), {
        status: 503,
        headers: {'Content-Type': 'application/json'}
      });
    }
    
    // Per altre richieste, ritorna una risposta vuota
    return new Response('', { 
      status: 408, 
      statusText: 'Richiesta scaduta, connessione non disponibile' 
    });
  }
};

// Installazione del Service Worker
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    Promise.all([
      // Cache delle risorse statiche
      caches.open(CACHE_CONFIG.STATIC.name).then((cache) => {
        return cache.addAll(CACHE_CONFIG.STATIC.urls);
      }),
      // Cache delle risorse dinamiche
      caches.open(CACHE_CONFIG.DYNAMIC.name),
      // Cache network-first
      caches.open(CACHE_CONFIG.NETWORK_FIRST.name)
    ])
  );
});

// Attivazione del Service Worker
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !Object.values(CACHE_CONFIG).some(config => config.name === name))
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

  const strategy = getCacheStrategy(event.request);
  
  event.respondWith(
    (async () => {
      try {
        switch (strategy) {
          case CACHE_STRATEGIES.STATIC:
            return handleStaticCache(event.request);
          case CACHE_STRATEGIES.DYNAMIC:
            return handleDynamicCache(event.request);
          case CACHE_STRATEGIES.NETWORK_FIRST:
            return handleNetworkFirst(event.request);
          case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
            return handleStaleWhileRevalidate(event.request);
          default:
            return fetch(event.request);
        }
      } catch (error) {
        console.error(`[SW] Errore non gestito nell'intercettazione della richiesta:`, error);
        
        // Fallback alla pagina offline per le richieste di navigazione
        if (event.request.mode === 'navigate') {
          const offlineResponse = await caches.match('/offline.html');
          if (offlineResponse) {
            return offlineResponse;
          }
        }
        
        // Per richieste API, ritorna un JSON di errore
        if (event.request.url.includes('/api/')) {
          return new Response(JSON.stringify({
            error: 'Errore nella gestione della richiesta',
            offline: true,
            message: 'Si è verificato un errore imprevisto'
          }), {
            status: 500,
            headers: {'Content-Type': 'application/json'}
          });
        }
        
        // Per altre richieste, ritorna una risposta vuota
        return new Response('', { 
          status: 500, 
          statusText: 'Errore interno del service worker' 
        });
      }
    })()
  );
}); 