import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getCleanups, getCleanup, getCleanupUpdates } from "../services/subgraph";
import type { CleanupFilters } from "../types";
import { PAGE_SIZE } from "../config/constants";

export const useCleanups = (filters: CleanupFilters = {}, enabled = true) => {
  return useInfiniteQuery({
    queryKey: ["cleanups", filters],
    queryFn: ({ pageParam = 0 }) =>
      getCleanups(filters, {
        first: PAGE_SIZE,
        skip: pageParam,
        orderBy: "createdAt",
        orderDirection: "desc",
      }),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      return allPages.length * PAGE_SIZE;
    },
    enabled,
    initialPageParam: 0,
  });
};

export const useCleanup = (id: string | null, enabled = true) => {
  return useQuery({
    queryKey: ["cleanup", id],
    queryFn: () => (id ? getCleanup(id) : null),
    enabled: enabled && !!id,
  });
};

export const useCleanupUpdates = (cleanupId: string | null, enabled = true) => {
  return useQuery({
    queryKey: ["cleanupUpdates", cleanupId],
    queryFn: () => (cleanupId ? getCleanupUpdates(cleanupId) : []),
    enabled: enabled && !!cleanupId,
  });
};

