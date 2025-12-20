import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUsers } from "../hooks/useUsers";
import { InfiniteScrollTable } from "../components/InfiniteScrollTable";
import { Select, SelectItem } from "../components/ui/Select";
import { Input } from "../components/ui/Input";
import {
  formatAddress,
  formatDate,
  getKycStatusLabel,
  getUserName,
} from "../helpers/format";
import type { User } from "../types";

export default function UsersPage() {
  const navigate = useNavigate();
  const [isOrganizerFilter, setIsOrganizerFilter] = useState<string>("all");
  const [emailVerifiedFilter, setEmailVerifiedFilter] = useState<string>("all");
  const [kycStatusFilter, setKycStatusFilter] = useState<string>("all");
  const [referrerFilter, setReferrerFilter] = useState("");

  const filters: {
    isOrganizer?: boolean;
    emailVerified?: boolean;
    kycStatus?: number;
    referrer?: string;
  } = {};

  if (isOrganizerFilter !== "all") {
    filters.isOrganizer = isOrganizerFilter === "true";
  }
  if (emailVerifiedFilter !== "all") {
    filters.emailVerified = emailVerifiedFilter === "true";
  }
  if (kycStatusFilter !== "all") {
    filters.kycStatus = Number(kycStatusFilter);
  }
  if (referrerFilter) {
    filters.referrer = referrerFilter;
  }

  const query = useUsers(filters);

  const handleRowClick = (row: User) => {
    navigate(`/users/${row.id}`);
  };

  const columns = [
    {
      header: "Address",
      accessor: (row: User) => formatAddress(row.id),
    },
    {
      header: "Name",
      accessor: (row: User) => (
        <span className="truncate max-w-xs" title={getUserName(row.metadata)}>
          {getUserName(row.metadata)}
        </span>
      ),
    },
    {
      header: "Email",
      accessor: (row: User) => row.email || "-",
    },
    {
      header: "Email Verified",
      accessor: (row: User) => (
        <span
          className={
            row.emailVerified ? "text-status-approved" : "text-muted-foreground"
          }
        >
          {row.emailVerified ? "Yes" : "No"}
        </span>
      ),
    },
    {
      header: "KYC Status",
      accessor: (row: User) => getKycStatusLabel(row.kycStatus),
    },
    {
      header: "Organizer",
      accessor: (row: User) => (
        <span
          className={row.isOrganizer ? "text-primary" : "text-muted-foreground"}
        >
          {row.isOrganizer ? "Yes" : "No"}
        </span>
      ),
    },
    {
      header: "Registered",
      accessor: (row: User) => formatDate(row.registeredAt),
    },
    {
      header: "Total Rewards",
      accessor: (row: User) => `${row.totalRewardsEarned} B3TR`,
    },
    {
      header: "Pending Rewards",
      accessor: (row: User) => `${row.pendingRewards} B3TR`,
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-4">Users</h1>
        <div className="flex gap-4 items-center flex-wrap">
          <Select
            value={isOrganizerFilter}
            onValueChange={setIsOrganizerFilter}
            className="w-48"
          >
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="true">Organizers</SelectItem>
            <SelectItem value="false">Non-Organizers</SelectItem>
          </Select>
          <Select
            value={emailVerifiedFilter}
            onValueChange={setEmailVerifiedFilter}
            className="w-48"
          >
            <SelectItem value="all">All Email Status</SelectItem>
            <SelectItem value="true">Verified</SelectItem>
            <SelectItem value="false">Not Verified</SelectItem>
          </Select>
          <Select
            value={kycStatusFilter}
            onValueChange={setKycStatusFilter}
            className="w-48"
          >
            <SelectItem value="all">All KYC Status</SelectItem>
            <SelectItem value="0">Not Started</SelectItem>
            <SelectItem value="1">Pending</SelectItem>
            <SelectItem value="2">Verified</SelectItem>
            <SelectItem value="3">Rejected</SelectItem>
          </Select>
          <Input
            type="text"
            placeholder="Filter by referrer address..."
            value={referrerFilter}
            onChange={(e) => setReferrerFilter(e.target.value)}
            className="w-64"
          />
        </div>
      </div>

      <div className="bg-card rounded-lg p-4 border border-border">
        <InfiniteScrollTable
          query={query}
          columns={columns}
          onRowClick={handleRowClick}
        />
      </div>
    </div>
  );
}
