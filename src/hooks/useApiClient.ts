import { useMemo } from 'react';
import { ApiClient } from '../lib/api';
import { getApiKey, getBaseUrl } from '../lib/auth';

export function useApiClient(service: 'email' | 'kyc' | 'bank'): ApiClient | null {
  return useMemo(() => {
    const apiKey = getApiKey(service);
    const baseUrl = getBaseUrl(service);
    
    if (apiKey && baseUrl) {
      return new ApiClient({ baseUrl, apiKey });
    }
    return null;
  }, [service]);
}

