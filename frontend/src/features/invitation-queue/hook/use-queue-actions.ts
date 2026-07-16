"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invitationQueueApi } from "@/entities/invitation-queue";
import { notifyError } from "@/shared/api";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { invitationQueueKeys } from "../api/query-keys";

export function useRespondToQueue() {
  const queryClient = useQueryClient();
  const { t } = useAppTranslation("error");

  return useMutation({
    mutationFn: ({
      queueId,
      accept,
    }: {
      queueId: string;
      accept: boolean;
    }) => invitationQueueApi.respond(queueId, accept),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: invitationQueueKeys.all,
      });
      void queryClient.setQueryData(
        invitationQueueKeys.detail(data.id),
        data,
      );
    },
    onError: (error) => notifyError(error, t),
  });
}

export function useCancelQueue() {
  const queryClient = useQueryClient();
  const { t } = useAppTranslation("error");

  return useMutation({
    mutationFn: (queueId: string) => invitationQueueApi.cancel(queueId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: invitationQueueKeys.all,
      });
    },
    onError: (error) => notifyError(error, t),
  });
}
