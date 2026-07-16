"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  invitationQueueApi,
  subscribeQueueStore,
} from "@/entities/invitation-queue";
import { env } from "@/shared/config";
import { invitationQueueKeys } from "../api/query-keys";

/**
 * Live queue detail with poll + mock-store subscription (realtime advance).
 */
export function useQueueById(queueId: string | undefined, enabled = true) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: invitationQueueKeys.detail(queueId ?? ""),
    queryFn: () => invitationQueueApi.getById(queueId!),
    enabled: Boolean(queueId) && enabled,
    refetchInterval: (q) => {
      if (q.state.data?.status === "active") {
        return env.queuePollMs;
      }
      return false;
    },
  });

  useEffect(() => {
    if (!queueId || !env.queueMock) return;
    return subscribeQueueStore(() => {
      void queryClient.invalidateQueries({
        queryKey: invitationQueueKeys.detail(queueId),
      });
      void queryClient.invalidateQueries({
        queryKey: invitationQueueKeys.me(),
      });
      void queryClient.invalidateQueries({
        queryKey: invitationQueueKeys.history(),
      });
    });
  }, [queueId, queryClient]);

  return query;
}
