import { useState } from 'react';

interface ApiKeyPromptProps {
  serviceName: string;
  onAuthenticate: (apiKey: string, baseUrl: string) => void;
  defaultBaseUrl?: string;
}

export default function ApiKeyPrompt({ 
  serviceName, 
  onAuthenticate,
  defaultBaseUrl = ''
}: ApiKeyPromptProps) {
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState(defaultBaseUrl);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!apiKey.trim() || !baseUrl.trim()) {
      setError('Please enter both API key and base URL');
      setLoading(false);
      return;
    }

    try {
      const testUrl = baseUrl.trim().replace(/\/$/, '');
      const response = await fetch(`${testUrl}/health`, {
        headers: {
          'x-api-key': apiKey.trim(),
        },
      });

      // Accept 200, 404 (health might not exist), or other statuses
      // The actual API will validate the key on real requests
      if (response.status === 401 || response.status === 403) {
        throw new Error('Invalid API key');
      }

      onAuthenticate(apiKey.trim(), testUrl);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your API key and URL.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="api-key-prompt">
      <div className="api-key-form">
        <h2>{serviceName} Service Admin</h2>
        <p>Please enter your API key and service endpoint URL to continue.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="base-url">Service Base URL:</label>
            <input
              type="text"
              id="base-url"
              placeholder="http://localhost:3000"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              required
              disabled={loading}
            />
          </div>
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
            {loading ? 'Authenticating...' : 'Authenticate'}
          </button>
          {error && (
            <div className="error-message" style={{ display: 'block' }}>
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

