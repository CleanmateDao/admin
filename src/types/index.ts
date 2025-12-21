// Re-export SDK types
export type {
  User,
  Cleanup as SDKCleanup,
  CleanupParticipant as SDKCleanupParticipant,
  CleanupUpdate as SDKCleanupUpdate,
  StreakSubmission as SDKStreakSubmission,
  UserStreakStats,
} from "@cleanmate/cip-sdk";

// Admin-specific type extensions and adapters
export type StreakSubmissionStatus = 0 | 1 | 2; // 0=PENDING, 1=APPROVED, 2=REJECTED

export interface StreakSubmissionMedia {
  id: string;
  ipfsHash: string;
  mimeType: string;
  index: string;
}

// Extended types for admin app compatibility
export interface CleanupMedia {
  id: string;
  cleanup: Cleanup;
  url: string;
  mimeType: string;
  createdAt: string;
}

export interface ProofOfWorkMedia {
  id: string;
  url: string;
  mimeType: string;
  uploadedAt: string;
  submittedAt: string;
}

// Extended Cleanup type with admin-specific fields
import type { Cleanup as SDKCleanupType } from "@cleanmate/cip-sdk";
export interface Cleanup extends Omit<SDKCleanupType, "participants"> {
  // Convert number fields to strings for compatibility
  date: string;
  startTime: string | null;
  endTime: string | null;
  maxParticipants: string | null;
  createdAt: string;
  updatedAt: string | null;
  publishedAt: string | null;
  unpublishedAt: string | null;
  proofOfWorkSubmittedAt: string | null;
  rewardsDistributedAt: string | null;
  proofOfWorkMediaCount: string | null;
  participants: CleanupParticipant[];
  medias: CleanupMedia[];
  proofOfWorkMedia: ProofOfWorkMedia[];
}

// Extended CleanupParticipant type
import type { CleanupParticipant as SDKCleanupParticipantType } from "@cleanmate/cip-sdk";
export interface CleanupParticipant
  extends Omit<
    SDKCleanupParticipantType,
    "cleanup" | "appliedAt" | "acceptedAt" | "rejectedAt" | "rewardEarnedAt"
  > {
  cleanup: Cleanup;
  appliedAt: string;
  acceptedAt: string | null;
  rejectedAt: string | null;
  rewardEarnedAt: string | null;
}

// Extended CleanupUpdate type
import type { CleanupUpdate as SDKCleanupUpdateType } from "@cleanmate/cip-sdk";
export interface CleanupUpdate
  extends Omit<SDKCleanupUpdateType, "addedAt" | "blockNumber"> {
  addedAt: string;
  blockNumber: string;
}

// Extended StreakSubmission type
import type { StreakSubmission as SDKStreakSubmissionType } from "@cleanmate/cip-sdk";
export interface StreakSubmission
  extends Omit<
    SDKStreakSubmissionType,
    "submittedAt" | "reviewedAt" | "blockNumber"
  > {
  submittedAt: string;
  reviewedAt: string | null;
  blockNumber: string;
  media: StreakSubmissionMedia[];
}

// Extended User type
import type { User as SDKUserType } from "@cleanmate/cip-sdk";
export interface User
  extends Omit<
    SDKUserType,
    "registeredAt" | "emailVerifiedAt" | "lastProfileUpdateAt"
  > {
  registeredAt: string;
  emailVerifiedAt: string | null;
  lastProfileUpdateAt: string | null;
}

// Filter Types
export interface StreakSubmissionFilters {
  status?: StreakSubmissionStatus;
  user?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface CleanupFilters {
  status?: number;
  organizer?: string;
  published?: boolean;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface UserFilters {
  isOrganizer?: boolean;
  emailVerified?: boolean;
  kycStatus?: number;
  referrer?: string;
  search?: string;
}

// Pagination
export interface PaginationParams {
  first: number;
  skip: number;
  orderBy?: string;
  orderDirection?: "asc" | "desc";
}
