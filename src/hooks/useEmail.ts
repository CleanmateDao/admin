import { useQuery } from "@tanstack/react-query";
import { emailClient } from "../services/clients/email";
import { useApiKey } from "../contexts/ApiKeyContext";

export function useEmailStatus() {
  const { apiKey } = useApiKey();

  const emailApiKey = apiKey["email"];

  return useQuery({
    queryKey: ["email-status"],
    queryFn: async () => {
      const response = await emailClient.get("/status", {
        headers: {
          "x-api-key": emailApiKey,
        },
      });
      return response.data;
    },
    enabled: !!emailApiKey,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
