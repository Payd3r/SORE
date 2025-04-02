import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minuti
      gcTime: 60 * 60 * 1000, // 1 ora
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
}); 