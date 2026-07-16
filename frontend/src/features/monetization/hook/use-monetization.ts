"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  monetizationApi,
  monetizationKeys,
  type CreateBookingInput,
} from "@/entities/monetization";
import { notifyError } from "@/shared/api";
import { useAppTranslation } from "@/shared/hooks/use-app-translation";

export function usePremiumPlans() {
  return useQuery({
    queryKey: monetizationKeys.plans(),
    queryFn: () => monetizationApi.listPlans(),
  });
}

export function useSubscribe() {
  const queryClient = useQueryClient();
  const { t } = useAppTranslation("error");
  return useMutation({
    mutationFn: (planId: string) => monetizationApi.subscribe(planId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: monetizationKeys.all,
      });
    },
    onError: (e) => notifyError(e, t),
  });
}

export function useVouchers() {
  return useQuery({
    queryKey: monetizationKeys.vouchers(),
    queryFn: () => monetizationApi.listVouchers(),
  });
}

export function useRedeemVoucher() {
  const queryClient = useQueryClient();
  const { t } = useAppTranslation("error");
  return useMutation({
    mutationFn: (id: string) => monetizationApi.redeemVoucher(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: monetizationKeys.vouchers(),
      });
    },
    onError: (e) => notifyError(e, t),
  });
}

export function useBookings() {
  return useQuery({
    queryKey: monetizationKeys.bookings(),
    queryFn: () => monetizationApi.listBookings(),
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  const { t } = useAppTranslation("error");
  return useMutation({
    mutationFn: (input: CreateBookingInput) =>
      monetizationApi.createBooking(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: monetizationKeys.bookings(),
      });
    },
    onError: (e) => notifyError(e, t),
  });
}

export function usePayments() {
  return useQuery({
    queryKey: monetizationKeys.payments(),
    queryFn: () => monetizationApi.listPayments(),
  });
}
