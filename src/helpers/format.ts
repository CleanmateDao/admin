import type { StreakSubmissionStatus } from "../types";
import {
  parseCleanupMetadata as parseCleanupMetadataCIP,
  parseCleanupUpdateMetadata as parseCleanupUpdateMetadataCIP,
  parseUserProfileMetadata,
} from "@cleanmate/cip-sdk";

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

/**
 * Parse cleanup metadata from JSON string or plain string
 */
export const parseCleanupMetadata = (
  metadata: string | null
): {
  title?: string;
  description?: string;
  category?: string;
  media?: Array<{
    ipfsHash: string;
    type: string;
    name: string;
  }>;
} | null => {
  if (!metadata) return null;

  // Try to parse using CIP metadata utilities first
  try {
    const parsedCIP = parseCleanupMetadataCIP(metadata);
    if (parsedCIP) {
      return parsedCIP;
    }
  } catch {
    // CIP metadata not available, fall through to manual parsing
  }

  try {
    const parsed = JSON.parse(metadata);
    if (typeof parsed === "object" && parsed !== null) {
      return parsed;
    }
  } catch (error) {
    // Not JSON, treat as plain string
    return {
      title: "Untitled Cleanup",
      description: metadata.trim(),
    };
  }

  return null;
};

/**
 * Get cleanup title from metadata
 */
export const getCleanupTitle = (metadata: string | null): string => {
  const parsed = parseCleanupMetadata(metadata);
  return parsed?.title || "Untitled Cleanup";
};

/**
 * Get cleanup description from metadata
 */
export const getCleanupDescription = (metadata: string | null): string => {
  const parsed = parseCleanupMetadata(metadata);
  return parsed?.description || "";
};

/**
 * Parse user metadata from JSON string or plain string
 */
export const parseUserMetadata = (
  metadata: string | null
): {
  name?: string;
  bio?: string;
  photo?: string;
  location?: string | { state?: string; country?: string };
  interests?: string[];
} | null => {
  if (!metadata) return null;

  // Try to parse using CIP metadata utilities first
  try {
    const parsedCIP = parseUserProfileMetadata<string>(metadata);
    if (parsedCIP) {
      return parsedCIP;
    }
  } catch {
    // CIP metadata not available, fall through to manual parsing
  }

  try {
    const parsed = JSON.parse(metadata);
    if (typeof parsed === "object" && parsed !== null) {
      return parsed;
    }
  } catch (error) {
    // Not JSON, treat as plain string (legacy format - might be name)
    return {
      name: metadata.trim(),
    };
  }

  return null;
};

/**
 * Get user name from metadata
 */
export const getUserName = (metadata: string | null): string => {
  const parsed = parseUserMetadata(metadata);
  return parsed?.name || "Unknown User";
};

/**
 * Get user location from metadata
 */
export const getUserLocation = (
  metadata: string | null
): { city?: string; country?: string; state?: string } | null => {
  const parsed = parseUserMetadata(metadata);
  if (!parsed?.location) return null;

  if (typeof parsed.location === "object") {
    return {
      country: parsed.location.country,
      state: parsed.location.state,
    };
  }

  if (typeof parsed.location === "string") {
    // Legacy format: "City, Country" or "Country"
    const parts = parsed.location
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length === 0) return null;
    if (parts.length === 1) {
      return { country: parts[0] };
    }
    return {
      city: parts[0],
      country: parts[parts.length - 1],
    };
  }

  return null;
};

/**
 * Parse cleanup update metadata from JSON string
 */
export const parseCleanupUpdateMetadata = (
  metadata: string | null
): {
  description?: string;
  media?: Array<{
    ipfsHash: string;
    type: string;
    name: string;
  }>;
} | null => {
  if (!metadata) return null;

  try {
    const parsedCIP = parseCleanupUpdateMetadataCIP(metadata);
    if (parsedCIP) {
      return parsedCIP;
    }
  } catch {
    // CIP metadata not available, fall through to manual parsing
  }

  try {
    const parsed = JSON.parse(metadata);
    if (typeof parsed === "object" && parsed !== null) {
      return parsed;
    }
  } catch {
    // Not JSON, return null
    return null;
  }

  return null;
};
