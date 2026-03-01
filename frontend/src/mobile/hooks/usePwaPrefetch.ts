import { useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getMemories, getMemory } from "../../api/memory";
import { getIdeas } from "../../api/ideas";
import { getMapMemories } from "../../api/map";
import { getUserInfo, getCoupleInfo } from "../../api/profile";
import { useAuth } from "../../contexts/AuthContext";

const PREFETCH_DELAY_INTENT = 300;
const PREFETCH_THROTTLE = 500;

type SupportedRoute = "/" | "/galleria" | "/idee" | "/mappa" | "/profilo";

export function usePwaPrefetch() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const intentTimeoutsRef = useRef<Map<string, number>>(new Map());
  const lastPrefetchAtRef = useRef<Map<string, number>>(new Map());

  const shouldThrottle = useCallback((key: string) => {
    const now = Date.now();
    const last = lastPrefetchAtRef.current.get(key) ?? 0;
    if (now - last < PREFETCH_THROTTLE) return true;
    lastPrefetchAtRef.current.set(key, now);
    return false;
  }, []);

  const prefetchRoute = useCallback(
    async (route: SupportedRoute): Promise<void> => {
      if (shouldThrottle(`route:${route}`)) {
        return;
      }

      switch (route) {
        case "/":
          await queryClient.prefetchQuery({
            queryKey: ["homeData"],
            queryFn: () => import("../../api/home").then((m) => m.getHomeData()),
            staleTime: 5 * 60 * 1000,
          });
          break;
        case "/galleria":
          await queryClient.prefetchQuery({
            queryKey: ["memories"],
            queryFn: () => getMemories(),
            staleTime: 5 * 60 * 1000,
          });
          break;
        case "/idee":
          await queryClient.prefetchQuery({
            queryKey: ["ideas"],
            queryFn: getIdeas,
            staleTime: 5 * 60 * 1000,
          });
          break;
        case "/mappa":
          await queryClient.prefetchQuery({
            queryKey: ["mapMemories"],
            queryFn: getMapMemories,
            staleTime: 5 * 60 * 1000,
          });
          break;
        case "/profilo": {
          const userId = user?.id ? Number(user.id) : null;
          if (!userId) return;

          const userInfo = await queryClient.fetchQuery({
            queryKey: ["user-info", userId],
            queryFn: () => getUserInfo(userId),
            staleTime: 10 * 60 * 1000,
          });

          if (userInfo?.couple_id != null) {
            const coupleId = userInfo.couple_id;
            await queryClient.prefetchQuery({
              queryKey: ["couple-info", coupleId],
              queryFn: () => getCoupleInfo(coupleId),
              staleTime: 10 * 60 * 1000,
            });
          }
          break;
        }
        default:
          break;
      }
    },
    [queryClient, shouldThrottle, user?.id]
  );

  const prefetchMemoryDetails = useCallback(
    async (memoryIds: number[]): Promise<void> => {
      const uniqueIds = Array.from(new Set(memoryIds)).slice(0, 3);
      await Promise.all(
        uniqueIds.map((memoryId) =>
          queryClient.prefetchQuery({
            queryKey: ["memory", memoryId],
            queryFn: async () => {
              const res = await getMemory(String(memoryId));
              return res.data;
            },
            staleTime: 3 * 60 * 1000,
          })
        )
      );
    },
    [queryClient]
  );

  const scheduleRoutePrefetch = useCallback(
    (route: SupportedRoute, delay = PREFETCH_DELAY_INTENT): void => {
      const existing = intentTimeoutsRef.current.get(route);
      if (existing != null) {
        window.clearTimeout(existing);
      }

      const timeoutId = window.setTimeout(() => {
        void prefetchRoute(route);
        intentTimeoutsRef.current.delete(route);
      }, delay);
      intentTimeoutsRef.current.set(route, timeoutId);
    },
    [prefetchRoute]
  );

  const cancelRoutePrefetch = useCallback((route: SupportedRoute): void => {
    const timeoutId = intentTimeoutsRef.current.get(route);
    if (timeoutId != null) {
      window.clearTimeout(timeoutId);
      intentTimeoutsRef.current.delete(route);
    }
  }, []);

  return {
    prefetchRoute,
    prefetchMemoryDetails,
    scheduleRoutePrefetch,
    cancelRoutePrefetch,
  };
}
