import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWallet, useSendTransaction } from "@vechain/vechain-kit";
import { CONTRACT_ADDRESSES } from "../config/constants";
import { createClause } from "../helpers/contracts";
import { UserRegistryABI } from "@cleanmate/cip-sdk";

export interface SetUserReferralCodeParams {
  userAddress: string;
  referralCode: string;
}

export function useSetUserReferralCode() {
  const queryClient = useQueryClient();
  const { account } = useWallet();
  const { sendTransaction, isTransactionPending, error } = useSendTransaction({
    signerAccountAddress: account?.address ?? null,
    onTxConfirmed: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const setUserReferralCode = useMutation({
    mutationFn: async (params: SetUserReferralCodeParams) => {
      if (!account) {
        throw new Error("Wallet not connected");
      }

      if (!CONTRACT_ADDRESSES.USER_REGISTRY) {
        throw new Error("User Registry address not configured");
      }

      if (!params.userAddress || !params.referralCode.trim()) {
        throw new Error("User address and referral code are required");
      }

      const clause = createClause(
        UserRegistryABI,
        CONTRACT_ADDRESSES.USER_REGISTRY,
        "setUserReferralCode",
        [params.userAddress, params.referralCode.trim()]
      );

      return sendTransaction([clause]);
    },
  });

  return {
    setUserReferralCode: setUserReferralCode.mutate,
    setUserReferralCodeAsync: setUserReferralCode.mutateAsync,
    isPending: isTransactionPending || setUserReferralCode.isPending,
    isSuccess: setUserReferralCode.isSuccess,
    error: error || setUserReferralCode.error,
    hash: setUserReferralCode.data,
  };
}
