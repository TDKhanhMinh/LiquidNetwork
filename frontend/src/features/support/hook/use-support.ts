"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  supportApi,
  supportKeys,
  type CreateReportInput,
} from "@/entities/support";
import { notifyError } from "@/shared/api";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";

export function useFaq() {
  return useQuery({
    queryKey: supportKeys.faq(),
    queryFn: () => supportApi.listFaq(),
  });
}

export function useCreateReport() {
  const queryClient = useQueryClient();
  const { t } = useAppTranslation("error");
  return useMutation({
    mutationFn: (input: CreateReportInput) => supportApi.createReport(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: supportKeys.reports(),
      });
    },
    onError: (e) => notifyError(e, t),
  });
}
