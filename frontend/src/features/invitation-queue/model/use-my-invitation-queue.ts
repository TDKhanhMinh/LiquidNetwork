"use client";

import { useQuery } from "@tanstack/react-query";
import { invitationQueueApi } from "@/entities/invitation-queue";
import { invitationQueueKeys } from "../api/query-keys";

/**
 * Example TanStack Query usage for invitation-queue.
 *
 * @example
 * const { data, isLoading, error } = useMyInvitationQueue();
 */
export function useMyInvitationQueue(enabled = true) {
  return useQuery({
    queryKey: invitationQueueKeys.me(),
    queryFn: () => invitationQueueApi.getMyQueue(),
    enabled,
  });
}
