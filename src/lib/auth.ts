const STORAGE_PREFIX = 'admin_api_key_';

export function getApiKey(service: 'email' | 'kyc' | 'bank'): string | null {
  return localStorage.getItem(`${STORAGE_PREFIX}${service}`);
}

export function setApiKey(service: 'email' | 'kyc' | 'bank', apiKey: string): void {
  localStorage.setItem(`${STORAGE_PREFIX}${service}`, apiKey);
}

export function clearApiKey(service: 'email' | 'kyc' | 'bank'): void {
  localStorage.removeItem(`${STORAGE_PREFIX}${service}`);
}

export function getBaseUrl(service: 'email' | 'kyc' | 'bank'): string {
  const stored = localStorage.getItem(`${STORAGE_PREFIX}${service}_url`);
  if (stored) return stored;
  
  // Default URLs - can be configured
  const defaults = {
    email: 'http://localhost:3000',
    kyc: 'http://localhost:3002',
    bank: 'http://localhost:3002',
  };
  return defaults[service];
}

export function setBaseUrl(service: 'email' | 'kyc' | 'bank', url: string): void {
  localStorage.setItem(`${STORAGE_PREFIX}${service}_url`, url);
}
