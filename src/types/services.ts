// KYC Types
export interface KycSubmission {
  id: string;
  address: string;
  status: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
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

