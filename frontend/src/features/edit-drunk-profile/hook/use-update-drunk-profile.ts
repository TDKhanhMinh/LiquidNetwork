"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  userApi,
  userKeys,
  type UpdateDrunkProfilePayload,
  type UpdateUserPayload,
} from "@/entities/user";
import { notifyError } from "@/shared/api";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";

export function useUpdateBasicInfo() {
  const queryClient = useQueryClient();
  const { t } = useAppTranslation("error");

  return useMutation({
    mutationFn: (payload: UpdateUserPayload) => userApi.updateMe(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: (err) => notifyError(err, t),
  });
}

export function useUpdateDrunkProfile() {
  const queryClient = useQueryClient();
  const { t } = useAppTranslation("error");

  return useMutation({
    mutationFn: (payload: UpdateDrunkProfilePayload) =>
      userApi.updateDrunkProfile(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: (err) => notifyError(err, t),
  });
}
