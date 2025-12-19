import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWallet, useSendTransaction } from "@vechain/vechain-kit";
import { CONTRACT_ADDRESSES } from "../config/constants";
import { StreakABI } from "../contracts/abis/Streak";
import { createClause } from "../helpers/contracts";

interface ApproveStreaksParams {
  submissionIds: bigint[];
  amounts: bigint[];
}

interface RejectStreaksParams {
  submissionIds: bigint[];
  reasons: string[];
}

export const useApproveStreaks = () => {
  const queryClient = useQueryClient();
  const { account } = useWallet();
  const {
    sendTransaction,
    isTransactionPending,
    error,
  } = useSendTransaction({
    signerAccountAddress: account?.address ?? null,
    onTxConfirmed: () => {
      queryClient.invalidateQueries({ queryKey: ["streakSubmissions"] });
      queryClient.invalidateQueries({ queryKey: ["streakSubmission"] });
    },
  });

  const approve = useMutation({
    mutationFn: async (params: ApproveStreaksParams) => {
      if (!account) {
        throw new Error("Wallet not connected");
      }
      if (!CONTRACT_ADDRESSES.STREAK) {
        throw new Error("Streak contract address not configured");
      }

      const clause = createClause(
        StreakABI,
        CONTRACT_ADDRESSES.STREAK,
        "approveStreaks",
        [params]
      );

      return sendTransaction([clause]);
    },
  });

  return {
    approve: approve.mutate,
    approveAsync: approve.mutateAsync,
    isPending: isTransactionPending || approve.isPending,
    isSuccess: approve.isSuccess,
    error: error || approve.error,
    hash: approve.data,
  };
};

export const useRejectStreaks = () => {
  const queryClient = useQueryClient();
  const { account } = useWallet();
  const {
    sendTransaction,
    isTransactionPending,
    error,
  } = useSendTransaction({
    signerAccountAddress: account?.address ?? null,
    onTxConfirmed: () => {
      queryClient.invalidateQueries({ queryKey: ["streakSubmissions"] });
      queryClient.invalidateQueries({ queryKey: ["streakSubmission"] });
    },
  });

  const reject = useMutation({
    mutationFn: async (params: RejectStreaksParams) => {
      if (!account) {
        throw new Error("Wallet not connected");
      }
      if (!CONTRACT_ADDRESSES.STREAK) {
        throw new Error("Streak contract address not configured");
      }

      const clause = createClause(
        StreakABI,
        CONTRACT_ADDRESSES.STREAK,
        "rejectStreaks",
        [params]
      );

      return sendTransaction([clause]);
    },
  });

  return {
    reject: reject.mutate,
    rejectAsync: reject.mutateAsync,
    isPending: isTransactionPending || reject.isPending,
    isSuccess: reject.isSuccess,
    error: error || reject.error,
    hash: reject.data,
  };
};

