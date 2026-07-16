"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  invitationQueueApi,
  invitationQueueKeys,
  type CreateQueueInput,
} from "@/entities/invitation-queue";
import { notifyError } from "@/shared/api";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";

export function useCreateQueue() {
  const queryClient = useQueryClient();
  const { t } = useAppTranslation("error");

  return useMutation({
    mutationFn: (input: CreateQueueInput) =>
      invitationQueueApi.createQueue(input),
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
