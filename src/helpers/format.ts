import type { StreakSubmissionStatus } from "../types";

export const formatAddress = (address: string): string => {
  if (!address || typeof address !== "string") return "";
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatDate = (timestamp: string | null): string => {
  if (!timestamp) return "N/A";
  try {
    const date = new Date(Number(timestamp) * 1000);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleString();
  } catch {
    return "N/A";
  }
};

export const getStatusLabel = (status: StreakSubmissionStatus): string => {
  switch (status) {
    case 0:
      return "Pending";
    case 1:
      return "Approved";
    case 2:
      return "Rejected";
    default:
      return "Unknown";
  }
};

export const getStatusColor = (status: StreakSubmissionStatus): string => {
  switch (status) {
    case 0:
      return "status-badge pending";
    case 1:
      return "status-badge verified";
    case 2:
      return "status-badge rejected";
    default:
      return "status-badge";
  }
};

export const getCleanupStatusLabel = (status: number): string => {
  switch (status) {
    case 0:
      return "Unpublished";
    case 1:
      return "Open";
    case 2:
      return "In Progress";
    case 3:
      return "Completed";
    case 4:
      return "Rewarded";
    default:
      return "Unknown";
  }
};

export const getKycStatusLabel = (status: number): string => {
  switch (status) {
    case 0:
      return "Not Started";
    case 1:
      return "Pending";
    case 2:
      return "Verified";
    case 3:
      return "Rejected";
    default:
      return "Unknown";
  }
};
