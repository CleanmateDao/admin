// KYC Types
export type KycStatus = 'pending' | 'approved' | 'rejected';

export interface KycSubmissionAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

// For list endpoint (KycSubmissionListItem)
export interface KycSubmission {
  submissionId: string;
  userId: string;
  walletAddress?: string;
  firstName: string;
  lastName: string;
  email: string;
  status: KycStatus;
  submittedAt: string;
  reviewedAt?: string;
  documentType: string;
  // Detail endpoint adds these fields:
  id?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  nationality?: string;
  documentNumber?: string;
  address?: KycSubmissionAddress;
  mediaUrls?: string[];
  reviewedBy?: string;
  rejectionReason?: string;
  updatedAt?: string;
}

// Bank Types
export interface Transaction {
  id: string;
  userId: string;
  amount: string;
  currency: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExchangeRate {
  id: string;
  currencyCode: string;
  currencyName: string;
  symbol: string;
  rateToB3TR: string;
}

export interface ExchangeRateInput {
  currencyCode: string;
  currencyName: string;
  symbol: string;
  rateToB3TR: string;
}

// Email Types
export type EmailStatus = Record<string, unknown>;

