"use client";

import { useQuery } from "@tanstack/react-query";
import {
  invitationQueueApi,
  invitationQueueKeys,
} from "@/entities/invitation-queue";

export function useSearchCandidates(query: string) {
  const trimmed = query.trim();
  return useQuery({
    queryKey: invitationQueueKeys.candidates(trimmed),
    queryFn: () => invitationQueueApi.searchCandidates(trimmed),
    staleTime: 30_000,
  });
}

export function useCandidateSuggestions() {
  return useQuery({
    queryKey: invitationQueueKeys.suggestions(),
    queryFn: () => invitationQueueApi.listSuggestions(),
    staleTime: 60_000,
  });
}
