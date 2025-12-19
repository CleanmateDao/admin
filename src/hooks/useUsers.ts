import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getUsers, getUser } from "../services/subgraph";
import type { UserFilters } from "../types";
import { PAGE_SIZE } from "../config/constants";

export const useUsers = (filters: UserFilters = {}, enabled = true) => {
  return useInfiniteQuery({
    queryKey: ["users", filters],
    queryFn: ({ pageParam = 0 }) =>
      getUsers(filters, {
        first: PAGE_SIZE,
        skip: pageParam,
        orderBy: "registeredAt",
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

export const useUser = (id: string | null, enabled = true) => {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => (id ? getUser(id) : null),
    enabled: enabled && !!id,
  });
};

