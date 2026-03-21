import { QueryClient } from '@tanstack/react-query';

/**
 * Create and configure the React Query QueryClient for the application
 * This enables automatic request deduplication, caching, and background refetching
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Consider data fresh for 5 minutes
        staleTime: 5 * 60 * 1000,
        // Keep unused data in cache for 10 minutes before garbage collecting
        gcTime: 10 * 60 * 1000,
        // Don't retry failed requests automatically (let components decide)
        retry: 1,
        // Refetch stale data when window regains focus
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        refetchOnMount: true,
      },
      mutations: {
        // Retry mutations once on failure
        retry: 1,
      },
    },
  });
}

export default createQueryClient;
