import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type ApiKeyKey = "kyc" | "email" | "bank";

interface ApiKeyContextType {
  apiKey: Record<ApiKeyKey, string>;
  setApiKey: (key: ApiKeyKey, apiKey: string) => void;
  clearApiKey: () => void;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

const STORAGE_KEY = "admin_api_keys";

function loadApiKeysFromStorage(): Record<ApiKeyKey, string> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        kyc: parsed.kyc || "",
        email: parsed.email || "",
        bank: parsed.bank || "",
      };
    }
  } catch (error) {
    console.error("Failed to load API keys from localStorage:", error);
  }
  return {
    kyc: "",
    email: "",
    bank: "",
  };
}

function saveApiKeysToStorage(apiKeys: Record<ApiKeyKey, string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apiKeys));
  } catch (error) {
    console.error("Failed to save API keys to localStorage:", error);
  }
}

export function ApiKeyProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKeyState] = useState<Record<ApiKeyKey, string>>(() =>
    loadApiKeysFromStorage()
  );

  // Load from localStorage on mount
  useEffect(() => {
    const stored = loadApiKeysFromStorage();
    setApiKeyState(stored);
  }, []);

  const setApiKey = (key: ApiKeyKey, apiKeyValue: string) => {
    setApiKeyState((prev) => {
      const updated = { ...prev, [key]: apiKeyValue };
      saveApiKeysToStorage(updated);
      return updated;
    });
  };

  const clearApiKey = () => {
    const cleared = {
      kyc: "",
      email: "",
      bank: "",
    };
    setApiKeyState(cleared);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear API keys from localStorage:", error);
    }
  };

  return (
    <ApiKeyContext.Provider
      value={{
        apiKey,
        setApiKey,
        clearApiKey,
      }}
    >
      {children}
    </ApiKeyContext.Provider>
  );
}

export function useApiKey() {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error("useApiKey must be used within an ApiKeyProvider");
  }
  return context;
}
