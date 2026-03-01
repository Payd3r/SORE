import type { QueryClient } from "@tanstack/react-query";

function invalidate(queryClient: QueryClient, queryKey: readonly unknown[]) {
  return queryClient.invalidateQueries({ queryKey });
}

export async function invalidateOnMemoryChange(
  queryClient: QueryClient,
  memoryId?: number | string
): Promise<void> {
  const memoryKey = memoryId != null ? ["memory", memoryId] : null;
  const carouselKey = memoryId != null ? ["memoryCarousel", memoryId] : null;

  await Promise.all([
    invalidate(queryClient, ["memories"]),
    invalidate(queryClient, ["homeData"]),
    invalidate(queryClient, ["mapMemories"]),
    memoryKey ? invalidate(queryClient, memoryKey) : Promise.resolve(),
    carouselKey ? invalidate(queryClient, carouselKey) : Promise.resolve(),
  ]);
}

export async function invalidateOnIdeaChange(queryClient: QueryClient): Promise<void> {
  await Promise.all([
    invalidate(queryClient, ["ideas"]),
    invalidate(queryClient, ["homeData"]),
  ]);
}

export async function invalidateOnProfileChange(queryClient: QueryClient): Promise<void> {
  await Promise.all([
    invalidate(queryClient, ["user-info"]),
    invalidate(queryClient, ["couple-info"]),
    invalidate(queryClient, ["recap-data"]),
    invalidate(queryClient, ["recap-confronto"]),
    invalidate(queryClient, ["recap-attivita"]),
  ]);
}

export async function invalidateOnNotificationChange(queryClient: QueryClient): Promise<void> {
  await invalidate(queryClient, ["notifications"]);
}
