import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useStreakSubmissions } from "../hooks/useStreakSubmissions";
import { InfiniteScrollTable } from "../components/InfiniteScrollTable";
import { Button } from "../components/ui/Button";
import { Select, SelectItem } from "../components/ui/Select";
import { Input } from "../components/ui/Input";
import { Dialog } from "../components/ui/Dialog";
import DateRangeFilter from "../components/DateRangeFilter";
import {
  useApproveStreaks,
  useRejectStreaks,
} from "../hooks/useStreakMutations";
import {
  formatAddress,
  formatDate,
  getStatusLabel,
  getStatusColor,
} from "../helpers/format";
import type { StreakSubmission, StreakSubmissionStatus } from "../types";
import { parseEther, formatEther } from "viem";
import { StreakCard } from "../components/StreakCard";

export default function StreaksPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedSubmission, setSelectedSubmission] =
    useState<StreakSubmission | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"approve" | "reject">("approve");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const filters: {
    status?: StreakSubmissionStatus;
    startDate?: string;
    endDate?: string;
  } = {};
  if (statusFilter !== "all") {
    filters.status = Number(statusFilter) as StreakSubmissionStatus;
  }
  if (startDate) {
    filters.startDate = startDate;
  }
  if (endDate) {
    filters.endDate = endDate;
  }

  const query = useStreakSubmissions(filters);

  // Client-side date filtering for subgraph results
  const filteredQuery = useMemo(() => {
    if (!startDate && !endDate) return query;

    return {
      ...query,
      data: query.data
        ? {
            ...query.data,
            pages: query.data.pages.map((page) =>
              page.filter((submission: StreakSubmission) => {
                const submissionDate = Number(submission.submittedAt);
                const start = startDate
                  ? Math.floor(new Date(startDate).getTime() / 1000)
                  : 0;
                const end = endDate
                  ? Math.floor(new Date(endDate + "T23:59:59").getTime() / 1000)
                  : Infinity;
                return submissionDate >= start && submissionDate <= end;
              })
            ),
          }
        : undefined,
    };
  }, [query, startDate, endDate]);

  const handleClearDateRange = () => {
    setStartDate("");
    setEndDate("");
  };
  const { approve, isPending: isApproving } = useApproveStreaks();
  const { reject, isPending: isRejecting } = useRejectStreaks();

  const handleRowClick = (row: StreakSubmission) => {
    navigate(`/streaks/${row.id}`);
  };

  const handleApproveClick = (submission: StreakSubmission) => {
    setSelectedSubmission(submission);
    setDialogType("approve");
    setDialogOpen(true);
  };

  const handleRejectClick = (submission: StreakSubmission) => {
    setSelectedSubmission(submission);
    setDialogType("reject");
    setDialogOpen(true);
  };

  const handleApprove = () => {
    if (!selectedSubmission || !amount) return;

    const submissionId = BigInt(selectedSubmission.submissionId);
    const amountWei = parseEther(amount);

    approve({
      submissionIds: [submissionId],
      amounts: [amountWei],
    });

    setDialogOpen(false);
    setAmount("");
    setSelectedSubmission(null);
  };

  const handleReject = () => {
    if (!selectedSubmission || !reason) return;

    const submissionId = BigInt(selectedSubmission.submissionId);

    reject({
      submissionIds: [submissionId],
      reasons: [reason],
    });

    setDialogOpen(false);
    setReason("");
    setSelectedSubmission(null);
  };

  const columns = [
    {
      header: "ID",
      accessor: (row: StreakSubmission) => row.submissionId,
    },
    {
      header: "User",
      accessor: (row: StreakSubmission) => formatAddress(row.user),
    },
    {
      header: "Status",
      accessor: (row: StreakSubmission) => (
        <span className={getStatusColor(row.status)}>
          {getStatusLabel(row.status)}
        </span>
      ),
    },
    {
      header: "Submitted",
      accessor: (row: StreakSubmission) => formatDate(row.submittedAt),
    },
    {
      header: "Amount",
      accessor: (row: StreakSubmission) =>
        row.rewardAmount
          ? `${formatEther(BigInt(row.rewardAmount))} B3TR`
          : "-",
    },
    {
      header: "Actions",
      accessor: (row: StreakSubmission) => (
        <div className="flex gap-2">
          {row.status === 0 && (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleApproveClick(row);
                }}
              >
                Approve
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRejectClick(row);
                }}
              >
                Reject
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Streak Submissions
        </h1>
        <div className="flex gap-4 items-center">
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
            className="w-48"
          >
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="0">Pending</SelectItem>
            <SelectItem value="1">Approved</SelectItem>
            <SelectItem value="2">Rejected</SelectItem>
          </Select>
          <Input
            type="text"
            placeholder="Filter by user address..."
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="w-64"
          />
        </div>
        <div className="mt-4">
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onClear={handleClearDateRange}
          />
        </div>
      </div>

      {/* Show cards for approved streaks, table for others */}
      {statusFilter === "1" && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Approved Streaks
          </h2>
          {filteredQuery.data ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredQuery.data.pages
                .flat()
                .filter((submission: StreakSubmission) => submission.status === 1)
                .map((streak: StreakSubmission) => (
                  <StreakCard key={streak.id} streak={streak} />
                ))}
              {filteredQuery.data.pages
                .flat()
                .filter((submission: StreakSubmission) => submission.status === 1)
                .length === 0 && (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  No approved streaks found
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Loading...
            </div>
          )}
        </div>
      )}

      {statusFilter !== "1" && (
        <div className="bg-card rounded-lg p-4 border border-border">
          <InfiniteScrollTable
            query={filteredQuery}
            columns={columns}
            onRowClick={handleRowClick}
          />
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={
          dialogType === "approve" ? "Approve Submission" : "Reject Submission"
        }
        size="md"
      >
        {dialogType === "approve" ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Amount (B3TR)
              </label>
              <Input
                type="number"
                step="0.0001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleApprove}
                disabled={!amount || isApproving}
              >
                {isApproving ? "Approving..." : "Approve"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Rejection Reason
              </label>
              <textarea
                className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 resize-y"
                style={{
                  backgroundColor: "hsl(var(--background))",
                  color: "hsl(var(--foreground))",
                  borderColor: "hsl(var(--input))",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "hsl(var(--ring))";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "hsl(var(--input))";
                }}
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter rejection reason..."
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleReject}
                disabled={!reason || isRejecting}
              >
                {isRejecting ? "Rejecting..." : "Reject"}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
