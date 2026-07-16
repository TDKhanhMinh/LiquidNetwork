"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  drinkingSessionApi,
  drinkingSessionKeys,
  type CreateDrinkingSessionInput,
  type EndSessionInput,
  type InviteToSessionInput,
} from "@/entities/drinking-session";
import { notifyError } from "@/shared/api";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";

export function useSessionsList(enabled = true) {
  return useQuery({
    queryKey: drinkingSessionKeys.list(),
    queryFn: () => drinkingSessionApi.list(),
    enabled,
  });
}

export function useSessionDetail(id: string | undefined) {
  return useQuery({
    queryKey: drinkingSessionKeys.detail(id ?? ""),
    queryFn: () => drinkingSessionApi.getById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  const { t } = useAppTranslation("error");
  return useMutation({
    mutationFn: (input: CreateDrinkingSessionInput) =>
      drinkingSessionApi.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: drinkingSessionKeys.all,
      });
    },
    onError: (e) => notifyError(e, t),
  });
}

export function useSessionActions(sessionId: string) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslation("error");

  const invalidate = () => {
    void queryClient.invalidateQueries({
      queryKey: drinkingSessionKeys.all,
    });
  };

  const checkIn = useMutation({
    mutationFn: () => drinkingSessionApi.checkIn(sessionId),
    onSuccess: invalidate,
    onError: (e) => notifyError(e, t),
  });

  const invite = useMutation({
    mutationFn: (input: InviteToSessionInput) =>
      drinkingSessionApi.invite(sessionId, input),
    onSuccess: invalidate,
    onError: (e) => notifyError(e, t),
  });

  const end = useMutation({
    mutationFn: (input: EndSessionInput = {}) =>
      drinkingSessionApi.end(sessionId, input),
    onSuccess: invalidate,
    onError: (e) => notifyError(e, t),
  });

  const cancel = useMutation({
    mutationFn: () => drinkingSessionApi.cancel(sessionId),
    onSuccess: invalidate,
    onError: (e) => notifyError(e, t),
  });

  return { checkIn, invite, end, cancel };
}
