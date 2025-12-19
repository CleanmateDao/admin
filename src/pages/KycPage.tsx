import { useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import type { ColumnDef, CellContext, FilterFn } from "@tanstack/react-table";
import ApiKeyPrompt from "../components/ApiKeyPrompt";
import SearchBar from "../components/SearchBar";
import FilterBar from "../components/FilterBar";
import Pagination from "../components/Pagination";
import DateRangeFilter from "../components/DateRangeFilter";
import KycApproveModal from "../components/KycApproveModal";
import KycRejectModal from "../components/KycRejectModal";
import { useServiceAuth } from "../hooks/useServiceAuth";
import {
  useKycSubmissions,
  useKycSubmissionDetails,
  useKycMutations,
} from "../hooks/useKyc";
import { setApiKey, setBaseUrl, getBaseUrl } from "../lib/auth";
import type { KycSubmission } from "../types/services";

export default function KycPage() {
  const navigate = useNavigate();
  const { authenticated, loading } = useServiceAuth("kyc");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedSubmission, setSelectedSubmission] =
    useState<KycSubmission | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const {
    data: submissions = [],
    isLoading,
    error,
  } = useKycSubmissions(
    statusFilter || undefined,
    startDate || undefined,
    endDate || undefined
  );

  const { data: submissionDetails } = useKycSubmissionDetails(
    selectedSubmission?.submissionId || null
  );

  const { updateStatus, isUpdating } = useKycMutations();

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Pending';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  const columns: ColumnDef<KycSubmission>[] = [
    {
      accessorKey: "firstName",
      header: "Name",
      cell: (info: CellContext<KycSubmission, unknown>) => {
        const row = info.row.original;
        return `${row.firstName} ${row.lastName}`;
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: (info: CellContext<KycSubmission, unknown>) => (
        <span>{info.getValue() as string}</span>
      ),
    },
    {
      accessorKey: "walletAddress",
      header: "Wallet Address",
      cell: (info: CellContext<KycSubmission, unknown>) => {
        const address = info.getValue() as string | undefined;
        return address ? (
          <span style={{ fontFamily: "monospace", fontSize: "0.875rem" }}>
            {address.length > 20 ? `${address.slice(0, 10)}...${address.slice(-8)}` : address}
          </span>
        ) : (
          <span className="text-muted-foreground">N/A</span>
        );
      },
    },
    {
      accessorKey: "documentType",
      header: "Document Type",
      cell: (info: CellContext<KycSubmission, unknown>) => {
        const docType = info.getValue() as string;
        return docType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (info: CellContext<KycSubmission, unknown>) => {
        const status = info.getValue() as string;
        return (
          <span className={`status-badge ${status.toLowerCase()}`}>
            {getStatusLabel(status)}
          </span>
        );
      },
    },
    {
      accessorKey: "submittedAt",
      header: "Submitted At",
      cell: (info: CellContext<KycSubmission, unknown>) =>
        new Date(info.getValue() as string).toLocaleString(),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (info: CellContext<KycSubmission, unknown>) => (
        <button
          className="btn-secondary"
          onClick={() => navigate(`/kyc/${info.row.original.submissionId}`)}
        >
          View
        </button>
      ),
    },
  ];

  const table = useReactTable({
    data: submissions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 25,
      },
    },
    globalFilterFn: ((
      row: { original: KycSubmission },
      _columnId: string,
      filterValue: string
    ) => {
      const search = filterValue.toLowerCase();
      const submission = row.original;
      return (
        submission.firstName.toLowerCase().includes(search) ||
        submission.lastName.toLowerCase().includes(search) ||
        submission.email.toLowerCase().includes(search) ||
        (submission.walletAddress?.toLowerCase().includes(search) ?? false) ||
        submission.status.toLowerCase().includes(search) ||
        submission.submissionId.toLowerCase().includes(search) ||
        submission.userId.toLowerCase().includes(search)
      );
    }) as FilterFn<KycSubmission>,
    state: {
      globalFilter: searchQuery,
    },
  });

  const handleAuthenticate = (apiKey: string, baseUrl: string) => {
    setApiKey("kyc", apiKey);
    setBaseUrl("kyc", baseUrl);
    window.location.reload(); // Reload to update auth state
  };

  const handleLogout = () => {
    setStatusFilter("");
    setSearchQuery("");
    setStartDate("");
    setEndDate("");
    setSelectedSubmission(null);
    setShowApproveModal(false);
    setShowRejectModal(false);
    // Clear auth and reload
    localStorage.removeItem("admin_api_key_kyc");
    localStorage.removeItem("admin_api_key_kyc_url");
    window.location.reload();
  };

  const handleClearDateRange = () => {
    setStartDate("");
    setEndDate("");
  };

  const handleApprove = () => {
    if (!selectedSubmission) return;
    updateStatus(
      {
        submissionId: selectedSubmission.submissionId,
        status: "approved",
      },
      {
        onSuccess: () => {
          setSelectedSubmission(null);
          setShowApproveModal(false);
        },
      }
    );
  };

  const handleReject = (reason: string) => {
    if (!selectedSubmission) return;
    updateStatus(
      {
        submissionId: selectedSubmission.submissionId,
        status: "rejected",
        rejectionReason: reason,
      },
      {
        onSuccess: () => {
          setSelectedSubmission(null);
          setShowRejectModal(false);
        },
      }
    );
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!authenticated) {
    return (
      <ApiKeyPrompt
        serviceName="KYC"
        onAuthenticate={handleAuthenticate}
        defaultBaseUrl={getBaseUrl("kyc")}
      />
    );
  }

  const stats = {
    total: submissions.length,
    pending: submissions.filter((s: KycSubmission) => s.status === "pending")
      .length,
    approved: submissions.filter((s: KycSubmission) => s.status === "approved")
      .length,
    rejected: submissions.filter((s: KycSubmission) => s.status === "rejected")
      .length,
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>KYC Service Administration</h1>
        <button className="btn-secondary" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {error && (
        <div className="error-message" style={{ marginBottom: "1.5rem" }}>
          {String(error)}
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Submissions</h3>
          <div className="value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <h3>Pending</h3>
          <div className="value">{stats.pending}</div>
        </div>
        <div className="stat-card">
          <h3>Approved</h3>
          <div className="value">{stats.approved}</div>
        </div>
        <div className="stat-card">
          <h3>Rejected</h3>
          <div className="value">{stats.rejected}</div>
        </div>
      </div>

      <div className="content-section">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
          <h2>KYC Submissions</h2>
          <div className="flex gap-4 items-center flex-wrap">
            <FilterBar>
              <select
                value={statusFilter}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setStatusFilter(e.target.value)
                }
                className="filter-select"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </FilterBar>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by name, email, wallet, or ID..."
            />
          </div>
        </div>
        <div className="mb-4">
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onClear={handleClearDateRange}
          />
        </div>

        {isLoading ? (
          <div className="loading">Loading submissions...</div>
        ) : submissions.length === 0 ? (
          <p>No submissions found</p>
        ) : (
          <>
            <div className="table-container">
              <table className="table">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th key={header.id}>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={table.getState().pagination.pageIndex + 1}
              totalPages={table.getPageCount()}
              onPageChange={(page) => table.setPageIndex(page - 1)}
              pageSize={table.getState().pagination.pageSize}
              totalItems={submissions.length}
              onPageSizeChange={(size) => table.setPageSize(size)}
            />
          </>
        )}
      </div>

      {selectedSubmission && (
        <div className="content-section">
          <div className="flex justify-between items-center mb-4">
            <h2>Submission Details</h2>
            <button
              className="btn-secondary"
              onClick={() => setSelectedSubmission(null)}
            >
              Close
            </button>
          </div>
          {submissionDetails ? (
            <>
              <pre className="bg-muted p-4 rounded overflow-auto text-foreground mb-4 border border-border">
                {JSON.stringify(submissionDetails, null, 2)}
              </pre>
              {submissionDetails.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    className="btn-primary"
                    onClick={() => setShowApproveModal(true)}
                    disabled={isUpdating}
                  >
                    Approve
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => setShowRejectModal(true)}
                    disabled={isUpdating}
                  >
                    Reject
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="loading">Loading details...</div>
          )}
        </div>
      )}

      <KycApproveModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleApprove}
        submissionId={selectedSubmission?.submissionId}
        address={selectedSubmission?.walletAddress}
        isLoading={isUpdating}
      />

      <KycRejectModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleReject}
        submissionId={selectedSubmission?.submissionId}
        isLoading={isUpdating}
      />
    </div>
  );
}
