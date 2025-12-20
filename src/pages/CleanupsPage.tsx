import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCleanups } from "../hooks/useCleanups";
import { InfiniteScrollTable } from "../components/InfiniteScrollTable";
import { Select, SelectItem } from "../components/ui/Select";
import { Input } from "../components/ui/Input";
import DateRangeFilter from "../components/DateRangeFilter";
import { formatAddress, formatDate, getCleanupStatusLabel } from "../helpers/format";
import type { Cleanup } from "../types";

export default function CleanupsPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [organizerFilter, setOrganizerFilter] = useState("");
  const [publishedFilter, setPublishedFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const filters: {
    status?: number;
    published?: boolean;
    organizer?: string;
    startDate?: string;
    endDate?: string;
  } = {};
  if (statusFilter !== "all") {
    filters.status = Number(statusFilter);
  }
  if (publishedFilter !== "all") {
    filters.published = publishedFilter === "true";
  }
  if (organizerFilter) {
    filters.organizer = organizerFilter;
  }
  if (startDate) {
    filters.startDate = startDate;
  }
  if (endDate) {
    filters.endDate = endDate;
  }

  const query = useCleanups(filters);

  // Client-side date filtering for subgraph results
  const filteredQuery = useMemo(() => {
    if (!startDate && !endDate) return query;

    return {
      ...query,
      data: query.data
        ? {
            ...query.data,
            pages: query.data.pages.map((page) =>
              page.filter((cleanup: Cleanup) => {
                const cleanupDate = Number(cleanup.createdAt);
                const start = startDate
                  ? Math.floor(new Date(startDate).getTime() / 1000)
                  : 0;
                const end = endDate
                  ? Math.floor(new Date(endDate + "T23:59:59").getTime() / 1000)
                  : Infinity;
                return cleanupDate >= start && cleanupDate <= end;
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

  const handleRowClick = (row: Cleanup) => {
    navigate(`/cleanups/${row.id}`);
  };

  const columns = [
    {
      header: "ID",
      accessor: (row: Cleanup) => row.id,
    },
    {
      header: "Organizer",
      accessor: (row: Cleanup) => formatAddress(row.organizer),
    },
    {
      header: "Metadata",
      accessor: (row: Cleanup) => (
        <span className="truncate max-w-xs">{row.metadata}</span>
      ),
    },
    {
      header: "Status",
      accessor: (row: Cleanup) => getCleanupStatusLabel(row.status),
    },
    {
      header: "Published",
      accessor: (row: Cleanup) => (
        <span
          className={
            row.published ? "text-status-approved" : "text-muted-foreground"
          }
        >
          {row.published ? "Yes" : "No"}
        </span>
      ),
    },
    {
      header: "Date",
      accessor: (row: Cleanup) => formatDate(row.date),
    },
    {
      header: "Participants",
      accessor: (row: Cleanup) => row.participants.length,
    },
  ];

  return (
      <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-4">Cleanups</h1>
        <div className="flex gap-4 items-center">
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
            className="w-48"
          >
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="0">Unpublished</SelectItem>
            <SelectItem value="1">Open</SelectItem>
            <SelectItem value="2">In Progress</SelectItem>
            <SelectItem value="3">Completed</SelectItem>
            <SelectItem value="4">Rewarded</SelectItem>
          </Select>
          <Select
            value={publishedFilter}
            onValueChange={setPublishedFilter}
            className="w-48"
          >
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="true">Published</SelectItem>
            <SelectItem value="false">Unpublished</SelectItem>
          </Select>
          <Input
            type="text"
            placeholder="Filter by organizer address..."
            value={organizerFilter}
            onChange={(e) => setOrganizerFilter(e.target.value)}
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

      <div className="bg-card rounded-lg p-4 border border-border">
        <InfiniteScrollTable
          query={filteredQuery}
          columns={columns}
          onRowClick={handleRowClick}
        />
      </div>
    </div>
  );
}

