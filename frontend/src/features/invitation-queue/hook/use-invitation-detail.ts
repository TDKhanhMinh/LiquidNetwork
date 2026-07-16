"use client";

import { useQuery } from "@tanstack/react-query";
import { invitationQueueApi } from "@/entities/invitation-queue";
import { invitationQueueKeys } from "../api/query-keys";

export function useInvitationDetail(invitationId: string | undefined) {
  return useQuery({
    queryKey: invitationQueueKeys.invitation(invitationId ?? ""),
    queryFn: () => invitationQueueApi.getInvitation(invitationId!),
    enabled: Boolean(invitationId),
  });
}
