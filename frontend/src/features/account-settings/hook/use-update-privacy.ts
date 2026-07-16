"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi, userKeys } from "@/entities/user";
import { notifyError } from "@/shared/api";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";

export function useUpdatePrivacy() {
  const queryClient = useQueryClient();
  const { t } = useAppTranslation("error");

  return useMutation({
    mutationFn: (privacySettings: {
      hideProfile?: boolean;
      hideLevel?: boolean;
    }) => userApi.updatePrivacy({ privacySettings }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: (err) => notifyError(err, t),
  });
}
