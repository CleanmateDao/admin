import { useState, type ChangeEvent } from "react";
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
import ExchangeRateModal from "../components/ExchangeRateModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { useServiceAuth } from "../hooks/useServiceAuth";
import {
  useBankTransactions,
  useExchangeRates,
  useBankMutations,
} from "../hooks/useBank";
import { setApiKey, setBaseUrl, getBaseUrl } from "../lib/auth";
import type { Transaction, ExchangeRate } from "../types/services";

export default function BankPage() {
  const { authenticated, loading } = useServiceAuth("bank");
  const [activeTab, setActiveTab] = useState<"transactions" | "exchange-rates">(
    "transactions"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [showExchangeRateModal, setShowExchangeRateModal] = useState(false);
  const [editingExchangeRate, setEditingExchangeRate] =
    useState<ExchangeRate | null>(null);
  const [deletingExchangeRate, setDeletingExchangeRate] =
    useState<ExchangeRate | null>(null);

  const {
    data: transactionsData,
    isLoading: isLoadingTransactions,
    error: transactionsError,
  } = useBankTransactions(
    statusFilter || undefined,
    activeTab,
    startDate || undefined,
    endDate || undefined
  );

  const {
    data: exchangeRatesData = [],
    isLoading: isLoadingRates,
    error: ratesError,
  } = useExchangeRates(activeTab);

  const {
    setExchangeRate,
    isSettingExchangeRate,
    deleteExchangeRate,
    isDeletingExchangeRate,
  } = useBankMutations();

  const transactions = transactionsData?.data || [];

  const formatAddress = (address: string | undefined, length = 8) => {
    if (!address) return "-";
    if (address.length <= length * 2) return address;
    return `${address.substring(0, length)}...${address.substring(address.length - length)}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatAmount = (amount: string | number | undefined) => {
    if (!amount) return "-";
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(num)) return amount.toString();
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(num);
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    const normalized = status.toLowerCase();
    if (normalized === "completed") return "#4caf50";
    if (normalized === "pending" || normalized === "pending_payment") return "#ff9800";
    if (normalized === "failed") return "#f44336";
    return "#757575";
  };

  const transactionsColumns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "id",
      header: "Transaction ID",
      cell: (info: CellContext<Transaction, unknown>) => {
        const id = info.getValue() as string;
        return (
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "0.875rem",
              cursor: "pointer",
              position: "relative",
            }}
            title={id}
            onClick={() => copyToClipboard(id)}
          >
            {formatAddress(id)}
          </span>
        );
      },
    },
    {
      accessorKey: "userId",
      header: "User ID",
      cell: (info: CellContext<Transaction, unknown>) => {
        const userId = info.getValue() as string;
        return (
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
            title={userId}
            onClick={() => copyToClipboard(userId)}
          >
            {formatAddress(userId)}
          </span>
        );
      },
    },
    {
      accessorKey: "walletAddress",
      header: "Wallet Address",
      cell: (info: CellContext<Transaction, unknown>) => {
        const address = info.row.original.walletAddress;
        if (!address) return <span style={{ color: "#999" }}>-</span>;
        return (
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
            title={address}
            onClick={() => copyToClipboard(address)}
          >
            {formatAddress(address)}
          </span>
        );
      },
    },
    {
      accessorKey: "convertedAmount",
      header: "Amount (Fiat)",
      cell: (info: CellContext<Transaction, unknown>) => {
        const transaction = info.row.original;
        const amount = transaction.convertedAmount ?? transaction.amount;
        const currency = transaction.currency || "";
        if (!amount) return "-";
        return (
          <span>
            {currency && `${currency} `}
            {formatAmount(amount)}
          </span>
        );
      },
    },
    {
      accessorKey: "amountB3TR",
      header: "Amount (B3TR)",
      cell: (info: CellContext<Transaction, unknown>) => {
        const amountB3TR = info.row.original.amountB3TR;
        if (!amountB3TR) return <span style={{ color: "#999" }}>-</span>;
        try {
          // Convert from wei if it's a large number (18 decimals)
          // Handle both string and number inputs
          const weiAmount = BigInt(amountB3TR);
          // Use division with BigInt for precision, then convert to number
          const divisor = BigInt(1e18);
          const quotient = weiAmount / divisor;
          const remainder = weiAmount % divisor;
          const etherAmount = Number(quotient) + Number(remainder) / 1e18;
          return <span>{formatAmount(etherAmount)} B3TR</span>;
        } catch (error) {
          // Fallback: try parsing as number directly
          const num = parseFloat(amountB3TR);
          if (!isNaN(num)) {
            return <span>{formatAmount(num)} B3TR</span>;
          }
          return <span style={{ color: "#999" }}>-</span>;
        }
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (info: CellContext<Transaction, unknown>) => {
        const status = info.getValue() as string;
        const normalizedStatus = status.toLowerCase().replace(/_/g, "-");
        return (
          <span
            className={`status-badge ${normalizedStatus}`}
            style={{
              backgroundColor: getStatusColor(status) + "20",
              color: getStatusColor(status),
              padding: "0.25rem 0.75rem",
              borderRadius: "0.25rem",
              fontSize: "0.875rem",
              fontWeight: "500",
              display: "inline-block",
            }}
          >
            {status.replace(/_/g, " ")}
          </span>
        );
      },
    },
    {
      accessorKey: "bankName",
      header: "Bank Details",
      cell: (info: CellContext<Transaction, unknown>) => {
        const transaction = info.row.original;
        const bankName = transaction.bankName;
        const accountNumber = transaction.accountNumber;
        if (!bankName && !accountNumber) {
          return <span style={{ color: "#999" }}>-</span>;
        }
        return (
          <div style={{ fontSize: "0.875rem" }}>
            {bankName && <div style={{ fontWeight: "500" }}>{bankName}</div>}
            {accountNumber && (
              <div style={{ color: "#666", fontFamily: "monospace" }}>
                {accountNumber}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "transactionHash",
      header: "Tx Hash",
      cell: (info: CellContext<Transaction, unknown>) => {
        const hash = info.row.original.transactionHash;
        if (!hash) return <span style={{ color: "#999" }}>-</span>;
        const explorerUrl = `https://explore.vechain.org/transactions/${hash}`;
        return (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "monospace",
              fontSize: "0.875rem",
              color: "#2196f3",
              textDecoration: "none",
            }}
            title={hash}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {formatAddress(hash, 6)}
          </a>
        );
      },
    },
    {
      accessorKey: "transferReference",
      header: "Transfer Ref",
      cell: (info: CellContext<Transaction, unknown>) => {
        const ref = info.row.original.transferReference;
        if (!ref) return <span style={{ color: "#999" }}>-</span>;
        return (
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
            title={ref}
            onClick={() => copyToClipboard(ref)}
          >
            {ref.length > 12 ? `${ref.substring(0, 12)}...` : ref}
          </span>
        );
      },
    },
    {
      accessorKey: "errorMessage",
      header: "Error",
      cell: (info: CellContext<Transaction, unknown>) => {
        const error = info.row.original.errorMessage;
        if (!error) return <span style={{ color: "#999" }}>-</span>;
        return (
          <span
            style={{
              color: "#f44336",
              fontSize: "0.875rem",
              maxWidth: "200px",
              display: "inline-block",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={error}
          >
            {error}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: (info: CellContext<Transaction, unknown>) => {
        const date = info.getValue() as string;
        return (
          <span style={{ fontSize: "0.875rem" }}>{formatDate(date)}</span>
        );
      },
    },
    {
      accessorKey: "updatedAt",
      header: "Updated At",
      cell: (info: CellContext<Transaction, unknown>) => {
        const date = info.row.original.updatedAt;
        if (!date) return <span style={{ color: "#999" }}>-</span>;
        return (
          <span style={{ fontSize: "0.875rem" }}>{formatDate(date)}</span>
        );
      },
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
      cell: (info: CellContext<ExchangeRate, unknown>) =>
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
      const transaction = row.original;
      return (
        transaction.id.toLowerCase().includes(search) ||
        transaction.userId.toLowerCase().includes(search) ||
        transaction.currency?.toLowerCase().includes(search) ||
        transaction.status.toLowerCase().includes(search) ||
        transaction.walletAddress?.toLowerCase().includes(search) ||
        transaction.transactionHash?.toLowerCase().includes(search) ||
        transaction.transferReference?.toLowerCase().includes(search) ||
        transaction.bankName?.toLowerCase().includes(search) ||
        transaction.accountNumber?.toLowerCase().includes(search) ||
        transaction.errorMessage?.toLowerCase().includes(search)
      );
    }) as FilterFn<Transaction>,
    state: {
      globalFilter: searchQuery,
    },
  });

  const exchangeRatesTable = useReactTable({
    data: exchangeRatesData,
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
    window.location.reload();
  };

  const handleLogout = () => {
    setActiveTab("transactions");
    setSearchQuery("");
    setStatusFilter("");
    setStartDate("");
    setEndDate("");
    setShowExchangeRateModal(false);
    setEditingExchangeRate(null);
    setDeletingExchangeRate(null);
    localStorage.removeItem("admin_api_key_bank");
    localStorage.removeItem("admin_api_key_bank_url");
    window.location.reload();
  };

  const handleClearDateRange = () => {
    setStartDate("");
    setEndDate("");
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
    setExchangeRate(
      {
        data,
        isEditing: !!editingExchangeRate,
      },
      {
        onSuccess: () => {
          setShowExchangeRateModal(false);
          setEditingExchangeRate(null);
        },
      }
    );
  };

  const handleDeleteExchangeRate = () => {
    if (deletingExchangeRate) {
      deleteExchangeRate(deletingExchangeRate.currencyCode, {
        onSuccess: () => {
          setDeletingExchangeRate(null);
        },
      });
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!authenticated) {
    return (
      <ApiKeyPrompt
        serviceName="Bank"
        onAuthenticate={handleAuthenticate}
        defaultBaseUrl={getBaseUrl("bank")}
      />
    );
  }

  const error = transactionsError || ratesError;
  const stats = {
    total: transactions.length,
    completed: transactions.filter(
      (t: Transaction) =>
        t.status.toLowerCase() === "completed" ||
        t.status === "COMPLETED"
    ).length,
    pending: transactions.filter(
      (t: Transaction) =>
        t.status.toLowerCase() === "pending" ||
        t.status.toLowerCase() === "pending_payment" ||
        t.status === "PENDING_PAYMENT"
    ).length,
    failed: transactions.filter(
      (t: Transaction) =>
        t.status.toLowerCase() === "failed" || t.status === "FAILED"
    ).length,
  };

  return (
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
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
              <h2>Transactions</h2>
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
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </FilterBar>
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search transactions..."
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
                            <th
                              key={header.id}
                              style={{
                                cursor: header.column.getCanSort()
                                  ? "pointer"
                                  : "default",
                                userSelect: "none",
                                position: "relative",
                              }}
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                }}
                              >
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                                {header.column.getCanSort() && (
                                  <span style={{ fontSize: "0.75rem" }}>
                                    {{
                                      asc: " ↑",
                                      desc: " ↓",
                                    }[header.column.getIsSorted() as string] ??
                                    " ⇅"}
                                  </span>
                                )}
                              </div>
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
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
              <h2>Exchange Rates</h2>
              <div className="flex gap-4 items-center">
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
          ) : exchangeRatesData.length === 0 ? (
            <p>
              No exchange rates found. Click "Add Exchange Rate" to create one.
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
                totalItems={exchangeRatesData.length}
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
        isLoading={isSettingExchangeRate}
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
        isLoading={isDeletingExchangeRate}
      />
    </div>
  );
}
