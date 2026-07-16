"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  safeRideApi,
  safeRideKeys,
  type CreateRideInput,
  type RideProvider,
  type SafeRidePrefs,
} from "@/entities/safe-ride";
import { notifyError } from "@/shared/api";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";

export function useFines() {
  return useQuery({
    queryKey: safeRideKeys.fines(),
    queryFn: () => safeRideApi.getFines(),
  });
}

export function useRideHistory() {
  return useQuery({
    queryKey: safeRideKeys.rides(),
    queryFn: () => safeRideApi.listRides(),
  });
}

export function useRidePrefs() {
  return useQuery({
    queryKey: safeRideKeys.prefs(),
    queryFn: () => safeRideApi.getPrefs(),
  });
}

export function useRequestRide() {
  const queryClient = useQueryClient();
  const { t } = useAppTranslation("error");
  return useMutation({
    mutationFn: (input: CreateRideInput) => safeRideApi.requestRide(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: safeRideKeys.rides() });
    },
    onError: (e) => notifyError(e, t),
  });
}

export function useUpdateRidePrefs() {
  const queryClient = useQueryClient();
  const { t } = useAppTranslation("error");
  return useMutation({
    mutationFn: (prefs: Partial<SafeRidePrefs>) =>
      safeRideApi.updatePrefs(prefs),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: safeRideKeys.prefs() });
    },
    onError: (e) => notifyError(e, t),
  });
}

export function openProvider(provider: RideProvider) {
  const url = safeRideApi.providerLink(provider);
  if (typeof window !== "undefined" && url.startsWith("http")) {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
