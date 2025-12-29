import { ApiKeyKey, useApiKey } from "../contexts/ApiKeyContext";

export function useServiceAuth(key: ApiKeyKey) {
  const { apiKey } = useApiKey();

  return {
    authenticated: !!apiKey[key],
    loading: false,
  };
}
