"use client";

import { useQuery } from "@tanstack/react-query";
import { userApi, userKeys } from "@/entities/user";

export function useMyProfile(enabled = true) {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: () => userApi.getMe(),
    enabled,
  });
}
