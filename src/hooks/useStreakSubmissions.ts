import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getStreakSubmissions, getStreakSubmission } from "../services/subgraph";
import type { StreakSubmissionFilters } from "../types";
import { PAGE_SIZE } from "../config/constants";

export const useStreakSubmissions = (
  filters: StreakSubmissionFilters = {},
  enabled = true
) => {
  return useInfiniteQuery({
    queryKey: ["streakSubmissions", filters],
    queryFn: ({ pageParam = 0 }) =>
      getStreakSubmissions(filters, {
        first: PAGE_SIZE,
        skip: pageParam,
        orderBy: "submittedAt",
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

export const useStreakSubmission = (id: string | null, enabled = true) => {
  return useQuery({
    queryKey: ["streakSubmission", id],
    queryFn: () => (id ? getStreakSubmission(id) : null),
    enabled: enabled && !!id,
  });
};

