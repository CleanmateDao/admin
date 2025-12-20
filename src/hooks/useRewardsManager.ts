import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useWallet, useSendTransaction } from "@vechain/vechain-kit";
import { RewardsManagerABI } from "@cleanmate/cip-sdk";
import { CONTRACT_ADDRESSES } from "../config/constants";
import { createClause } from "../helpers/contracts";
import { parseUnits } from "viem";

export interface SendRewardsParams {
  recipients: string[];
  amounts: string[]; // In B3TR (will be converted to wei)
  rewardTypes: number[]; // 0=REFERRAL, 1=BONUS, 2=OTHERS
}

export interface DistributeRewardsParams {
  cleanupId: number; // uint256 cleanup ID
  participants: string[];
  amounts: string[]; // In B3TR (will be converted to wei)
}

export interface DistributeStreaksRewardParams {
  submissionIds: string[]; // Submission IDs as strings (will be converted to BigInt)
  amounts: string[]; // In B3TR (will be converted to wei)
}

export interface UserReward {
  pending: string;
  claimed: string;
}

export function useSendRewards() {
  const queryClient = useQueryClient();
  const { account } = useWallet();
  const { sendTransaction, isTransactionPending, error } = useSendTransaction({
    signerAccountAddress: account?.address ?? null,
    onTxConfirmed: () => {
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const sendRewards = useMutation({
    mutationFn: async (params: SendRewardsParams) => {
      if (!account) {
        throw new Error("Wallet not connected");
      }

      if (!CONTRACT_ADDRESSES.REWARDS_MANAGER) {
        throw new Error("Rewards Manager address not configured");
      }

      // Convert amounts from B3TR to wei (parseUnits returns bigint)
      const amountsWei = params.amounts.map((amount) => parseUnits(amount, 18));

      const clause = createClause(
        RewardsManagerABI,
        CONTRACT_ADDRESSES.REWARDS_MANAGER,
        "sendRewards",
        [
          {
            recipients: params.recipients,
            amounts: amountsWei,
            rewardTypes: params.rewardTypes,
          },
        ]
      );

      return sendTransaction([clause]);
    },
  });

  return {
    sendRewards: sendRewards.mutate,
    sendRewardsAsync: sendRewards.mutateAsync,
    isPending: isTransactionPending || sendRewards.isPending,
    isSuccess: sendRewards.isSuccess,
    error: error || sendRewards.error,
    hash: sendRewards.data,
  };
}

export function useDistributeRewards() {
  const queryClient = useQueryClient();
  const { account } = useWallet();
  const { sendTransaction, isTransactionPending, error } = useSendTransaction({
    signerAccountAddress: account?.address ?? null,
    onTxConfirmed: () => {
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
      queryClient.invalidateQueries({ queryKey: ["cleanups"] });
      queryClient.invalidateQueries({ queryKey: ["cleanup"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const distributeRewards = useMutation({
    mutationFn: async (params: DistributeRewardsParams) => {
      if (!account) {
        throw new Error("Wallet not connected");
      }

      if (!CONTRACT_ADDRESSES.REWARDS_MANAGER) {
        throw new Error("Rewards Manager address not configured");
      }

      // Convert amounts from B3TR to wei (parseUnits returns bigint)
      const amountsWei = params.amounts.map((amount) => parseUnits(amount, 18));

      const clause = createClause(
        RewardsManagerABI,
        CONTRACT_ADDRESSES.REWARDS_MANAGER,
        "distributeRewards",
        [
          {
            cleanupId: BigInt(params.cleanupId),
            participants: params.participants,
            amounts: amountsWei,
          },
        ]
      );

      return sendTransaction([clause]);
    },
  });

  return {
    distributeRewards: distributeRewards.mutate,
    distributeRewardsAsync: distributeRewards.mutateAsync,
    isPending: isTransactionPending || distributeRewards.isPending,
    isSuccess: distributeRewards.isSuccess,
    error: error || distributeRewards.error,
    hash: distributeRewards.data,
  };
}

export function useDistributeStreaksReward() {
  const queryClient = useQueryClient();
  const { account } = useWallet();
  const { sendTransaction, isTransactionPending, error } = useSendTransaction({
    signerAccountAddress: account?.address ?? null,
    onTxConfirmed: () => {
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
      queryClient.invalidateQueries({ queryKey: ["streakSubmissions"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const distributeStreaksReward = useMutation({
    mutationFn: async (params: DistributeStreaksRewardParams) => {
      if (!account) {
        throw new Error("Wallet not connected");
      }

      if (!CONTRACT_ADDRESSES.REWARDS_MANAGER) {
        throw new Error("Rewards Manager address not configured");
      }

      // Convert submission IDs to BigInt
      const submissionIdsBigInt = params.submissionIds.map((id) => BigInt(id));

      // Convert amounts from B3TR to wei (parseUnits returns bigint)
      const amountsWei = params.amounts.map((amount) => parseUnits(amount, 18));

      const clause = createClause(
        RewardsManagerABI,
        CONTRACT_ADDRESSES.REWARDS_MANAGER,
        "distributeStreaksReward",
        [
          {
            submissionIds: submissionIdsBigInt,
            amounts: amountsWei,
          },
        ]
      );

      return sendTransaction([clause]);
    },
  });

  return {
    distributeStreaksReward: distributeStreaksReward.mutate,
    distributeStreaksRewardAsync: distributeStreaksReward.mutateAsync,
    isPending: isTransactionPending || distributeStreaksReward.isPending,
    isSuccess: distributeStreaksReward.isSuccess,
    error: error || distributeStreaksReward.error,
    hash: distributeStreaksReward.data,
  };
}

export function useUserRewards(userAddress: string | null) {
  const { account } = useWallet();

  return useQuery({
    queryKey: ["rewards", userAddress],
    queryFn: async () => {
      if (!userAddress || !CONTRACT_ADDRESSES.REWARDS_MANAGER) {
        return null;
      }

      // This would need to be implemented with a contract read
      // For now, return null as we'd need to set up contract reading
      return null;
    },
    enabled: !!userAddress && !!account,
  });
}
