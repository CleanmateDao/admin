import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWallet, useSendTransaction } from "@vechain/vechain-kit";
import { CleanupABI } from "@cleanmate/cip-sdk";
import { createClause } from "../helpers/contracts";
import { CONTRACT_ADDRESSES } from "../config/constants";

interface UpdateStatusParams {
  cleanupId: string | number;
  status: number;
}

interface PublishParams {
  cleanupId: string | number;
}

export const useUpdateCleanupStatus = () => {
  const queryClient = useQueryClient();
  const { account } = useWallet();
  const { sendTransaction, isTransactionPending, error } = useSendTransaction({
    signerAccountAddress: account?.address ?? null,
    onTxConfirmed: () => {
      queryClient.invalidateQueries({ queryKey: ["cleanups"] });
      queryClient.invalidateQueries({ queryKey: ["cleanup"] });
    },
  });

  const updateStatus = useMutation({
    mutationFn: async (params: UpdateStatusParams) => {
      if (!account) {
        throw new Error("Wallet not connected");
      }

      const cleanupId = (
        CONTRACT_ADDRESSES as typeof CONTRACT_ADDRESSES & { CLEANUP?: string }
      ).CLEANUP;
      if (!cleanupId) {
        throw new Error("Cleanup contract address not configured");
      }

      const cleanupIdParam =
        typeof params.cleanupId === "string"
          ? BigInt(params.cleanupId)
          : BigInt(params.cleanupId);

      const clause = createClause(
        CleanupABI,
        cleanupId,
        "updateCleanupStatus",
        [cleanupIdParam, params.status]
      );

      return sendTransaction([clause]);
    },
  });

  return {
    updateStatus: updateStatus.mutate,
    updateStatusAsync: updateStatus.mutateAsync,
    isPending: isTransactionPending || updateStatus.isPending,
    isSuccess: updateStatus.isSuccess,
    error: error || updateStatus.error,
    hash: updateStatus.data,
  };
};

export const usePublishCleanup = () => {
  const queryClient = useQueryClient();
  const { account } = useWallet();
  const { sendTransaction, isTransactionPending, error } = useSendTransaction({
    signerAccountAddress: account?.address ?? null,
    onTxConfirmed: () => {
      queryClient.invalidateQueries({ queryKey: ["cleanups"] });
      queryClient.invalidateQueries({ queryKey: ["cleanup"] });
    },
  });

  const publish = useMutation({
    mutationFn: async (params: PublishParams) => {
      if (!account) {
        throw new Error("Wallet not connected");
      }

      const cleanupId = (
        CONTRACT_ADDRESSES as typeof CONTRACT_ADDRESSES & { CLEANUP?: string }
      ).CLEANUP;
      if (!cleanupId) {
        throw new Error("Cleanup contract address not configured");
      }

      const cleanupIdParam =
        typeof params.cleanupId === "string"
          ? BigInt(params.cleanupId)
          : BigInt(params.cleanupId);

      const clause = createClause(CleanupABI, cleanupId, "publishCleanup", [
        cleanupIdParam,
      ]);

      return sendTransaction([clause]);
    },
  });

  return {
    publish: publish.mutate,
    publishAsync: publish.mutateAsync,
    isPending: isTransactionPending || publish.isPending,
    isSuccess: publish.isSuccess,
    error: error || publish.error,
    hash: publish.data,
  };
};

export const useUnpublishCleanup = () => {
  const queryClient = useQueryClient();
  const { account } = useWallet();
  const { sendTransaction, isTransactionPending, error } = useSendTransaction({
    signerAccountAddress: account?.address ?? null,
    onTxConfirmed: () => {
      queryClient.invalidateQueries({ queryKey: ["cleanups"] });
      queryClient.invalidateQueries({ queryKey: ["cleanup"] });
    },
  });

  const unpublish = useMutation({
    mutationFn: async (params: PublishParams) => {
      if (!account) {
        throw new Error("Wallet not connected");
      }

      const cleanupId = (
        CONTRACT_ADDRESSES as typeof CONTRACT_ADDRESSES & { CLEANUP?: string }
      ).CLEANUP;
      if (!cleanupId) {
        throw new Error("Cleanup contract address not configured");
      }

      const cleanupIdParam =
        typeof params.cleanupId === "string"
          ? BigInt(params.cleanupId)
          : BigInt(params.cleanupId);

      const clause = createClause(CleanupABI, cleanupId, "unpublishCleanup", [
        cleanupIdParam,
      ]);

      return sendTransaction([clause]);
    },
  });

  return {
    unpublish: unpublish.mutate,
    unpublishAsync: unpublish.mutateAsync,
    isPending: isTransactionPending || unpublish.isPending,
    isSuccess: unpublish.isSuccess,
    error: error || unpublish.error,
    hash: unpublish.data,
  };
};
