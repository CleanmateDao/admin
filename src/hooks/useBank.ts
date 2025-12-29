import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bankClient } from "../services/clients/bank";
import { useApiKey } from "../contexts/ApiKeyContext";
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
  const { apiKey } = useApiKey();

  const bankApiKey = apiKey["bank"];

  return useQuery({
    queryKey: ["bank-transactions", statusFilter, startDate, endDate],
    queryFn: async () => {
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
      const response = await bankClient.get(
        `/api/admin/transactions?${params.toString()}`,
        {
          headers: {
            "x-api-key": bankApiKey,
          },
        }
      );
      // Extract the data from the API response structure: { success: true, data: [...], pagination: {...} }
      return response.data?.data || [];
    },
    enabled: !!bankApiKey && activeTab === "transactions",
  });
}

export function useExchangeRates(activeTab?: string) {
  const { apiKey } = useApiKey();

  const bankApiKey = apiKey["bank"];

  return useQuery({
    queryKey: ["exchange-rates"],
    queryFn: async () => {
      const response = await bankClient.get("/api/admin/exchange-rates", {
        headers: {
          "x-api-key": bankApiKey,
        },
      });

      // Extract the data array from the API response structure: { success: true, data: [...] }
      // response.data is the axios response data, which contains { success: true, data: [...] }
      const apiResponse = response.data as {
        success?: boolean;
        data?: Array<{
          code: string;
          name: string;
          symbol: string;
          rateToB3TR: number;
          lastUpdated: string;
        }>;
      };

      const ratesArray = Array.isArray(apiResponse?.data)
        ? apiResponse.data
        : Array.isArray(response.data)
        ? response.data
        : [];

      // Map the response to match our ExchangeRate interface
      return ratesArray.map((rate: any) => ({
        id: rate.code,
        currencyCode: rate.code,
        currencyName: rate.name,
        symbol: rate.symbol,
        rateToB3TR: rate.rateToB3TR.toString(),
      }));
    },
    enabled: !!bankApiKey && activeTab === "exchange-rates",
  });
}

export function useBankMutations() {
  const queryClient = useQueryClient();
  const { apiKey } = useApiKey();

  const bankApiKey = apiKey["bank"];

  const setExchangeRateMutation = useMutation({
    mutationFn: async ({
      data,
    }: {
      data: ExchangeRateInput;
      isEditing: boolean;
    }) => {
      return bankClient.post(
        "/api/admin/exchange-rate",
        {
          currencyCode: data.currencyCode,
          currencyName: data.currencyName,
          symbol: data.symbol,
          rateToB3TR: parseFloat(data.rateToB3TR),
        },
        {
          headers: {
            "x-api-key": bankApiKey,
          },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exchange-rates"] });
      queryClient.invalidateQueries({ queryKey: ["bank-transactions"] });
    },
  });

  const deleteExchangeRateMutation = useMutation({
    mutationFn: async (currencyCode: string) => {
      return bankClient.delete(`/api/admin/exchange-rate/${currencyCode}`, {
        headers: {
          "x-api-key": bankApiKey,
        },
      });
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
