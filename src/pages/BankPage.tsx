import { useState, useEffect, type ChangeEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
} from "@tanstack/react-table";
import Layout from "../components/Layout";
import ApiKeyPrompt from "../components/ApiKeyPrompt";
import SearchBar from "../components/SearchBar";
import FilterBar from "../components/FilterBar";
import Pagination from "../components/Pagination";
import ExchangeRateModal from "../components/ExchangeRateModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { useApiClient } from "../hooks/useApiClient";
import { getApiKey, setApiKey, getBaseUrl, setBaseUrl } from "../lib/auth";

interface Transaction {
  id: string;
  userId: string;
  amount: string;
  currency: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ExchangeRate {
  id: string;
  currencyCode: string;
  currencyName: string;
  symbol: string;
  rateToB3TR: string;
}

export default function BankPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"transactions" | "exchange-rates">(
    "transactions"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showExchangeRateModal, setShowExchangeRateModal] = useState(false);
  const [editingExchangeRate, setEditingExchangeRate] =
    useState<ExchangeRate | null>(null);
  const [deletingExchangeRate, setDeletingExchangeRate] =
    useState<ExchangeRate | null>(null);
  const apiClient = useApiClient("bank");
  const queryClient = useQueryClient();

  useEffect(() => {
    const apiKey = getApiKey("bank");
    const baseUrl = getBaseUrl("bank");
    setAuthenticated(!!(apiKey && baseUrl));
    setLoading(false);
  }, []);

  const {
    data: transactionsData,
    isLoading: isLoadingTransactions,
    error: transactionsError,
  } = useQuery({
    queryKey: ["bank-transactions", statusFilter, apiClient],
    queryFn: async () => {
      if (!apiClient) throw new Error("Not authenticated");
      const endpoint = statusFilter
        ? `/admin/transactions?limit=100&status=${statusFilter}`
        : "/admin/transactions?limit=100";
      return apiClient.get<{ data: Transaction[]; pagination: any }>(endpoint);
    },
    enabled: !!apiClient && activeTab === "transactions",
  });

  const {
    data: exchangeRatesData,
    isLoading: isLoadingRates,
    error: ratesError,
  } = useQuery({
    queryKey: ["exchange-rates", apiClient],
    queryFn: async () => {
      if (!apiClient) throw new Error("Not authenticated");
      const response = await apiClient.get<{
        success: boolean;
        data: Array<{
          code: string;
          name: string;
          symbol: string;
          rateToB3TR: number;
          lastUpdated: string;
        }>;
      }>("/exchange-rate");
      // Map the response to match our ExchangeRate interface
      return response.data.map((rate) => ({
        id: rate.code, // Use code as ID since we don't have a separate ID
        currencyCode: rate.code,
        currencyName: rate.name,
        symbol: rate.symbol,
        rateToB3TR: rate.rateToB3TR.toString(),
      }));
    },
    enabled: !!apiClient && activeTab === "exchange-rates",
  });

  const exchangeRates = exchangeRatesData || [];

  const setExchangeRateMutation = useMutation({
    mutationFn: async (data: {
      currencyCode: string;
      currencyName: string;
      symbol: string;
      rateToB3TR: string;
    }) => {
      if (!apiClient) throw new Error("Not authenticated");
      if (editingExchangeRate) {
        // Update existing rate
        return apiClient.patch(`/exchange-rate/${data.currencyCode}`, {
          currencyName: data.currencyName,
          symbol: data.symbol,
          rateToB3TR: parseFloat(data.rateToB3TR),
        });
      } else {
        // Create new rate
        return apiClient.post("/exchange-rate", {
          currencyCode: data.currencyCode,
          currencyName: data.currencyName,
          symbol: data.symbol,
          rateToB3TR: parseFloat(data.rateToB3TR),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exchange-rates"] });
      queryClient.invalidateQueries({ queryKey: ["bank-transactions"] });
      setShowExchangeRateModal(false);
      setEditingExchangeRate(null);
    },
  });

  const deleteExchangeRateMutation = useMutation({
    mutationFn: async (currencyCode: string) => {
      if (!apiClient) throw new Error("Not authenticated");
      return apiClient.delete(`/exchange-rate/${currencyCode}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exchange-rates"] });
      setDeletingExchangeRate(null);
    },
  });

  const transactions = transactionsData?.data || [];

  const transactionsColumns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: (info: CellContext<Transaction, string>) => (
        <span style={{ fontFamily: "monospace" }}>
          {(info.getValue() as string).substring(0, 8)}...
        </span>
      ),
    },
    {
      accessorKey: "userId",
      header: "User ID",
      cell: (info: CellContext<Transaction, string>) => (
        <span style={{ fontFamily: "monospace" }}>
          {(info.getValue() as string).substring(0, 8)}...
        </span>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
    },
    {
      accessorKey: "currency",
      header: "Currency",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (info: CellContext<Transaction, string>) => {
        const status = info.getValue() as string;
        return (
          <span
            className={`status-badge ${status.toLowerCase().replace("_", "-")}`}
          >
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: (info: CellContext<Transaction, string>) =>
        new Date(info.getValue() as string).toLocaleString(),
    },
  ];

  const exchangeRatesColumns: ColumnDef<ExchangeRate>[] = [
    {
      accessorKey: "currencyCode",
      header: "Code",
    },
    {
      accessorKey: "currencyName",
      header: "Name",
    },
    {
      accessorKey: "symbol",
      header: "Symbol",
    },
    {
      accessorKey: "rateToB3TR",
      header: "Rate to B3TR",
      cell: (info: CellContext<ExchangeRate, string>) =>
        parseFloat(info.getValue() as string).toFixed(6),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (info: CellContext<ExchangeRate, unknown>) => {
        const rate = info.row.original;
        return (
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              className="btn-secondary"
              onClick={() => {
                setEditingExchangeRate(rate);
                setShowExchangeRateModal(true);
              }}
            >
              Edit
            </button>
            <button
              className="btn-secondary"
              onClick={() => setDeletingExchangeRate(rate)}
              style={{ background: "#f44336" }}
            >
              Delete
            </button>
          </div>
        );
      },
    },
  ];

  const transactionsTable = useReactTable({
    data: transactions,
    columns: transactionsColumns,
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
      row: { original: Transaction },
      _columnId: string,
      filterValue: string
    ) => {
      const search = filterValue.toLowerCase();
      return (
        row.original.id.toLowerCase().includes(search) ||
        row.original.userId.toLowerCase().includes(search) ||
        row.original.currency.toLowerCase().includes(search) ||
        row.original.status.toLowerCase().includes(search)
      );
    }) as FilterFn<Transaction>,
    state: {
      globalFilter: searchQuery,
    },
  });

  const exchangeRatesTable = useReactTable({
    data: exchangeRates,
    columns: exchangeRatesColumns,
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
      row: { original: ExchangeRate },
      _columnId: string,
      filterValue: string
    ) => {
      const search = filterValue.toLowerCase();
      return (
        row.original.currencyCode.toLowerCase().includes(search) ||
        row.original.currencyName.toLowerCase().includes(search) ||
        row.original.symbol.toLowerCase().includes(search)
      );
    }) as FilterFn<ExchangeRate>,
    state: {
      globalFilter: searchQuery,
    },
  });

  const handleAuthenticate = (apiKey: string, baseUrl: string) => {
    setApiKey("bank", apiKey);
    setBaseUrl("bank", baseUrl);
    setAuthenticated(true);
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setActiveTab("transactions");
    setSearchQuery("");
    setStatusFilter("");
    setShowExchangeRateModal(false);
    setEditingExchangeRate(null);
    setDeletingExchangeRate(null);
  };

  const handleAddExchangeRate = () => {
    setEditingExchangeRate(null);
    setShowExchangeRateModal(true);
  };

  const handleSaveExchangeRate = (data: {
    currencyCode: string;
    currencyName: string;
    symbol: string;
    rateToB3TR: string;
  }) => {
    setExchangeRateMutation.mutate(data);
  };

  const handleDeleteExchangeRate = () => {
    if (deletingExchangeRate) {
      deleteExchangeRateMutation.mutate(deletingExchangeRate.currencyCode);
    }
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
          serviceName="Bank"
          onAuthenticate={handleAuthenticate}
          defaultBaseUrl={getBaseUrl("bank")}
        />
      </Layout>
    );
  }

  const error = transactionsError || ratesError;
  const stats = {
    total: transactions.length,
    completed: transactions.filter((t: Transaction) => t.status === "COMPLETED")
      .length,
    pending: transactions.filter(
      (t: Transaction) => t.status === "PENDING_PAYMENT"
    ).length,
    failed: transactions.filter((t: Transaction) => t.status === "FAILED")
      .length,
  };

  return (
    <Layout>
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Bank Service Administration</h1>
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
            <h3>Total Transactions</h3>
            <div className="value">{stats.total}</div>
          </div>
          <div className="stat-card">
            <h3>Completed</h3>
            <div className="value">{stats.completed}</div>
          </div>
          <div className="stat-card">
            <h3>Pending</h3>
            <div className="value">{stats.pending}</div>
          </div>
          <div className="stat-card">
            <h3>Failed</h3>
            <div className="value">{stats.failed}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
          <button
            className={
              activeTab === "transactions" ? "btn-primary" : "btn-secondary"
            }
            onClick={() => setActiveTab("transactions")}
          >
            Transactions
          </button>
          <button
            className={
              activeTab === "exchange-rates" ? "btn-primary" : "btn-secondary"
            }
            onClick={() => setActiveTab("exchange-rates")}
          >
            Exchange Rates
          </button>
        </div>

        {activeTab === "transactions" && (
          <div className="content-section">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <h2>Transactions</h2>
              <div
                style={{ display: "flex", gap: "1rem", alignItems: "center" }}
              >
                <FilterBar>
                  <select
                    value={statusFilter}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                      setStatusFilter(e.target.value)
                    }
                    className="filter-select"
                  >
                    <option value="">All Statuses</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="PENDING_PAYMENT">Pending Payment</option>
                    <option value="FAILED">Failed</option>
                  </select>
                </FilterBar>
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search transactions..."
                />
              </div>
            </div>

            {isLoadingTransactions ? (
              <div className="loading">Loading transactions...</div>
            ) : transactions.length === 0 ? (
              <p>No transactions found</p>
            ) : (
              <>
                <div className="table-container">
                  <table className="table">
                    <thead>
                      {transactionsTable
                        .getHeaderGroups()
                        .map((headerGroup) => (
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
                      {transactionsTable.getRowModel().rows.map((row) => (
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
                  currentPage={
                    transactionsTable.getState().pagination.pageIndex + 1
                  }
                  totalPages={transactionsTable.getPageCount()}
                  onPageChange={(page) =>
                    transactionsTable.setPageIndex(page - 1)
                  }
                  pageSize={transactionsTable.getState().pagination.pageSize}
                  totalItems={transactions.length}
                  onPageSizeChange={(size) =>
                    transactionsTable.setPageSize(size)
                  }
                />
              </>
            )}
          </div>
        )}

        {activeTab === "exchange-rates" && (
          <div className="content-section">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <h2>Exchange Rates</h2>
              <div
                style={{ display: "flex", gap: "1rem", alignItems: "center" }}
              >
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search exchange rates..."
                />
                <button className="btn-primary" onClick={handleAddExchangeRate}>
                  Add Exchange Rate
                </button>
              </div>
            </div>

            {isLoadingRates ? (
              <div className="loading">Loading exchange rates...</div>
            ) : exchangeRates.length === 0 ? (
              <p>
                No exchange rates found. Click "Add Exchange Rate" to create
                one.
              </p>
            ) : (
              <>
                <div className="table-container">
                  <table className="table">
                    <thead>
                      {exchangeRatesTable
                        .getHeaderGroups()
                        .map((headerGroup) => (
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
                      {exchangeRatesTable.getRowModel().rows.map((row) => (
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
                  currentPage={
                    exchangeRatesTable.getState().pagination.pageIndex + 1
                  }
                  totalPages={exchangeRatesTable.getPageCount()}
                  onPageChange={(page) =>
                    exchangeRatesTable.setPageIndex(page - 1)
                  }
                  pageSize={exchangeRatesTable.getState().pagination.pageSize}
                  totalItems={exchangeRates.length}
                  onPageSizeChange={(size) =>
                    exchangeRatesTable.setPageSize(size)
                  }
                />
              </>
            )}
          </div>
        )}

        <ExchangeRateModal
          isOpen={showExchangeRateModal}
          onClose={() => {
            setShowExchangeRateModal(false);
            setEditingExchangeRate(null);
          }}
          onSave={handleSaveExchangeRate}
          exchangeRate={editingExchangeRate}
          isLoading={setExchangeRateMutation.isPending}
        />

        <DeleteConfirmModal
          isOpen={!!deletingExchangeRate}
          onClose={() => setDeletingExchangeRate(null)}
          onConfirm={handleDeleteExchangeRate}
          title="Delete Exchange Rate"
          message="Are you sure you want to delete this exchange rate? This action cannot be undone."
          itemName={
            deletingExchangeRate
              ? `${deletingExchangeRate.currencyCode} - ${deletingExchangeRate.currencyName}`
              : undefined
          }
          isLoading={deleteExchangeRateMutation.isPending}
        />
      </div>
    </Layout>
  );
}
