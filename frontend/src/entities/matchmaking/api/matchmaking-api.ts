import { ApiError, apiClient } from "@/shared/api";
import { env } from "@/shared/config";
import type { MatchFilters, MatchSearchResult } from "../model/types";
import { DEFAULT_FILTERS, filterCandidates } from "../lib/mock-data";

function isNotReadyError(err: unknown): boolean {
  if (err instanceof ApiError) {
    return (
      err.status === 0 ||
      err.status === 404 ||
      err.status === 501 ||
      err.status === 401
    );
  }
  const code = (err as { code?: string })?.code;
  return code === "ERR_NETWORK" || code === "ECONNABORTED";
}

const useMock =
  env.authMock ||
  process.env.NEXT_PUBLIC_MATCH_MOCK === "true" ||
  (process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_MATCH_MOCK !== "false");

export const matchmakingApi = {
  async search(filters: Partial<MatchFilters> = {}): Promise<MatchSearchResult> {
    const body = { ...DEFAULT_FILTERS, ...filters };
    try {
      return await apiClient.post<MatchSearchResult>(
        "/matchmaking/search",
        body,
      );
    } catch (err) {
      if (useMock && isNotReadyError(err)) {
        const items = filterCandidates(body);
        return { filters: body, items, total: items.length };
      }
      throw err;
    }
  },
};
