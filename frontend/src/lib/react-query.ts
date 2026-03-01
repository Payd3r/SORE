import { QueryClient, dehydrate, hydrate } from "@tanstack/react-query";

type PersistedQueryCachePayload = {
  timestamp: number;
  buster: string;
  state: unknown;
};

const PERSIST_STORAGE_KEY = "sore:pwa:query-cache";
const PERSIST_BUSTER = import.meta.env.VITE_APP_CACHE_BUSTER || "v1";
const PERSIST_MAX_AGE = 24 * 60 * 60 * 1000; // 24 ore
const PERSIST_THROTTLE = 1000;

const STALE = {
  default: 30 * 1000,
  memories: 5 * 60 * 1000,
  memoryDetail: 3 * 60 * 1000,
  user: 10 * 60 * 1000,
  notifications: 60 * 1000,
  trackDetails: 10 * 60 * 1000,
} as const;

const GC = {
  desktop: 60 * 60 * 1000,
  pwa: 30 * 60 * 1000,
} as const;

function applyPwaQueryDefaults(client: QueryClient): void {
  client.setQueryDefaults(["memories"], {
    staleTime: STALE.memories,
    refetchOnMount: false,
    refetchOnReconnect: true,
  });
  client.setQueryDefaults(["homeData"], {
    staleTime: STALE.memories,
    refetchOnMount: false,
    refetchOnReconnect: true,
  });
  client.setQueryDefaults(["ideas"], {
    staleTime: STALE.memories,
    refetchOnMount: false,
    refetchOnReconnect: true,
  });
  client.setQueryDefaults(["mapMemories"], {
    staleTime: STALE.memories,
    refetchOnMount: false,
    refetchOnReconnect: true,
  });
  client.setQueryDefaults(["memory"], {
    staleTime: STALE.memoryDetail,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });
  client.setQueryDefaults(["memoryCarousel"], {
    staleTime: STALE.memoryDetail,
    refetchOnMount: false,
    refetchOnReconnect: true,
  });
  client.setQueryDefaults(["user-info"], {
    staleTime: STALE.user,
    refetchOnMount: false,
    refetchOnReconnect: true,
  });
  client.setQueryDefaults(["couple-info"], {
    staleTime: STALE.user,
    refetchOnMount: false,
    refetchOnReconnect: true,
  });
  client.setQueryDefaults(["recap-data"], {
    staleTime: STALE.user,
    refetchOnMount: false,
    refetchOnReconnect: true,
  });
  client.setQueryDefaults(["recap-confronto"], {
    staleTime: STALE.user,
    refetchOnMount: false,
    refetchOnReconnect: true,
  });
  client.setQueryDefaults(["recap-attivita"], {
    staleTime: STALE.user,
    refetchOnMount: false,
    refetchOnReconnect: true,
  });
  client.setQueryDefaults(["notifications"], {
    staleTime: STALE.notifications,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });
  client.setQueryDefaults(["trackDetails"], {
    staleTime: STALE.trackDetails,
    refetchOnMount: false,
    refetchOnReconnect: true,
  });
}

function shouldPersistQuery(queryKey: readonly unknown[]): boolean {
  const first = queryKey[0];
  if (typeof first !== "string") return false;
  return ["memories", "homeData", "ideas", "mapMemories"].includes(first);
}

export function createAppQueryClient(isPwa: boolean): QueryClient {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE.default,
        gcTime: isPwa ? GC.pwa : GC.desktop,
        retry: 1,
        retryDelay: 1000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        networkMode: isPwa ? "offlineFirst" : "online",
      },
    },
  });

  if (isPwa) {
    applyPwaQueryDefaults(queryClient);
  }

  return queryClient;
}

export function setupPwaQueryPersistence(queryClient: QueryClient, isPwa: boolean): () => void {
  if (!isPwa || typeof window === "undefined") {
    return () => undefined;
  }

  try {
    const raw = window.localStorage.getItem(PERSIST_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PersistedQueryCachePayload;
      const isFresh = Date.now() - parsed.timestamp < PERSIST_MAX_AGE;
      if (parsed.buster === PERSIST_BUSTER && isFresh) {
        hydrate(queryClient, parsed.state);
      }
    }
  } catch (error) {
    console.error("[RQ] Impossibile idratare la cache persistita:", error);
  }

  let timeoutId: number | null = null;
  const unsubscribe = queryClient.getQueryCache().subscribe(() => {
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId);
    }

    timeoutId = window.setTimeout(() => {
      try {
        const state = dehydrate(queryClient, {
          shouldDehydrateQuery: (query) => {
            if (query.state.status !== "success") return false;
            return shouldPersistQuery(query.queryKey);
          },
        });
        const payload: PersistedQueryCachePayload = {
          timestamp: Date.now(),
          buster: PERSIST_BUSTER,
          state,
        };
        window.localStorage.setItem(PERSIST_STORAGE_KEY, JSON.stringify(payload));
      } catch (error) {
        console.error("[RQ] Impossibile persistere la cache:", error);
      }
    }, PERSIST_THROTTLE);
  });

  return () => {
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId);
    }
    unsubscribe();
  };
}