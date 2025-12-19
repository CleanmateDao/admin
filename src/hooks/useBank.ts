import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "./useApiClient";
import type {
  Transaction,
  ExchangeRate,
  ExchangeRateInput,
} from "../types/services";

export function useBankTransactions(
  statusFilter?: string,
  activeTab?: string,
  startDate?: string,
  endDate?: string
) {
  const apiClient = useApiClient("bank");

  return useQuery({
    queryKey: [
      "bank-transactions",
      statusFilter,
      startDate,
      endDate,
      apiClient,
    ],
    queryFn: async () => {
      if (!apiClient) throw new Error("Not authenticated");
      const params = new URLSearchParams();
      params.append("limit", "100");
      if (statusFilter) {
        params.append("status", statusFilter);
      }
      if (startDate) {
        params.append("startDate", startDate);
      }
      if (endDate) {
        params.append("endDate", endDate);
      }
      const endpoint = `/admin/transactions?${params.toString()}`;
      return apiClient.get<{ data: Transaction[]; pagination: unknown }>(
        endpoint
      );
    },
    enabled: !!apiClient && activeTab === "transactions",
  });
}

export function useExchangeRates(activeTab?: string) {
  const apiClient = useApiClient("bank");

  return useQuery({
    queryKey: ["exchange-rates", apiClient],
    queryFn: async () => {
      if (!apiClient) throw new Error("Not authenticated");
      const response = await apiClient.get<{
        success: boolean;
        data: Array<{
          code: string;
          name: string;
          symbol: string;
          rateToB3TR: number;
          lastUpdated: string;
        }>;
      }>("/exchange-rate");

      // Map the response to match our ExchangeRate interface
      return response.data.map((rate) => ({
        id: rate.code,
        currencyCode: rate.code,
        currencyName: rate.name,
        symbol: rate.symbol,
        rateToB3TR: rate.rateToB3TR.toString(),
      }));
    },
    enabled: !!apiClient && activeTab === "exchange-rates",
  });
}

export function useBankMutations() {
  const apiClient = useApiClient("bank");
  const queryClient = useQueryClient();

  const setExchangeRateMutation = useMutation({
    mutationFn: async ({
      data,
      isEditing,
    }: {
      data: ExchangeRateInput;
      isEditing: boolean;
    }) => {
      if (!apiClient) throw new Error("Not authenticated");
      if (isEditing) {
        // Update existing rate
        return apiClient.patch(`/exchange-rate/${data.currencyCode}`, {
          currencyName: data.currencyName,
          symbol: data.symbol,
          rateToB3TR: parseFloat(data.rateToB3TR),
        });
      } else {
        // Create new rate
        return apiClient.post("/exchange-rate", {
          currencyCode: data.currencyCode,
          currencyName: data.currencyName,
          symbol: data.symbol,
          rateToB3TR: parseFloat(data.rateToB3TR),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exchange-rates"] });
      queryClient.invalidateQueries({ queryKey: ["bank-transactions"] });
    },
  });

  const deleteExchangeRateMutation = useMutation({
    mutationFn: async (currencyCode: string) => {
      if (!apiClient) throw new Error("Not authenticated");
      return apiClient.delete(`/exchange-rate/${currencyCode}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exchange-rates"] });
    },
  });

  return {
    setExchangeRate: setExchangeRateMutation.mutate,
    setExchangeRateAsync: setExchangeRateMutation.mutateAsync,
    isSettingExchangeRate: setExchangeRateMutation.isPending,
    deleteExchangeRate: deleteExchangeRateMutation.mutate,
    deleteExchangeRateAsync: deleteExchangeRateMutation.mutateAsync,
    isDeletingExchangeRate: deleteExchangeRateMutation.isPending,
  };
}
