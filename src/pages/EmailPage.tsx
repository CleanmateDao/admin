import { useState } from "react";
import ApiKeyPrompt from "../components/ApiKeyPrompt";
import SearchBar from "../components/SearchBar";
import Pagination from "../components/Pagination";
import { useServiceAuth } from "../hooks/useServiceAuth";
import { useEmailStatus } from "../hooks/useEmail";
import { setApiKey, setBaseUrl, getBaseUrl } from "../lib/auth";

export default function EmailPage() {
  const { authenticated, loading } = useServiceAuth("email");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { data: status, error, isLoading } = useEmailStatus();

  const handleAuthenticate = (apiKey: string, baseUrl: string) => {
    setApiKey("email", apiKey);
    setBaseUrl("email", baseUrl);
    window.location.reload();
  };

  const handleLogout = () => {
    setSearchQuery("");
    setCurrentPage(1);
    localStorage.removeItem("admin_api_key_email");
    localStorage.removeItem("admin_api_key_email_url");
    window.location.reload();
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!authenticated) {
    return (
      <ApiKeyPrompt
        serviceName="Email"
        onAuthenticate={handleAuthenticate}
        defaultBaseUrl={getBaseUrl("email")}
      />
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
        <div className="flex justify-between items-center mb-4">
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
                        <pre className="m-0 text-sm">
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
        <p className="text-foreground">Base URL: {getBaseUrl("email")}</p>
        <p className="text-foreground">API endpoints available:</p>
        <ul className="ml-6 mt-2 list-disc text-foreground">
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
  );
}
