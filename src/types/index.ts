// Subgraph Types
export type StreakSubmissionStatus = 0 | 1 | 2; // 0=PENDING, 1=APPROVED, 2=REJECTED

export interface StreakSubmissionMedia {
  id: string;
  ipfsHash: string;
  mimeType: string;
  index: string;
}

export interface StreakSubmission {
  id: string;
  user: string;
  submissionId: string;
  metadata: string;
  status: StreakSubmissionStatus;
  submittedAt: string;
  reviewedAt: string | null;
  amount: string | null;
  rewardAmount: string | null;
  rejectionReason: string | null;
  ipfsHashes: string[];
  mimetypes: string[];
  blockNumber: string;
  transactionHash: string;
  media: StreakSubmissionMedia[];
}

export interface Cleanup {
  id: string;
  organizer: string;
  metadata: string;
  category: string | null;
  date: string;
  startTime: string | null;
  endTime: string | null;
  maxParticipants: string | null;
  status: number;
  published: boolean;
  publishedAt: string | null;
  unpublishedAt: string | null;
  createdAt: string;
  updatedAt: string | null;
  proofOfWorkSubmitted: boolean;
  proofOfWorkMediaCount: string | null;
  proofOfWorkSubmittedAt: string | null;
  location: string | null;
  city: string | null;
  country: string | null;
  latitude: string | null;
  longitude: string | null;
  rewardAmount: string | null;
  rewardsDistributed: boolean;
  rewardsTotalAmount: string | null;
  rewardsParticipantCount: string | null;
  rewardsDistributedAt: string | null;
  participants: CleanupParticipant[];
  medias: CleanupMedia[];
  proofOfWorkMedia: ProofOfWorkMedia[];
}

export interface CleanupParticipant {
  id: string;
  cleanup: Cleanup;
  participant: string;
  appliedAt: string;
  status: "applied" | "accepted" | "rejected";
  acceptedAt: string | null;
  rejectedAt: string | null;
  rewardEarned: string;
  rewardEarnedAt: string | null;
}

export interface CleanupMedia {
  id: string;
  cleanup: Cleanup;
  url: string;
  mimeType: string;
  createdAt: string;
}

export interface ProofOfWorkMedia {
  id: string;
  cleanup: Cleanup;
  url: string;
  mimeType: string;
  uploadedAt: string;
  submittedAt: string;
}

export interface User {
  id: string;
  metadata: string | null;
  email: string | null;
  emailVerified: boolean;
  kycStatus: number;
  referralCode: string | null;
  referrer: string | null;
  isOrganizer: boolean;
  registeredAt: string;
  emailVerifiedAt: string | null;
  lastProfileUpdateAt: string | null;
  totalRewardsEarned: string;
  totalRewardsClaimed: string;
  pendingRewards: string;
}

export interface UserStreakStats {
  id: string;
  user: string;
  streakerCode: string | null;
  totalSubmissions: string;
  approvedSubmissions: string;
  rejectedSubmissions: string;
  pendingSubmissions: string;
  totalAmount: string;
  lastSubmissionAt: string | null;
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
