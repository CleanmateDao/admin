import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "./useApiClient";
import type { EmailStatus } from "../types/services";

export function useEmailStatus() {
  const apiClient = useApiClient("email");

  return useQuery({
    queryKey: ["email-status", apiClient],
    queryFn: async () => {
      if (!apiClient) throw new Error("Not authenticated");
      return apiClient.get<EmailStatus>("/status");
    },
    enabled: !!apiClient,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

