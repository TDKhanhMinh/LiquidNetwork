"use client";

import { useQuery } from "@tanstack/react-query";
import { userApi, userKeys } from "@/entities/user";

export function useUserProfile(userId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: userKeys.detail(userId ?? ""),
    queryFn: () => userApi.getById(userId!),
    enabled: Boolean(userId) && enabled,
  });
}
