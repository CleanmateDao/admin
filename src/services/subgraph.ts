import { GraphQLClient } from "graphql-request";
import {
  GET_USER_QUERY,
  GET_USERS_QUERY,
  GET_CLEANUP_QUERY,
  GET_CLEANUPS_QUERY,
  GET_CLEANUP_UPDATES_QUERY,
  GET_STREAK_SUBMISSION_QUERY,
  GET_STREAK_SUBMISSIONS_QUERY,
  type GetUserParams,
  type GetUsersParams,
  type GetCleanupParams,
  type GetCleanupsParams,
  type GetCleanupUpdatesParams,
  type GetStreakSubmissionParams,
  type GetStreakSubmissionsParams,
  type User as SDKUser,
  type Cleanup as SDKCleanup,
  type CleanupUpdate as SDKCleanupUpdate,
  type StreakSubmission as SDKStreakSubmission,
  type CleanupParticipant as SDKCleanupParticipant,
  type User_filter,
  type Cleanup_filter,
  type CleanupUpdate_filter,
  type StreakSubmission_filter,
  type User_orderBy,
  type Cleanup_orderBy,
  type CleanupUpdate_orderBy,
  type StreakSubmission_orderBy,
  type OrderDirection,
} from "@cleanmate/cip-sdk";
import { SUBGRAPH_URL } from "../config/constants";
import type {
  StreakSubmissionFilters,
  CleanupFilters,
  UserFilters,
  PaginationParams,
  User,
  Cleanup,
  StreakSubmission,
  CleanupParticipant,
} from "../types";

const client = new GraphQLClient(SUBGRAPH_URL);

// Helper function to normalize addresses
function normalizeAddress(address: string): string {
  let normalized = address.toLowerCase();
  if (!normalized.startsWith("0x")) {
    normalized = "0x" + normalized;
  }
  return normalized;
}

// Helper to convert number/string to string (GraphQL BigInt comes as string)
function toString(value: number | string | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  return String(value);
}

// Transform SDK User to Admin User
function transformUser(user: SDKUser): User {
  return {
    ...user,
    registeredAt: toString(user.registeredAt) ?? "",
    emailVerifiedAt: toString(user.emailVerifiedAt),
    lastProfileUpdateAt: toString(user.lastProfileUpdateAt),
  };
}

// Transform SDK CleanupParticipant to Admin CleanupParticipant
function transformCleanupParticipant(
  participant: SDKCleanupParticipant,
  cleanup: Cleanup
): CleanupParticipant {
  return {
    ...participant,
    cleanup,
    appliedAt: toString(participant.appliedAt) ?? "",
    acceptedAt: toString(participant.acceptedAt),
    rejectedAt: toString(participant.rejectedAt),
    rewardEarnedAt: toString(participant.rewardEarnedAt),
  };
}

// Transform SDK Cleanup to Admin Cleanup
function transformCleanup(cleanup: SDKCleanup): Cleanup {
  const transformed: Cleanup = {
    ...cleanup,
    date: toString(cleanup.date) ?? "",
    startTime: toString(cleanup.startTime),
    endTime: toString(cleanup.endTime),
    maxParticipants: toString(cleanup.maxParticipants),
    createdAt: toString(cleanup.createdAt) ?? "",
    updatedAt: toString(cleanup.updatedAt),
    publishedAt: toString(cleanup.publishedAt),
    unpublishedAt: toString(cleanup.unpublishedAt),
    proofOfWorkSubmittedAt: toString(cleanup.proofOfWorkSubmittedAt),
    rewardsDistributedAt: toString(cleanup.rewardsDistributedAt),
    proofOfWorkMediaCount: cleanup.proofOfWork
      ? String(cleanup.proofOfWork.ipfsHashes.length)
      : null,
    participants: (cleanup.participants || []).map((p) =>
      transformCleanupParticipant(p, {} as Cleanup)
    ),
    medias: [], // Not in SDK query, will be empty
    proofOfWorkMedia: cleanup.proofOfWork
      ? cleanup.proofOfWork.ipfsHashes.map((hash, index) => ({
          id: `${cleanup.id}-pow-${index}`,
          cleanup: {} as Cleanup,
          url: `https://ipfs.io/ipfs/${hash}`,
          mimeType: cleanup.proofOfWork!.mimetypes[index] || "image/jpeg",
          uploadedAt: toString(cleanup.proofOfWorkSubmittedAt) ?? "",
          submittedAt: toString(cleanup.proofOfWork!.submittedAt) ?? "",
        }))
      : [],
  };
  // Fix circular reference in participants
  transformed.participants = (cleanup.participants || []).map((p) =>
    transformCleanupParticipant(p, transformed)
  );
  return transformed;
}

// Transform SDK StreakSubmission to Admin StreakSubmission
function transformStreakSubmission(
  submission: SDKStreakSubmission
): StreakSubmission {
  return {
    ...submission,
    submittedAt: toString(submission.submittedAt) ?? "",
    reviewedAt: toString(submission.reviewedAt),
    blockNumber: toString(submission.blockNumber) ?? "",
    media: submission.ipfsHashes.map((hash, index) => ({
      id: `${submission.id}-media-${index}`,
      ipfsHash: hash,
      mimeType: submission.mimetypes[index] || "image/jpeg",
      index: String(index),
    })),
  };
}

// Streak Submissions Queries
export const getStreakSubmissions = async (
  filters: StreakSubmissionFilters = {},
  pagination: PaginationParams = { first: 20, skip: 0 }
): Promise<StreakSubmission[]> => {
  const variables: GetStreakSubmissionsParams = {
    first: pagination.first,
    skip: pagination.skip,
    orderBy: (pagination.orderBy as StreakSubmission_orderBy) || "submittedAt",
    orderDirection: (pagination.orderDirection as OrderDirection) || "desc",
  };

  const where: StreakSubmission_filter = {};
  if (filters.status !== undefined) {
    where.status = filters.status;
  }
  if (filters.user) {
    where.user = normalizeAddress(filters.user);
  }
  if (Object.keys(where).length > 0) {
    variables.where = where;
  }

  const response = await client.request<{
    streakSubmissions: SDKStreakSubmission[];
  }>(GET_STREAK_SUBMISSIONS_QUERY, variables);
  return response.streakSubmissions.map(transformStreakSubmission);
};

export const getStreakSubmission = async (
  id: string
): Promise<StreakSubmission | null> => {
  const response = await client.request<{
    streakSubmission: SDKStreakSubmission | null;
  }>(GET_STREAK_SUBMISSION_QUERY, {
    id,
  } as GetStreakSubmissionParams);
  return response.streakSubmission
    ? transformStreakSubmission(response.streakSubmission)
    : null;
};

// Cleanups Queries
export const getCleanups = async (
  filters: CleanupFilters = {},
  pagination: PaginationParams = { first: 20, skip: 0 }
): Promise<Cleanup[]> => {
  const variables: GetCleanupsParams = {
    first: pagination.first,
    skip: pagination.skip,
    orderBy: (pagination.orderBy as Cleanup_orderBy) || "createdAt",
    orderDirection: (pagination.orderDirection as OrderDirection) || "desc",
  };

  const where: Cleanup_filter = {};
  if (filters.status !== undefined) {
    where.status = filters.status;
  }
  if (filters.organizer) {
    where.organizer = normalizeAddress(filters.organizer);
  }
  if (filters.published !== undefined) {
    where.published = filters.published;
  }
  if (Object.keys(where).length > 0) {
    variables.where = where;
  }

  const response = await client.request<{ cleanups: SDKCleanup[] }>(
    GET_CLEANUPS_QUERY,
    variables
  );
  return response.cleanups.map(transformCleanup);
};

export const getCleanup = async (id: string): Promise<Cleanup | null> => {
  const response = await client.request<{ cleanup: SDKCleanup | null }>(
    GET_CLEANUP_QUERY,
    {
      id,
    } as GetCleanupParams
  );
  return response.cleanup ? transformCleanup(response.cleanup) : null;
};

// Transform SDK CleanupUpdate to Admin CleanupUpdate
function transformCleanupUpdate(update: SDKCleanupUpdate): CleanupUpdate {
  return {
    ...update,
    addedAt: toString(update.addedAt) ?? "",
    blockNumber: toString(update.blockNumber) ?? "",
  };
}

export const getCleanupUpdates = async (
  cleanupId: string,
  pagination: PaginationParams = { first: 100, skip: 0 }
): Promise<CleanupUpdate[]> => {
  const variables: GetCleanupUpdatesParams = {
    first: pagination.first,
    skip: pagination.skip,
    orderBy: (pagination.orderBy as CleanupUpdate_orderBy) || "addedAt",
    orderDirection: (pagination.orderDirection as OrderDirection) || "desc",
  };

  const where: CleanupUpdate_filter = {
    cleanup: cleanupId,
  };
  variables.where = where;

  const response = await client.request<{
    cleanupUpdates: SDKCleanupUpdate[];
  }>(GET_CLEANUP_UPDATES_QUERY, variables);
  return response.cleanupUpdates.map(transformCleanupUpdate);
};

// Users Queries
export const getUsers = async (
  filters: UserFilters = {},
  pagination: PaginationParams = { first: 20, skip: 0 }
): Promise<User[]> => {
  const variables: GetUsersParams = {
    first: pagination.first,
    skip: pagination.skip,
    orderBy: (pagination.orderBy as User_orderBy) || "registeredAt",
    orderDirection: (pagination.orderDirection as OrderDirection) || "desc",
  };

  const where: User_filter = {};
  if (filters.isOrganizer !== undefined) {
    where.isOrganizer = filters.isOrganizer;
  }
  if (filters.emailVerified !== undefined) {
    where.emailVerified = filters.emailVerified;
  }
  if (filters.kycStatus !== undefined) {
    where.kycStatus = filters.kycStatus;
  }
  if (filters.referrer) {
    where.referrer = normalizeAddress(filters.referrer);
  }
  if (Object.keys(where).length > 0) {
    variables.where = where;
  }

  const response = await client.request<{ users: SDKUser[] }>(
    GET_USERS_QUERY,
    variables
  );
  return response.users.map(transformUser);
};

export const getUser = async (id: string): Promise<User | null> => {
  const response = await client.request<{ user: SDKUser | null }>(
    GET_USER_QUERY,
    {
      id: normalizeAddress(id),
    } as GetUserParams
  );
  return response.user ? transformUser(response.user) : null;
};
