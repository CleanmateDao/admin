import { useState, useEffect } from "react";
import { getApiKey, getBaseUrl } from "../lib/auth";

type Service = "email" | "kyc" | "bank";

export function useServiceAuth(service: Service) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiKey = getApiKey(service);
    const baseUrl = getBaseUrl(service);
    setAuthenticated(!!(apiKey && baseUrl));
    setLoading(false);
  }, [service]);

  return { authenticated, loading };
}

