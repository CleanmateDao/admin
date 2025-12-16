import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "../components/Layout";
import ApiKeyPrompt from "../components/ApiKeyPrompt";
import SearchBar from "../components/SearchBar";
import Pagination from "../components/Pagination";
import { useApiClient } from "../hooks/useApiClient";
import { getApiKey, setApiKey, getBaseUrl, setBaseUrl } from "../lib/auth";

export default function EmailPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const apiClient = useApiClient("email");

  useEffect(() => {
    const apiKey = getApiKey("email");
    const baseUrl = getBaseUrl("email");
    setAuthenticated(!!(apiKey && baseUrl));
    setLoading(false);
  }, []);

  const {
    data: status,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["email-status", apiClient],
    queryFn: async () => {
      if (!apiClient) throw new Error("Not authenticated");
      return apiClient.get("/status");
    },
    enabled: !!apiClient,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const handleAuthenticate = (apiKey: string, baseUrl: string) => {
    setApiKey("email", apiKey);
    setBaseUrl("email", baseUrl);
    setAuthenticated(true);
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setSearchQuery("");
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading">Loading...</div>
      </Layout>
    );
  }

  if (!authenticated) {
    return (
      <Layout>
        <ApiKeyPrompt
          serviceName="Email"
          onAuthenticate={handleAuthenticate}
          defaultBaseUrl={getBaseUrl("email")}
        />
      </Layout>
    );
  }

  // Filter status data based on search query
  const filteredData = status
    ? Object.entries(status).filter(([key, value]) => {
        if (!searchQuery) return true;
        const searchLower = searchQuery.toLowerCase();
        return (
          key.toLowerCase().includes(searchLower) ||
          String(value).toLowerCase().includes(searchLower)
        );
      })
    : [];

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <Layout>
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Email Service Administration</h1>
          <button className="btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {error && (
          <div className="error-message" style={{ marginBottom: "1.5rem" }}>
            {String(error)}
          </div>
        )}

        <div className="content-section">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <h2>Service Status</h2>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search status..."
            />
          </div>

          {isLoading ? (
            <div className="loading">Loading status...</div>
          ) : status ? (
            <>
              <table className="table">
                <thead>
                  <tr>
                    <th>Key</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map(([key, value]) => (
                    <tr key={key}>
                      <td>{key}</td>
                      <td>
                        {typeof value === "object" ? (
                          <pre style={{ margin: 0, fontSize: "0.9rem" }}>
                            {JSON.stringify(value, null, 2)}
                          </pre>
                        ) : (
                          String(value)
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  pageSize={pageSize}
                  totalItems={totalItems}
                  onPageSizeChange={setPageSize}
                />
              )}
            </>
          ) : (
            <p>No status information available</p>
          )}
        </div>

        <div className="content-section">
          <h2>Service Information</h2>
          <p>Base URL: {getBaseUrl("email")}</p>
          <p>API endpoints available:</p>
          <ul style={{ marginLeft: "1.5rem", marginTop: "0.5rem" }}>
            <li>GET /health - Health check</li>
            <li>GET /status - Service status</li>
            <li>
              POST /email-verification/request - Request verification code
            </li>
            <li>POST /email-verification/verify - Verify code</li>
            <li>POST /email-verification/regenerate - Regenerate code</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
