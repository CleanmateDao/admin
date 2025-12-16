import { useState, useEffect, type ChangeEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
  CellContext,
  FilterFn,
} from '@tanstack/react-table';
import Layout from '../components/Layout';
import ApiKeyPrompt from '../components/ApiKeyPrompt';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import Pagination from '../components/Pagination';
import KycApproveModal from '../components/KycApproveModal';
import KycRejectModal from '../components/KycRejectModal';
import { useApiClient } from '../hooks/useApiClient';
import { getApiKey, setApiKey, getBaseUrl, setBaseUrl } from '../lib/auth';

interface KycSubmission {
  id: string;
  address: string;
  status: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export default function KycPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<KycSubmission | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const apiClient = useApiClient('kyc');
  const queryClient = useQueryClient();

  useEffect(() => {
    const apiKey = getApiKey('kyc');
    const baseUrl = getBaseUrl('kyc');
    setAuthenticated(!!(apiKey && baseUrl));
    setLoading(false);
  }, []);

  const { data: submissions = [], isLoading, error } = useQuery({
    queryKey: ['kyc-submissions', statusFilter, apiClient],
    queryFn: async () => {
      if (!apiClient) throw new Error('Not authenticated');
      const endpoint = statusFilter
        ? `/kyc/admin/submissions?status=${statusFilter}`
        : '/kyc/admin/submissions';
      return apiClient.get<KycSubmission[]>(endpoint);
    },
    enabled: !!apiClient,
  });

  const { data: submissionDetails } = useQuery({
    queryKey: ['kyc-submission-details', selectedSubmission?.id, apiClient],
    queryFn: async () => {
      if (!apiClient || !selectedSubmission) throw new Error('Not authenticated');
      return apiClient.get<KycSubmission>(`/kyc/admin/submissions/${selectedSubmission.id}`);
    },
    enabled: !!apiClient && !!selectedSubmission,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ submissionId, status, rejectionReason }: { submissionId: string; status: string; rejectionReason?: string }) => {
      if (!apiClient) throw new Error('Not authenticated');
      return apiClient.post('/kyc/admin/update-status', {
        submissionId,
        status,
        rejectionReason,
        reviewedBy: 'admin',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kyc-submissions'] });
      setSelectedSubmission(null);
      setShowApproveModal(false);
      setShowRejectModal(false);
    },
  });

  const columns: ColumnDef<KycSubmission>[] = [
    {
      accessorKey: 'address',
      header: 'Address',
      cell: (info: CellContext<KycSubmission, string>) => <span style={{ fontFamily: 'monospace' }}>{info.getValue() as string}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (info: CellContext<KycSubmission, string>) => {
        const status = info.getValue() as string;
        return (
          <span className={`status-badge ${status.toLowerCase()}`}>
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: 'submittedAt',
      header: 'Submitted At',
      cell: (info: CellContext<KycSubmission, string>) => new Date(info.getValue() as string).toLocaleString(),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (info: CellContext<KycSubmission, unknown>) => (
        <button
          className="btn-secondary"
          onClick={() => setSelectedSubmission(info.row.original)}
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
    globalFilterFn: ((row: { original: KycSubmission }, _columnId: string, filterValue: string) => {
      const search = filterValue.toLowerCase();
      return (
        row.original.address.toLowerCase().includes(search) ||
        row.original.status.toLowerCase().includes(search) ||
        row.original.id.toLowerCase().includes(search)
      );
    }) as FilterFn<KycSubmission>,
    state: {
      globalFilter: searchQuery,
    },
  });

  const handleAuthenticate = (apiKey: string, baseUrl: string) => {
    setApiKey('kyc', apiKey);
    setBaseUrl('kyc', baseUrl);
    setAuthenticated(true);
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setStatusFilter('');
    setSearchQuery('');
    setSelectedSubmission(null);
    setShowApproveModal(false);
    setShowRejectModal(false);
  };

  const handleApprove = () => {
    if (!selectedSubmission) return;
    updateStatusMutation.mutate({
      submissionId: selectedSubmission.id,
      status: 'VERIFIED',
    });
  };

  const handleReject = (reason: string) => {
    if (!selectedSubmission) return;
    updateStatusMutation.mutate({
      submissionId: selectedSubmission.id,
      status: 'REJECTED',
      rejectionReason: reason,
    });
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
          serviceName="KYC"
          onAuthenticate={handleAuthenticate}
          defaultBaseUrl={getBaseUrl('kyc')}
        />
      </Layout>
    );
  }

  const stats = {
    total: submissions.length,
    pending: submissions.filter((s: KycSubmission) => s.status === 'PENDING').length,
    verified: submissions.filter((s: KycSubmission) => s.status === 'VERIFIED').length,
    rejected: submissions.filter((s: KycSubmission) => s.status === 'REJECTED').length,
  };

  return (
    <Layout>
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>KYC Service Administration</h1>
          <button className="btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {error && (
          <div className="error-message" style={{ marginBottom: '1.5rem' }}>
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
            <h3>Verified</h3>
            <div className="value">{stats.verified}</div>
          </div>
          <div className="stat-card">
            <h3>Rejected</h3>
            <div className="value">{stats.rejected}</div>
          </div>
        </div>

        <div className="content-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h2>KYC Submissions</h2>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <FilterBar>
                <select
                  value={statusFilter}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="VERIFIED">Verified</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </FilterBar>
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search by address or ID..."
              />
            </div>
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
                            {flexRender(header.column.columnDef.header, header.getContext())}
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
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>Submission Details</h2>
              <button className="btn-secondary" onClick={() => setSelectedSubmission(null)}>
                Close
              </button>
            </div>
            {submissionDetails ? (
              <>
                <pre
                  style={{
                    background: '#1a1a1a',
                    padding: '1rem',
                    borderRadius: '4px',
                    overflow: 'auto',
                    color: 'rgba(255, 255, 255, 0.87)',
                    marginBottom: '1rem',
                  }}
                >
                  {JSON.stringify(submissionDetails, null, 2)}
                </pre>
                {submissionDetails.status === 'PENDING' && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn-primary"
                      onClick={() => setShowApproveModal(true)}
                      disabled={updateStatusMutation.isPending}
                    >
                      Approve
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => setShowRejectModal(true)}
                      disabled={updateStatusMutation.isPending}
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
          submissionId={selectedSubmission?.id}
          address={selectedSubmission?.address}
          isLoading={updateStatusMutation.isPending}
        />

        <KycRejectModal
          isOpen={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          onConfirm={handleReject}
          submissionId={selectedSubmission?.id}
          isLoading={updateStatusMutation.isPending}
        />
      </div>
    </Layout>
  );
}
