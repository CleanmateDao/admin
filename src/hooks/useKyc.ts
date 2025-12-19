import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "./useApiClient";
import type { KycSubmission } from "../types/services";

export function useKycSubmissions(
  statusFilter?: string,
  startDate?: string,
  endDate?: string
) {
  const apiClient = useApiClient("kyc");

  return useQuery({
    queryKey: ["kyc-submissions", statusFilter, startDate, endDate, apiClient],
    queryFn: async () => {
      if (!apiClient) throw new Error("Not authenticated");
      const params = new URLSearchParams();
      if (statusFilter) {
        params.append("status", statusFilter);
      }
      if (startDate) {
        params.append("startDate", startDate);
      }
      if (endDate) {
        params.append("endDate", endDate);
      }
      const queryString = params.toString();
      const endpoint = queryString
        ? `/kyc/admin/submissions?${queryString}`
        : "/kyc/admin/submissions";
      return apiClient.get<KycSubmission[]>(endpoint);
    },
    enabled: !!apiClient,
  });
}

export function useKycSubmissionDetails(submissionId: string | null) {
  const apiClient = useApiClient("kyc");

  return useQuery({
    queryKey: ["kyc-submission-details", submissionId, apiClient],
    queryFn: async () => {
      if (!apiClient || !submissionId) throw new Error("Not authenticated");
      return apiClient.get<KycSubmission>(`/kyc/admin/submissions/${submissionId}`);
    },
    enabled: !!apiClient && !!submissionId,
  });
}

export function useKycMutations() {
  const apiClient = useApiClient("kyc");
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      submissionId,
      status,
      rejectionReason,
    }: {
      submissionId: string;
      status: string;
      rejectionReason?: string;
    }) => {
      if (!apiClient) throw new Error("Not authenticated");
      return apiClient.post("/kyc/admin/update-status", {
        submissionId,
        status,
        rejectionReason,
        reviewedBy: "admin",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kyc-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["kyc-submission-details"] });
    },
  });

  return {
    updateStatus: updateStatusMutation.mutate,
    updateStatusAsync: updateStatusMutation.mutateAsync,
    isUpdating: updateStatusMutation.isPending,
  };
}

