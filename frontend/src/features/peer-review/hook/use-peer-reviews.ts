"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { peerReviewApi, type CreatePeerReviewPayload } from "@/entities/peer-review";
import { userKeys } from "@/entities/user";
import { notifyError } from "@/shared/api";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";

export function usePeerReviews(userId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: userKeys.reviews(userId ?? ""),
    queryFn: () => peerReviewApi.listForUser(userId!),
    enabled: Boolean(userId) && enabled,
  });
}

export function useCreatePeerReview(revieweeId: string) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslation("error");

  return useMutation({
    mutationFn: (payload: CreatePeerReviewPayload) =>
      peerReviewApi.create(revieweeId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: userKeys.reviews(revieweeId),
      });
      void queryClient.invalidateQueries({
        queryKey: userKeys.detail(revieweeId),
      });
      void queryClient.invalidateQueries({ queryKey: userKeys.me() });
    },
    onError: (err) => notifyError(err, t),
  });
}
