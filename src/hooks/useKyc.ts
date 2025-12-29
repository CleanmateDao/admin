import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { kycClient } from "../services/clients/kyc";
import { useApiKey } from "../contexts/ApiKeyContext";

export function useKycSubmissions(
  statusFilter?: string,
  startDate?: string,
  endDate?: string
) {
  const { apiKey } = useApiKey();

  const kycApiKey = apiKey["kyc"];

  return useQuery({
    queryKey: ["kyc-submissions", statusFilter, startDate, endDate],
    queryFn: async () => {
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

      const response = await kycClient.get(endpoint, {
        headers: {
          "x-api-key": kycApiKey,
        },
      });
      // KYC service returns array directly, so response.data is the array
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: !!kycApiKey,
  });
}

export function useKycSubmissionDetails(submissionId: string | null) {
  const { apiKey } = useApiKey();

  const kycApiKey = apiKey["kyc"];

  return useQuery({
    queryKey: ["kyc-submission-details", submissionId],
    queryFn: async () => {
      if (!submissionId) throw new Error("Submission ID is required");
      const response = await kycClient.get(
        `/kyc/admin/submissions/${submissionId}`,
        {
          headers: {
            "x-api-key": kycApiKey,
          },
        }
      );
      return response.data;
    },
    enabled: !!kycApiKey && !!submissionId,
  });
}

export function useKycMutations() {
  const queryClient = useQueryClient();
  const { apiKey } = useApiKey();

  const kycApiKey = apiKey["kyc"];

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
      return kycClient.post(
        "/kyc/admin/update-status",
        {
          submissionId,
          status,
          rejectionReason,
          reviewedBy: "admin",
        },
        {
          headers: {
            "x-api-key": kycApiKey,
          },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kyc-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["kyc-submission-details"] });
    },
  });

  const setOrganizerStatusMutation = useMutation({
    mutationFn: async ({
      userAddress,
      isOrganizer,
    }: {
      userAddress: string;
      isOrganizer: boolean;
    }) => {
      return kycClient.post(
        "/kyc/admin/set-organizer-status",
        {
          userAddress,
          isOrganizer,
        },
        {
          headers: {
            "x-api-key": kycApiKey,
          },
        }
      );
    },
    onSuccess: () => {
      // Invalidate user queries to refresh the user data
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  return {
    updateStatus: updateStatusMutation.mutate,
    updateStatusAsync: updateStatusMutation.mutateAsync,
    isUpdating: updateStatusMutation.isPending,
    setOrganizerStatus: setOrganizerStatusMutation.mutate,
    setOrganizerStatusAsync: setOrganizerStatusMutation.mutateAsync,
    isSettingOrganizerStatus: setOrganizerStatusMutation.isPending,
  };
}
