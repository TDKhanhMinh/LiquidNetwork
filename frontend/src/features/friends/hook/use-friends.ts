"use client";

import { useQuery } from "@tanstack/react-query";
import { friendsApi, friendsKeys, type FriendRelation } from "@/entities/friends";

export function useFriends(filter: FriendRelation | "all" = "all") {
  return useQuery({
    queryKey: friendsKeys.list(filter),
    queryFn: () => friendsApi.list(filter),
  });
}
