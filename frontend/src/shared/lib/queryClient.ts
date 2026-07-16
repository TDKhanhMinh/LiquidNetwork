import { QueryClient } from "@tanstack/react-query";
import { normalizeApiError } from "@/shared/api/errorHandler";

/**
 * Shared TanStack Query client for the app.
 * Import this singleton in providers; do not create ad-hoc clients in features.
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Auth / social data changes often — keep stale time modest
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: (failureCount, error) => {
          const apiError = normalizeApiError(error);
          // Never retry auth / validation client errors
          if (apiError.status >= 400 && apiError.status < 500) {
            return false;
          }
          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/** Browser singleton — created once per full page load */
let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  if (typeof window === "undefined") {
    // SSR: always create a new client to avoid shared state across requests
    return createQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = createQueryClient();
  }
  return browserQueryClient;
}
