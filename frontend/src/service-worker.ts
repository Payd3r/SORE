/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

interface PushNotificationPayload {
  title?: string;
  body?: string;
  url?: string;
  icon?: string;
  badge?: string;
}

const CACHE_STRATEGIES = {
  STATIC: "static",
  DYNAMIC: "dynamic",
  NETWORK_FIRST: "network-first",
  STALE_WHILE_REVALIDATE: "stale-while-revalidate",
  IMAGE_CACHE_FIRST: "image-cache-first",
} as const;

type CacheStrategy = (typeof CACHE_STRATEGIES)[keyof typeof CACHE_STRATEGIES];

const CACHE_TTL = {
  API_SHORT: 60 * 1000, // notifications
  API_DEFAULT: 5 * 60 * 1000,
  API_LONG: 10 * 60 * 1000,
  DYNAMIC: 24 * 60 * 60 * 1000,
  IMAGES: 7 * 24 * 60 * 60 * 1000,
} as const;

const FETCH_TIMEOUT_MS = 5000;
const CACHE_HEADER_CACHED_AT = "x-sw-cached-at";

const CACHE_CONFIG = {
  STATIC: {
    name: "memory-grove-static-v2",
    urls: ["/", "/index.html", "/manifest.json", "/offline.html"],
  },
  DYNAMIC: {
    name: "memory-grove-dynamic-v2",
    maxEntries: 100,
    ttl: CACHE_TTL.DYNAMIC,
  },
  NETWORK_FIRST: {
    name: "memory-grove-network-first-v2",
    maxEntries: 50,
    ttl: CACHE_TTL.API_DEFAULT,
  },
  IMAGES: {
    name: "memory-grove-images-v1",
    maxEntries: 200,
    ttl: CACHE_TTL.IMAGES,
  },
} as const;

type ApiRule = {
  pattern: RegExp;
  ttl: number;
  strategy: CacheStrategy;
};

const API_RULES: ApiRule[] = [
  { pattern: /^\/api\/notifications(\/|$)/, ttl: CACHE_TTL.API_SHORT, strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE },
  { pattern: /^\/api\/(users|couples)(\/|$)/, ttl: CACHE_TTL.API_LONG, strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE },
  { pattern: /^\/api\/(home|memories|ideas|map)(\/|$)/, ttl: CACHE_TTL.API_DEFAULT, strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE },
];

type CacheDescriptor = {
  strategy: CacheStrategy;
  cacheName: string;
  ttl: number;
  maxEntries: number;
};

const isStaticAsset = (request: Request, pathname: string): boolean => {
  return (
    request.mode === "navigate" ||
    pathname === "/" ||
    pathname.endsWith(".html") ||
    pathname.endsWith(".css") ||
    pathname.endsWith(".js") ||
    pathname.endsWith(".woff2") ||
    pathname.endsWith(".woff") ||
    pathname.endsWith(".ttf")
  );
};

const isImageRequest = (request: Request, pathname: string): boolean => {
  const accept = request.headers.get("accept") || "";
  return (
    accept.includes("image/") ||
    pathname.includes("/uploads/") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".webp") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".gif") ||
    pathname.endsWith(".ico")
  );
};

const getApiRule = (pathname: string): ApiRule | null => {
  const found = API_RULES.find((rule) => rule.pattern.test(pathname));
  return found || null;
};

const getCacheDescriptor = (request: Request): CacheDescriptor => {
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (isStaticAsset(request, pathname)) {
    return {
      strategy: CACHE_STRATEGIES.STATIC,
      cacheName: CACHE_CONFIG.STATIC.name,
      ttl: Number.MAX_SAFE_INTEGER,
      maxEntries: CACHE_CONFIG.STATIC.urls.length + 20,
    };
  }

  if (isImageRequest(request, pathname)) {
    return {
      strategy: CACHE_STRATEGIES.IMAGE_CACHE_FIRST,
      cacheName: CACHE_CONFIG.IMAGES.name,
      ttl: CACHE_CONFIG.IMAGES.ttl,
      maxEntries: CACHE_CONFIG.IMAGES.maxEntries,
    };
  }

  if (pathname.startsWith("/api/")) {
    const rule = getApiRule(pathname);
    return {
      strategy: rule?.strategy || CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
      cacheName: CACHE_CONFIG.DYNAMIC.name,
      ttl: rule?.ttl || CACHE_TTL.API_DEFAULT,
      maxEntries: CACHE_CONFIG.DYNAMIC.maxEntries,
    };
  }

  return {
    strategy: CACHE_STRATEGIES.DYNAMIC,
    cacheName: CACHE_CONFIG.DYNAMIC.name,
    ttl: CACHE_CONFIG.DYNAMIC.ttl,
    maxEntries: CACHE_CONFIG.DYNAMIC.maxEntries,
  };
};

const isCacheableResponse = (response: Response): boolean => {
  return response.ok || response.type === "opaque";
};

const withCacheMetadata = (response: Response): Response => {
  const headers = new Headers(response.headers);
  headers.set(CACHE_HEADER_CACHED_AT, String(Date.now()));
  return new Response(response.clone().body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

const getCachedAt = (response: Response): number | null => {
  const value = response.headers.get(CACHE_HEADER_CACHED_AT);
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const isFreshCache = (response: Response, ttl: number): boolean => {
  const cachedAt = getCachedAt(response);
  if (!cachedAt) return false;
  return Date.now() - cachedAt < ttl;
};

const enforceCacheLimit = async (cacheName: string, maxEntries: number): Promise<void> => {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;

  const itemsToRemove = keys.length - maxEntries;
  for (let i = 0; i < itemsToRemove; i += 1) {
    await cache.delete(keys[i]);
  }
};

const putInCache = async (
  cacheName: string,
  request: Request,
  response: Response,
  maxEntries: number
): Promise<void> => {
  if (!isCacheableResponse(response)) return;
  const cache = await caches.open(cacheName);
  await cache.put(request, withCacheMetadata(response));
  await enforceCacheLimit(cacheName, maxEntries);
};

const fetchWithTimeout = async (request: Request, timeoutMs = FETCH_TIMEOUT_MS): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(request, { signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
};

const fallbackResponseFor = async (request: Request): Promise<Response> => {
  if (request.url.includes("/api/")) {
    return new Response(
      JSON.stringify({
        error: "Connessione di rete non disponibile",
        offline: true,
        message: "Verifica la tua connessione di rete",
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  if (request.mode === "navigate") {
    const offlineUrl = new URL("/offline.html", self.location.origin).href;
    const offlineResponse = await caches.match(offlineUrl);
    if (offlineResponse) return offlineResponse;
  }

  return new Response("", {
    status: 408,
    statusText: "Request Timeout",
  });
};

const handleStaticCache = async (request: Request): Promise<Response> => {
  const cache = await caches.open(CACHE_CONFIG.STATIC.name);
  const cachedResponse = await cache.match(request);
  if (cachedResponse) return cachedResponse;

  const networkResponse = await fetch(request);
  if (isCacheableResponse(networkResponse)) {
    await cache.put(request, networkResponse.clone());
  }
  return networkResponse;
};

const revalidateInBackground = (request: Request, descriptor: CacheDescriptor): void => {
  void fetch(request)
    .then(async (networkResponse) => {
      if (isCacheableResponse(networkResponse)) {
        await putInCache(descriptor.cacheName, request, networkResponse, descriptor.maxEntries);
      }
    })
    .catch(() => {
      // Ignoriamo errori di rete durante revalidate in background
    });
};

const handleStaleWhileRevalidate = async (
  request: Request,
  descriptor: CacheDescriptor
): Promise<Response> => {
  const cache = await caches.open(descriptor.cacheName);
  const cachedResponse = await cache.match(request);

  if (cachedResponse && isFreshCache(cachedResponse, descriptor.ttl)) {
    revalidateInBackground(request, descriptor);
    return cachedResponse;
  }

  try {
    const networkResponse = await fetchWithTimeout(request);
    if (isCacheableResponse(networkResponse)) {
      await putInCache(descriptor.cacheName, request, networkResponse, descriptor.maxEntries);
    }
    return networkResponse;
  } catch (error) {
    if (cachedResponse) return cachedResponse;
    return fallbackResponseFor(request);
  }
};

const handleDynamicCache = async (request: Request, descriptor: CacheDescriptor): Promise<Response> => {
  const cache = await caches.open(descriptor.cacheName);
  const cachedResponse = await cache.match(request);
  if (cachedResponse && isFreshCache(cachedResponse, descriptor.ttl)) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetchWithTimeout(request);
    if (isCacheableResponse(networkResponse)) {
      await putInCache(descriptor.cacheName, request, networkResponse, descriptor.maxEntries);
    }
    return networkResponse;
  } catch (error) {
    if (cachedResponse) return cachedResponse;
    return fallbackResponseFor(request);
  }
};

const handleNetworkFirst = async (request: Request, descriptor: CacheDescriptor): Promise<Response> => {
  try {
    const networkResponse = await fetchWithTimeout(request);
    if (isCacheableResponse(networkResponse)) {
      await putInCache(descriptor.cacheName, request, networkResponse, descriptor.maxEntries);
    }
    return networkResponse;
  } catch (error) {
    const cache = await caches.open(descriptor.cacheName);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) return cachedResponse;
    return fallbackResponseFor(request);
  }
};

const handleImageCacheFirst = async (request: Request, descriptor: CacheDescriptor): Promise<Response> => {
  const cache = await caches.open(descriptor.cacheName);
  const cachedResponse = await cache.match(request);
  if (cachedResponse && isFreshCache(cachedResponse, descriptor.ttl)) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetchWithTimeout(request);
    if (isCacheableResponse(networkResponse)) {
      await putInCache(descriptor.cacheName, request, networkResponse, descriptor.maxEntries);
    }
    return networkResponse;
  } catch (error) {
    if (cachedResponse) return cachedResponse;
    return fallbackResponseFor(request);
  }
};

// Installazione del Service Worker
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      try {
        const staticCache = await caches.open(CACHE_CONFIG.STATIC.name);

        for (const url of CACHE_CONFIG.STATIC.urls) {
          try {
            await staticCache.add(url);
          } catch (error) {
            console.error('[SW] Impossibile mettere in cache', url, error);
          }
        }

        await Promise.all([
          caches.open(CACHE_CONFIG.DYNAMIC.name),
          caches.open(CACHE_CONFIG.NETWORK_FIRST.name),
          caches.open(CACHE_CONFIG.IMAGES.name),
        ]);
      } catch (error) {
        console.error('[SW] Errore durante installazione service worker:', error);
      }
    })()
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
  // Ignora le richieste non GET e non HTTP/HTTPS
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  const descriptor = getCacheDescriptor(event.request);

  event.respondWith(
    (async () => {
      try {
        switch (descriptor.strategy) {
          case CACHE_STRATEGIES.STATIC:
            return handleStaticCache(event.request);
          case CACHE_STRATEGIES.DYNAMIC:
            return handleDynamicCache(event.request, descriptor);
          case CACHE_STRATEGIES.NETWORK_FIRST:
            return handleNetworkFirst(event.request, descriptor);
          case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
            return handleStaleWhileRevalidate(event.request, descriptor);
          case CACHE_STRATEGIES.IMAGE_CACHE_FIRST:
            return handleImageCacheFirst(event.request, descriptor);
          default:
            return fetch(event.request);
        }
      } catch (error) {
        console.error(`[SW] Errore non gestito nell'intercettazione della richiesta:`, error);

        // Fallback alla pagina offline per le richieste di navigazione
        if (event.request.mode === 'navigate') {
          const offlineUrl = new URL('/offline.html', self.location.origin).href;
          const offlineResponse = await caches.match(offlineUrl);
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
            headers: { 'Content-Type': 'application/json' }
          });
        }

        // Per altre richieste, ritorna una risposta vuota
        return new Response('', {
          status: 500,
          statusText: 'Internal Server Error'
        });
      }
    })()
  );
});

self.addEventListener('push', (event: PushEvent) => {
  const defaultPayload: Required<Pick<PushNotificationPayload, 'title' | 'body' | 'url' | 'icon' | 'badge'>> = {
    title: 'SORE',
    body: 'Hai una nuova notifica.',
    url: '/profilo',
    icon: '/icons/icon-152x152.png',
    badge: '/icons/icon-152x152.png',
  };

  event.waitUntil(
    (async () => {
      let payload: PushNotificationPayload = {};

      if (event.data) {
        try {
          payload = event.data.json() as PushNotificationPayload;
        } catch (_error) {
          payload = { body: event.data.text() };
        }
      }

      await self.registration.showNotification(payload.title || defaultPayload.title, {
        body: payload.body || defaultPayload.body,
        icon: payload.icon || defaultPayload.icon,
        badge: payload.badge || defaultPayload.badge,
        data: {
          url: payload.url || defaultPayload.url,
        },
      });
    })()
  );
});

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();

  const notificationData = event.notification.data as { url?: string } | undefined;
  const targetUrl = notificationData?.url || '/profilo';

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      for (const client of allClients) {
        if ('focus' in client) {
          await client.focus();
        }

        if ('navigate' in client) {
          await client.navigate(targetUrl);
        }

        return;
      }

      await self.clients.openWindow(targetUrl);
    })()
  );
});