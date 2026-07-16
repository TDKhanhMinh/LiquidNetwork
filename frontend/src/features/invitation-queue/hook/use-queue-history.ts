"use client";

import { useQuery } from "@tanstack/react-query";
import { invitationQueueApi } from "@/entities/invitation-queue";
import { invitationQueueKeys } from "../api/query-keys";

export function useQueueHistory(enabled = true) {
  return useQuery({
    queryKey: invitationQueueKeys.history(),
    queryFn: () => invitationQueueApi.history(),
    enabled,
  });
}
