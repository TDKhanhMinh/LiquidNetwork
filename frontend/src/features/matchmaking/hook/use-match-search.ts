"use client";

import { useQuery } from "@tanstack/react-query";
import {
  matchmakingApi,
  matchmakingKeys,
  type MatchFilters,
} from "@/entities/matchmaking";

export function useMatchSearch(filters: MatchFilters, enabled = true) {
  return useQuery({
    queryKey: matchmakingKeys.search(filters),
    queryFn: () => matchmakingApi.search(filters),
    enabled,
    placeholderData: (prev) => prev,
  });
}
