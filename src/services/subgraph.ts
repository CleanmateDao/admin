import { GraphQLClient } from "graphql-request";
import { SUBGRAPH_URL } from "../config/constants";
import type {
  StreakSubmission,
  Cleanup,
  User,
  PaginationParams,
  StreakSubmissionFilters,
  CleanupFilters,
  UserFilters,
} from "../types";

const client = new GraphQLClient(SUBGRAPH_URL);

// Streak Submissions Queries
export const getStreakSubmissions = async (
  filters: StreakSubmissionFilters = {},
  pagination: PaginationParams = { first: 20, skip: 0 }
): Promise<StreakSubmission[]> => {
  const conditions: string[] = [];

  if (filters.status !== undefined) {
    conditions.push(`status: ${filters.status}`);
  }
  if (filters.user) {
    conditions.push(`user: "${filters.user.toLowerCase()}"`);
  }

  const whereClause =
    conditions.length > 0 ? `where: { ${conditions.join(", ")} }` : "";

  const query = `
    query GetStreakSubmissions {
      streakSubmissions(
        ${whereClause}
        first: ${pagination.first}
        skip: ${pagination.skip}
        orderBy: ${pagination.orderBy || "submittedAt"}
        orderDirection: ${pagination.orderDirection || "desc"}
      ) {
        id
        user
        submissionId
        metadata
        status
        submittedAt
        reviewedAt
        amount
        rewardAmount
        rejectionReason
        ipfsHashes
        mimetypes
        blockNumber
        transactionHash
        media {
          id
          ipfsHash
          mimeType
          index
        }
      }
    }
  `;

  const data = await client.request<{ streakSubmissions: StreakSubmission[] }>(
    query
  );
  return data.streakSubmissions;
};

export const getStreakSubmission = async (
  id: string
): Promise<StreakSubmission | null> => {
  const query = `
    query GetStreakSubmission($id: ID!) {
      streakSubmission(id: $id) {
        id
        user
        submissionId
        metadata
        status
        submittedAt
        reviewedAt
        amount
        rewardAmount
        rejectionReason
        ipfsHashes
        mimetypes
        blockNumber
        transactionHash
        media {
          id
          ipfsHash
          mimeType
          index
        }
      }
    }
  `;

  const data = await client.request<{ streakSubmission: StreakSubmission | null }>(
    query,
    { id }
  );
  return data.streakSubmission;
};

// Cleanups Queries
export const getCleanups = async (
  filters: CleanupFilters = {},
  pagination: PaginationParams = { first: 20, skip: 0 }
): Promise<Cleanup[]> => {
  const conditions: string[] = [];

  if (filters.status !== undefined) {
    conditions.push(`status: ${filters.status}`);
  }
  if (filters.organizer) {
    conditions.push(`organizer: "${filters.organizer.toLowerCase()}"`);
  }
  if (filters.published !== undefined) {
    conditions.push(`published: ${filters.published}`);
  }

  const whereClause =
    conditions.length > 0 ? `where: { ${conditions.join(", ")} }` : "";

  const query = `
    query GetCleanups {
      cleanups(
        ${whereClause}
        first: ${pagination.first}
        skip: ${pagination.skip}
        orderBy: ${pagination.orderBy || "createdAt"}
        orderDirection: ${pagination.orderDirection || "desc"}
      ) {
        id
        organizer
        metadata
        category
        date
        startTime
        endTime
        maxParticipants
        status
        published
        publishedAt
        unpublishedAt
        createdAt
        updatedAt
        proofOfWorkSubmitted
        proofOfWorkMediaCount
        proofOfWorkSubmittedAt
        location
        city
        country
        latitude
        longitude
        rewardAmount
        rewardsDistributed
        rewardsTotalAmount
        rewardsParticipantCount
        rewardsDistributedAt
        participants {
          id
          participant
          appliedAt
          status
          acceptedAt
          rejectedAt
          rewardEarned
          rewardEarnedAt
        }
        medias {
          id
          url
          mimeType
          createdAt
        }
        proofOfWorkMedia {
          id
          url
          mimeType
          uploadedAt
          submittedAt
        }
      }
    }
  `;

  const data = await client.request<{ cleanups: Cleanup[] }>(query);
  return data.cleanups;
};

export const getCleanup = async (id: string): Promise<Cleanup | null> => {
  const query = `
    query GetCleanup($id: Bytes!) {
      cleanup(id: $id) {
        id
        organizer
        metadata
        category
        date
        startTime
        endTime
        maxParticipants
        status
        published
        publishedAt
        unpublishedAt
        createdAt
        updatedAt
        proofOfWorkSubmitted
        proofOfWorkMediaCount
        proofOfWorkSubmittedAt
        location
        city
        country
        latitude
        longitude
        rewardAmount
        rewardsDistributed
        rewardsTotalAmount
        rewardsParticipantCount
        rewardsDistributedAt
        participants {
          id
          participant
          appliedAt
          status
          acceptedAt
          rejectedAt
          rewardEarned
          rewardEarnedAt
        }
        medias {
          id
          url
          mimeType
          createdAt
        }
        proofOfWorkMedia {
          id
          url
          mimeType
          uploadedAt
          submittedAt
        }
      }
    }
  `;

  const data = await client.request<{ cleanup: Cleanup | null }>(query, {
    id: id.toLowerCase(),
  });
  return data.cleanup;
};

// Users Queries
export const getUsers = async (
  filters: UserFilters = {},
  pagination: PaginationParams = { first: 20, skip: 0 }
): Promise<User[]> => {
  const conditions: string[] = [];

  if (filters.isOrganizer !== undefined) {
    conditions.push(`isOrganizer: ${filters.isOrganizer}`);
  }
  if (filters.emailVerified !== undefined) {
    conditions.push(`emailVerified: ${filters.emailVerified}`);
  }
  if (filters.kycStatus !== undefined) {
    conditions.push(`kycStatus: ${filters.kycStatus}`);
  }
  if (filters.referrer) {
    conditions.push(`referrer: "${filters.referrer.toLowerCase()}"`);
  }

  const whereClause =
    conditions.length > 0 ? `where: { ${conditions.join(", ")} }` : "";

  const query = `
    query GetUsers {
      users(
        ${whereClause}
        first: ${pagination.first}
        skip: ${pagination.skip}
        orderBy: ${pagination.orderBy || "registeredAt"}
        orderDirection: ${pagination.orderDirection || "desc"}
      ) {
        id
        metadata
        email
        emailVerified
        kycStatus
        referralCode
        referrer
        isOrganizer
        registeredAt
        emailVerifiedAt
        lastProfileUpdateAt
        totalRewardsEarned
        totalRewardsClaimed
        pendingRewards
      }
    }
  `;

  const data = await client.request<{ users: User[] }>(query);
  return data.users;
};

export const getUser = async (id: string): Promise<User | null> => {
  const query = `
    query GetUser($id: Bytes!) {
      user(id: $id) {
        id
        metadata
        email
        emailVerified
        kycStatus
        referralCode
        referrer
        isOrganizer
        registeredAt
        emailVerifiedAt
        lastProfileUpdateAt
        totalRewardsEarned
        totalRewardsClaimed
        pendingRewards
      }
    }
  `;

  const data = await client.request<{ user: User | null }>(query, {
    id: id.toLowerCase(),
  });
  return data.user;
};

