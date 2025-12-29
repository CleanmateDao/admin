import { useState } from "react";

interface ApiKeyPromptProps {
  serviceName: string;
  onAuthenticate: (apiKey: string) => void;
}

export default function ApiKeyPrompt({
  serviceName,
  onAuthenticate,
}: ApiKeyPromptProps) {
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!apiKey.trim()) {
      setError("Please enter an API key");
      setLoading(false);
      return;
    }

    onAuthenticate(apiKey.trim());
    setLoading(false);
  };

  return (
    <div className="api-key-prompt">
      <div className="api-key-form">
        <h2>{serviceName} Service Admin</h2>
        <p>Please enter your API key to continue.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="api-key">API Key:</label>
            <input
              type="password"
              id="api-key"
              placeholder="Enter your API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Authenticating..." : "Authenticate"}
          </button>
          {error && (
            <div className="error-message" style={{ display: "block" }}>
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
