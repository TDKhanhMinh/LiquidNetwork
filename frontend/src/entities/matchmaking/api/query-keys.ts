import type { MatchFilters } from "../model/types";

export const matchmakingKeys = {
  all: ["matchmaking"] as const,
  search: (filters: MatchFilters) =>
    [...matchmakingKeys.all, "search", filters] as const,
};
