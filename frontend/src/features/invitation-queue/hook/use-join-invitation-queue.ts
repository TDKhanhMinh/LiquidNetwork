"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  invitationQueueApi,
  type JoinInvitationQueueInput,
} from "@/entities/invitation-queue";
import { notifyError } from "@/shared/api";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";
import { invitationQueueKeys } from "../api/query-keys";

/** @deprecated use useCreateInvitationQueue */
export function useJoinInvitationQueue() {
  const queryClient = useQueryClient();
  const { t } = useAppTranslation("error");

  return useMutation({
    mutationFn: (input: JoinInvitationQueueInput = {}) =>
      invitationQueueApi.join(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: invitationQueueKeys.all,
      });
    },
    onError: (error) => {
      notifyError(error, t);
    },
  });
}
