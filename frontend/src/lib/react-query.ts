import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 secondi
      gcTime: 60 * 60 * 1000, // 1 ora
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
}); 