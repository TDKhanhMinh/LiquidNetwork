"use client";

import { useQuery } from "@tanstack/react-query";
import { searchApi, searchKeys } from "@/entities/search";

export function useGlobalSearch(query: string) {
  return useQuery({
    queryKey: searchKeys.query(query.trim()),
    queryFn: () => searchApi.search(query),
    placeholderData: (prev) => prev,
  });
}
