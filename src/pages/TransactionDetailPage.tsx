import { useParams, useNavigate } from "react-router-dom";
import { useBankTransactions } from "../hooks/useBank";
import type { Transaction } from "../types/services";

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: transactionsData, isLoading } = useBankTransactions(
    undefined,
    "transactions"
  );

  const transaction = transactionsData?.data?.find(
    (t: Transaction) => t.id === id
  );

  const formatAddress = (address: string | undefined, length = 8) => {
    if (!address) return "N/A";
    if (address.length <= length * 2) return address;
    return `${address.substring(0, length)}...${address.substring(
      address.length - length
    )}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatAmount = (amount: string | number | undefined) => {
    if (!amount) return "N/A";
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(num)) return amount.toString();
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(num);
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    const normalized = status.toLowerCase();
    if (normalized === "completed") return "#4caf50";
    if (normalized === "pending" || normalized === "pending_payment")
      return "#ff9800";
    if (normalized === "failed") return "#f44336";
    return "#757575";
  };

  const formatB3TR = (amountB3TR: string | undefined) => {
    if (!amountB3TR) return "N/A";
    try {
      const weiAmount = BigInt(amountB3TR);
      const divisor = BigInt(1e18);
      const quotient = weiAmount / divisor;
      const remainder = weiAmount % divisor;
      const etherAmount = Number(quotient) + Number(remainder) / 1e18;
      return formatAmount(etherAmount) + " B3TR";
    } catch (error) {
      const num = parseFloat(amountB3TR);
      if (!isNaN(num)) {
        return formatAmount(num) + " B3TR";
      }
      return "N/A";
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="p-6">
        <div className="text-center py-8 text-muted-foreground">
          Transaction not found
        </div>
        <div className="text-center mt-4">
          <button
            className="btn-secondary"
            onClick={() => navigate("/bank")}
          >
            ← Back to Transactions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-4">
        <button className="btn-secondary" onClick={() => navigate("/bank")}>
          ← Back to Transactions
        </button>
      </div>

      <div className="bg-card rounded-lg p-6 space-y-6 border border-border">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Transaction Details
            </h1>
            <span
              className="status-badge"
              style={{
                backgroundColor: getStatusColor(transaction.status) + "20",
                color: getStatusColor(transaction.status),
                padding: "0.5rem 1rem",
                borderRadius: "0.25rem",
                fontSize: "0.875rem",
                fontWeight: "500",
                display: "inline-block",
              }}
            >
              {transaction.status.replace(/_/g, " ")}
            </span>
          </div>
        </div>

        <div className="space-y-6">
          {/* Transaction Information */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Transaction Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">
                  Transaction ID
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-foreground font-mono text-sm break-all">
                    {transaction.id}
                  </p>
                  <button
                    onClick={() => copyToClipboard(transaction.id)}
                    className="text-primary hover:underline text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Status</label>
                <p className="text-foreground mt-1">
                  {transaction.status.replace(/_/g, " ")}
                </p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">
                  Created At
                </label>
                <p className="text-foreground mt-1">
                  {formatDate(transaction.createdAt)}
                </p>
              </div>
              {transaction.updatedAt && (
                <div>
                  <label className="text-sm text-muted-foreground">
                    Updated At
                  </label>
                  <p className="text-foreground mt-1">
                    {formatDate(transaction.updatedAt)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* User Information */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              User Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">User ID</label>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-foreground font-mono text-sm break-all">
                    {transaction.userId}
                  </p>
                  <button
                    onClick={() => copyToClipboard(transaction.userId)}
                    className="text-primary hover:underline text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>
              {transaction.walletAddress && (
                <div>
                  <label className="text-sm text-muted-foreground">
                    Wallet Address
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-foreground font-mono text-sm break-all">
                      {transaction.walletAddress}
                    </p>
                    <button
                      onClick={() =>
                        copyToClipboard(transaction.walletAddress || "")
                      }
                      className="text-primary hover:underline text-sm"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Amount Information */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Amount Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {transaction.convertedAmount !== undefined && (
                <div>
                  <label className="text-sm text-muted-foreground">
                    Amount (Fiat)
                  </label>
                  <p className="text-foreground mt-1 text-lg font-semibold">
                    {transaction.currency} {formatAmount(transaction.convertedAmount)}
                  </p>
                </div>
              )}
              {transaction.amountB3TR && (
                <div>
                  <label className="text-sm text-muted-foreground">
                    Amount (B3TR)
                  </label>
                  <p className="text-foreground mt-1 text-lg font-semibold">
                    {formatB3TR(transaction.amountB3TR)}
                  </p>
                </div>
              )}
              {transaction.currency && (
                <div>
                  <label className="text-sm text-muted-foreground">Currency</label>
                  <p className="text-foreground mt-1">{transaction.currency}</p>
                </div>
              )}
            </div>
          </div>

          {/* Bank Information */}
          {(transaction.bankName ||
            transaction.accountNumber ||
            transaction.bankAccountId) && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Bank Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {transaction.bankName && (
                  <div>
                    <label className="text-sm text-muted-foreground">
                      Bank Name
                    </label>
                    <p className="text-foreground mt-1">{transaction.bankName}</p>
                  </div>
                )}
                {transaction.accountNumber && (
                  <div>
                    <label className="text-sm text-muted-foreground">
                      Account Number
                    </label>
                    <p className="text-foreground mt-1 font-mono">
                      {transaction.accountNumber}
                    </p>
                  </div>
                )}
                {transaction.bankAccountId && (
                  <div>
                    <label className="text-sm text-muted-foreground">
                      Bank Account ID
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-foreground font-mono text-sm break-all">
                        {transaction.bankAccountId}
                      </p>
                      <button
                        onClick={() =>
                          copyToClipboard(transaction.bankAccountId || "")
                        }
                        className="text-primary hover:underline text-sm"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Blockchain Information */}
          {transaction.transactionHash && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Blockchain Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">
                    Transaction Hash
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <a
                      href={`https://explore.vechain.org/transactions/${transaction.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-mono text-sm break-all"
                    >
                      {transaction.transactionHash}
                    </a>
                    <button
                      onClick={() =>
                        copyToClipboard(transaction.transactionHash || "")
                      }
                      className="text-primary hover:underline text-sm"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Transfer Information */}
          {transaction.transferReference && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Transfer Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">
                    Transfer Reference
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-foreground font-mono text-sm break-all">
                      {transaction.transferReference}
                    </p>
                    <button
                      onClick={() =>
                        copyToClipboard(transaction.transferReference || "")
                      }
                      className="text-primary hover:underline text-sm"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Information */}
          {transaction.errorMessage && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Error Information
              </h2>
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded">
                <p className="text-destructive break-words">
                  {transaction.errorMessage}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

