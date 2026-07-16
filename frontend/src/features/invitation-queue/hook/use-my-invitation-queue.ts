"use client";

import { useQuery } from "@tanstack/react-query";
import { invitationQueueApi } from "@/entities/invitation-queue";
import { invitationQueueKeys } from "../api/query-keys";

export function useMyInvitationQueue(enabled = true) {
  return useQuery({
    queryKey: invitationQueueKeys.me(),
    queryFn: () => invitationQueueApi.getMyQueue(),
    enabled,
    refetchInterval: (query) =>
      query.state.data?.status === "active" ? 3000 : false,
  });
}
