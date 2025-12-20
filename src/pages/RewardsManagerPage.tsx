import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Dialog } from "../components/ui/Dialog";
import {
  useSendRewards,
  useDistributeRewards,
  useDistributeStreaksReward,
  type SendRewardsParams,
  type DistributeRewardsParams,
  type DistributeStreaksRewardParams,
} from "../hooks/useRewardsManager";
import { useCleanups } from "../hooks/useCleanups";
import { useCleanup } from "../hooks/useCleanups";
import { getUser } from "../services/subgraph";
import { formatAddress } from "../helpers/format";
import { parseUserProfileMetadata } from "@cleanmate/cip-sdk";
import type { StreakSubmission } from "../types";

// Helper function to extract name from user metadata
const getUserName = (metadata: string | null): string | undefined => {
  if (!metadata) return undefined;
  try {
    // Try to parse using CIP metadata utilities first
    const parsedCIP = parseUserProfileMetadata<string>(metadata);
    if (parsedCIP?.name) {
      return parsedCIP.name;
    }
  } catch {
    // CIP metadata not available, fall through to manual parsing
  }
  try {
    const parsed = JSON.parse(metadata);
    return parsed.name || parsed.fullName || parsed.displayName || undefined;
  } catch {
    return undefined;
  }
};

type Tab = "send" | "distribute" | "streaks";

interface RewardRecipient {
  address: string;
  amount: string;
  rewardType: number;
}

interface CleanupParticipantReward {
  address: string;
  amount: string;
  userName?: string;
  approvedAmount?: string;
}

interface StreakSubmissionReward {
  submissionId: string;
  amount: string;
}

interface StreakCartItem {
  submissionId: string;
  amount: string;
  metadata?: string;
  user?: string;
  submittedAt?: string;
}

export default function RewardsManagerPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("send");
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showDistributeDialog, setShowDistributeDialog] = useState(false);
  const [showStreaksDialog, setShowStreaksDialog] = useState(false);

  // Send rewards state
  const [recipients, setRecipients] = useState<RewardRecipient[]>([
    { address: "", amount: "", rewardType: 2 }, // Default to OTHERS
  ]);

  // Distribute rewards state
  const [cleanupIdInput, setCleanupIdInput] = useState<string>("");
  const [selectedCleanup, setSelectedCleanup] = useState<string>("");
  const [participantRewards, setParticipantRewards] = useState<
    CleanupParticipantReward[]
  >([{ address: "", amount: "" }]);
  const [cleanupError, setCleanupError] = useState<string>("");

  // Distribute streak rewards state - using cart approach
  const [streakCart, setStreakCart] = useState<StreakCartItem[]>([]);

  const { sendRewards, isPending: isSending } = useSendRewards();
  const { distributeRewards, isPending: isDistributing } =
    useDistributeRewards();
  const { distributeStreaksReward, isPending: isDistributingStreaks } =
    useDistributeStreaksReward();
  const { data: cleanupsData } = useCleanups({});
  const {
    data: selectedCleanupData,
    isLoading: isLoadingCleanup,
    error: cleanupLoadError,
  } = useCleanup(selectedCleanup || null, !!selectedCleanup);
  const cleanups = cleanupsData?.pages.flat() || [];

  // Handle loading cleanup
  const handleLoadCleanup = () => {
    const cleanupId = cleanupIdInput.trim();
    if (!cleanupId) {
      setCleanupError("Please enter a cleanup ID");
      return;
    }

    // Validate cleanup ID format (should be a valid number)
    const cleanupIdNum = Number(cleanupId);
    if (
      isNaN(cleanupIdNum) ||
      cleanupIdNum <= 0 ||
      !Number.isInteger(cleanupIdNum)
    ) {
      setCleanupError(
        "Invalid cleanup ID format. Please enter a valid positive integer."
      );
      return;
    }

    setCleanupError("");
    setSelectedCleanup(cleanupId);
  };

  // Handle cleanup load errors
  useEffect(() => {
    if (cleanupLoadError && selectedCleanup) {
      setCleanupError(
        `Failed to load cleanup: ${
          cleanupLoadError.message || "Cleanup not found"
        }`
      );
      setParticipantRewards([{ address: "", amount: "" }]);
    }
  }, [cleanupLoadError, selectedCleanup]);

  // Handle case when cleanup data is null (not found)
  useEffect(() => {
    if (
      selectedCleanup &&
      !isLoadingCleanup &&
      selectedCleanupData === null &&
      !cleanupLoadError
    ) {
      setCleanupError(
        "Cleanup not found. Please check the cleanup ID and try again."
      );
      setParticipantRewards([{ address: "", amount: "" }]);
    }
  }, [
    selectedCleanup,
    isLoadingCleanup,
    selectedCleanupData,
    cleanupLoadError,
  ]);

  // Auto-load participants when cleanup is selected and validated
  useEffect(() => {
    if (selectedCleanupData && selectedCleanup && !isLoadingCleanup) {
      // Validate cleanup status
      const status = selectedCleanupData.status;
      if (status !== 3 && status !== 4) {
        // 3 = COMPLETED, 4 = REWARDED
        setCleanupError(
          `Cleanup is not in a valid state for reward distribution. Status: ${
            status === 0
              ? "UNPUBLISHED"
              : status === 1
              ? "OPEN"
              : status === 2
              ? "IN_PROGRESS"
              : "UNKNOWN"
          }. Only COMPLETED (3) or REWARDED (4) cleanups can have rewards distributed.`
        );
        setParticipantRewards([{ address: "", amount: "" }]);
        return;
      }

      // Check if cleanup already has rewards distributed
      // The contract prevents double distribution using rewardsDistributed mapping
      if (selectedCleanupData.rewardsDistributed) {
        setCleanupError(
          "This cleanup has already had rewards distributed. You cannot distribute rewards again."
        );
        setParticipantRewards([{ address: "", amount: "" }]);
        return;
      }

      // Check if proof of work is submitted
      if (!selectedCleanupData.proofOfWorkSubmitted) {
        setCleanupError(
          "This cleanup does not have proof of work submitted. Proof of work must be submitted before distributing rewards."
        );
        setParticipantRewards([{ address: "", amount: "" }]);
        return;
      }

      // Clear any previous errors
      setCleanupError("");

      const accepted = selectedCleanupData.participants.filter(
        (p) => p.status === "accepted"
      );

      if (accepted.length > 0) {
        setParticipantRewards(
          accepted.map((p) => ({
            address: p.participant,
            amount: p.rewardEarned || "0",
            approvedAmount: p.rewardEarned || "0",
            userName: undefined, // Will be loaded separately
          }))
        );
      } else {
        setParticipantRewards([{ address: "", amount: "" }]);
        setCleanupError("No accepted participants found for this cleanup.");
      }
    } else if (!selectedCleanup) {
      setParticipantRewards([{ address: "", amount: "" }]);
      if (!cleanupLoadError) {
        setCleanupError("");
      }
    }
  }, [
    selectedCleanupData,
    selectedCleanup,
    isLoadingCleanup,
    cleanupLoadError,
  ]);

  // Fetch user data for all participants to get names
  const participantAddresses = useMemo(
    () => participantRewards.map((p) => p.address).filter((addr) => addr),
    [participantRewards]
  );

  const userQueries = useQueries({
    queries: participantAddresses.map((address) => ({
      queryKey: ["user", address],
      queryFn: () => getUser(address),
      enabled: !!address,
      staleTime: 5 * 60 * 1000,
    })),
  });

  // Create a map of address to user name
  const addressToUserName = useMemo(() => {
    const map = new Map<string, string>();
    userQueries.forEach((query, index) => {
      if (query.data && participantAddresses[index]) {
        const name = getUserName(query.data.metadata);
        if (name) {
          map.set(participantAddresses[index].toLowerCase(), name);
        }
      }
    });
    return map;
  }, [userQueries, participantAddresses]);

  const handleAddRecipient = () => {
    setRecipients([...recipients, { address: "", amount: "", rewardType: 2 }]);
  };

  const handleRemoveRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const handleRecipientChange = (
    index: number,
    field: keyof RewardRecipient,
    value: string | number
  ) => {
    const updated = [...recipients];
    updated[index] = { ...updated[index], [field]: value };
    setRecipients(updated);
  };

  const handleSendRewards = () => {
    const validRecipients = recipients.filter(
      (r) => r.address && r.amount && parseFloat(r.amount) > 0
    );

    if (validRecipients.length === 0) {
      alert("Please add at least one valid recipient");
      return;
    }

    const params: SendRewardsParams = {
      recipients: validRecipients.map((r) => r.address),
      amounts: validRecipients.map((r) => r.amount),
      rewardTypes: validRecipients.map((r) => r.rewardType),
    };

    sendRewards(params, {
      onSuccess: () => {
        setShowSendDialog(false);
        setRecipients([{ address: "", amount: "", rewardType: 2 }]);
      },
      onError: (error) => {
        alert(`Error: ${error.message}`);
      },
    });
  };

  const handleAddParticipant = () => {
    setParticipantRewards([...participantRewards, { address: "", amount: "" }]);
  };

  const handleRemoveParticipant = (index: number) => {
    setParticipantRewards(participantRewards.filter((_, i) => i !== index));
  };

  const handleParticipantChange = (
    index: number,
    field: keyof CleanupParticipantReward,
    value: string
  ) => {
    const updated = [...participantRewards];
    updated[index] = { ...updated[index], [field]: value };
    setParticipantRewards(updated);
  };

  const handleDistributeRewards = () => {
    if (!selectedCleanup) {
      alert("Please load a cleanup first");
      return;
    }

    const validParticipants = participantRewards.filter(
      (p) => p.address && p.amount && parseFloat(p.amount) > 0
    );

    if (validParticipants.length === 0) {
      alert("Please add at least one valid participant");
      return;
    }

    const params: DistributeRewardsParams = {
      cleanupId: Number(selectedCleanup),
      participants: validParticipants.map((p) => p.address),
      amounts: validParticipants.map((p) => p.amount),
    };

    distributeRewards(params, {
      onSuccess: () => {
        setShowDistributeDialog(false);
        setSelectedCleanup("");
        setCleanupIdInput("");
        setParticipantRewards([{ address: "", amount: "" }]);
        setCleanupError("");
      },
      onError: (error) => {
        alert(`Error: ${error.message}`);
      },
    });
  };

  const handleClearCleanup = () => {
    setSelectedCleanup("");
    setCleanupIdInput("");
    setParticipantRewards([{ address: "", amount: "" }]);
    setCleanupError("");
  };

  const handleAddToStreakCart = (streak: StreakSubmission) => {
    // Check if already in cart
    if (streakCart.some((item) => item.submissionId === streak.submissionId)) {
      return;
    }

    const amount = streak.amount || streak.rewardAmount || "0";
    setStreakCart([
      ...streakCart,
      {
        submissionId: streak.submissionId,
        amount: amount,
        metadata: streak.metadata,
        user: streak.user,
        submittedAt: streak.submittedAt,
      },
    ]);
  };

  const handleRemoveFromStreakCart = (submissionId: string) => {
    setStreakCart(
      streakCart.filter((item) => item.submissionId !== submissionId)
    );
  };

  const handleClearStreakCart = () => {
    setStreakCart([]);
  };

  const handleUpdateCartItemAmount = (submissionId: string, amount: string) => {
    setStreakCart(
      streakCart.map((item) =>
        item.submissionId === submissionId ? { ...item, amount } : item
      )
    );
  };

  const handleDistributeStreaksReward = () => {
    if (streakCart.length === 0) {
      alert("Please add at least one streak submission to the cart");
      return;
    }

    const validRewards = streakCart.filter(
      (r) => r.submissionId && r.amount && parseFloat(r.amount) > 0
    );

    if (validRewards.length === 0) {
      alert("Please ensure all cart items have valid amounts");
      return;
    }

    const params: DistributeStreaksRewardParams = {
      submissionIds: validRewards.map((r) => r.submissionId),
      amounts: validRewards.map((r) => r.amount),
    };

    distributeStreaksReward(params, {
      onSuccess: () => {
        setShowStreaksDialog(false);
        setStreakCart([]);
      },
      onError: (error) => {
        alert(`Error: ${error.message}`);
      },
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Rewards Manager
        </h1>
        <div className="flex gap-2">
          <Button
            variant={activeTab === "send" ? "primary" : "secondary"}
            onClick={() => setActiveTab("send")}
          >
            Send Rewards
          </Button>
          <Button
            variant={activeTab === "distribute" ? "primary" : "secondary"}
            onClick={() => setActiveTab("distribute")}
          >
            Distribute Cleanup Rewards
          </Button>
          <Button
            variant={activeTab === "streaks" ? "primary" : "secondary"}
            onClick={() => setActiveTab("streaks")}
          >
            Distribute Streak Rewards
          </Button>
        </div>
      </div>

      {activeTab === "send" && (
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Send Direct Rewards
            </h2>
            <p className="text-sm text-muted-foreground">
              Send rewards directly to users (Referral, Bonus, Others)
            </p>
          </div>

          <div className="space-y-4">
            {recipients.map((recipient, index) => (
              <div
                key={index}
                className="flex gap-4 items-end p-4 bg-muted rounded border border-border"
              >
                <div className="flex-1">
                  <label className="block text-sm text-muted-foreground mb-2">
                    Address
                  </label>
                  <Input
                    type="text"
                    value={recipient.address}
                    onChange={(e) =>
                      handleRecipientChange(index, "address", e.target.value)
                    }
                    placeholder="0x..."
                    className="font-mono"
                  />
                </div>
                <div className="w-32">
                  <label className="block text-sm text-muted-foreground mb-2">
                    Amount (B3TR)
                  </label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={recipient.amount}
                    onChange={(e) =>
                      handleRecipientChange(index, "amount", e.target.value)
                    }
                    placeholder="0.0"
                  />
                </div>
                <div className="w-40">
                  <label className="block text-sm text-muted-foreground mb-2">
                    Type
                  </label>
                  <select
                    className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 transition-colors bg-background text-foreground border-input focus:ring-ring focus:border-ring"
                    value={recipient.rewardType}
                    onChange={(e) =>
                      handleRecipientChange(
                        index,
                        "rewardType",
                        parseInt(e.target.value)
                      )
                    }
                  >
                    <option value={0}>Referral</option>
                    <option value={1}>Bonus</option>
                    <option value={2}>Others</option>
                  </select>
                </div>
                {recipients.length > 1 && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleRemoveRecipient(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-4">
            <Button variant="secondary" onClick={handleAddRecipient}>
              Add Recipient
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowSendDialog(true)}
              disabled={isSending}
            >
              {isSending ? "Sending..." : "Send Rewards"}
            </Button>
          </div>
        </div>
      )}

      {activeTab === "distribute" && (
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Distribute Cleanup Rewards
            </h2>
            <p className="text-sm text-muted-foreground">
              Add a completed cleanup to your cart from the Cleanups page or
              Cleanup detail page, then review participants and distribute
              rewards here.
            </p>
          </div>

          {/* Cleanup Cart */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-foreground">
                Cleanup Cart {selectedCleanup ? "(1)" : "(0)"}
              </h3>
              {selectedCleanup && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleClearCleanup}
                >
                  Clear Cart
                </Button>
              )}
            </div>
            {!selectedCleanup ? (
              <div className="p-8 text-center border border-border rounded-lg bg-muted">
                <p className="text-muted-foreground">
                  Your cart is empty. Add a cleanup from the Cleanups page or
                  Cleanup detail page.
                </p>
                <div className="mt-4">
                  <label className="block text-sm text-muted-foreground mb-2">
                    Or enter Cleanup ID manually
                  </label>
                  <div className="flex gap-2 max-w-md mx-auto">
                    <Input
                      type="number"
                      value={cleanupIdInput}
                      onChange={(e) => {
                        setCleanupIdInput(e.target.value);
                        setCleanupError("");
                      }}
                      placeholder="Enter cleanup ID (number)"
                      className="font-mono flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleLoadCleanup();
                        }
                      }}
                    />
                    <Button
                      variant="primary"
                      onClick={handleLoadCleanup}
                      disabled={!cleanupIdInput.trim() || isLoadingCleanup}
                    >
                      {isLoadingCleanup ? "Loading..." : "Load"}
                    </Button>
                  </div>
                  {cleanupError && (
                    <p className="text-sm text-red-500 mt-2">{cleanupError}</p>
                  )}
                </div>
              </div>
            ) : selectedCleanupData && !cleanupError && !isLoadingCleanup ? (
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="p-4 bg-muted border-b border-border">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground mb-1">
                        Cleanup ID: {selectedCleanup}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Status:{" "}
                        {selectedCleanupData.status === 3
                          ? "COMPLETED"
                          : selectedCleanupData.status === 4
                          ? "REWARDED"
                          : `Unknown (${selectedCleanupData.status})`}
                        {selectedCleanupData.rewardsDistributed && (
                          <span className="ml-2 text-orange-500">
                            (Rewards already distributed)
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {
                          selectedCleanupData.participants.filter(
                            (p) => p.status === "accepted"
                          ).length
                        }{" "}
                        accepted participants
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : isLoadingCleanup ? (
              <div className="p-8 text-center border border-border rounded-lg bg-muted">
                <p className="text-muted-foreground">Loading cleanup...</p>
              </div>
            ) : (
              <div className="p-8 text-center border border-border rounded-lg bg-muted">
                {cleanupError && (
                  <p className="text-sm text-red-500">{cleanupError}</p>
                )}
              </div>
            )}
          </div>

          {/* Participants List */}
          {selectedCleanupData && !cleanupError && !isLoadingCleanup && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Participants ({participantRewards.length})
              </h3>
              {participantRewards.length === 0 ? (
                <div className="p-8 text-center border border-border rounded-lg bg-muted">
                  <p className="text-muted-foreground">
                    No participants to display
                  </p>
                </div>
              ) : (
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-muted sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                            Participant
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                            Amount (B3TR)
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {participantRewards.map((participant, index) => {
                          const userName =
                            addressToUserName.get(
                              participant.address.toLowerCase()
                            ) || participant.userName;
                          const isAutoLoaded =
                            !!selectedCleanup && participant.address;
                          return (
                            <tr
                              key={index}
                              className="border-t border-border hover:bg-muted/50"
                            >
                              <td className="px-4 py-3">
                                <div>
                                  {userName ? (
                                    <p className="text-sm font-semibold text-foreground">
                                      {userName}
                                    </p>
                                  ) : null}
                                  <p className="text-xs font-mono text-muted-foreground">
                                    {formatAddress(participant.address)}
                                  </p>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <Input
                                  type="number"
                                  step="0.0001"
                                  value={participant.amount}
                                  onChange={(e) =>
                                    handleParticipantChange(
                                      index,
                                      "amount",
                                      e.target.value
                                    )
                                  }
                                  className="w-32"
                                  placeholder="0.0"
                                />
                                {participant.approvedAmount && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Approved: {participant.approvedAmount} B3TR
                                  </p>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right">
                                {participantRewards.length > 1 && (
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() =>
                                      handleRemoveParticipant(index)
                                    }
                                  >
                                    Remove
                                  </Button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <Button
              variant="primary"
              onClick={() => setShowDistributeDialog(true)}
              disabled={isDistributing || !selectedCleanup}
            >
              {isDistributing ? "Distributing..." : "Distribute Rewards"}
            </Button>
          </div>
        </div>
      )}

      {activeTab === "streaks" && (
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Distribute Streak Rewards
            </h2>
            <p className="text-sm text-muted-foreground">
              Add approved streak submissions to your cart from the Streaks page
              or Streak detail page, then review and distribute rewards here.
            </p>
          </div>

          {/* Distribution Cart */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-foreground">
                Distribution Cart ({streakCart.length})
              </h3>
              {streakCart.length > 0 && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleClearStreakCart}
                >
                  Clear Cart
                </Button>
              )}
            </div>
            {streakCart.length === 0 ? (
              <div className="p-8 text-center border border-border rounded-lg bg-muted">
                <p className="text-muted-foreground">
                  Your cart is empty. Add streak submissions from the list
                  above.
                </p>
              </div>
            ) : (
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-muted sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                          Submission ID
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                          Amount (B3TR)
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {streakCart.map((item) => (
                        <tr
                          key={item.submissionId}
                          className="border-t border-border hover:bg-muted/50"
                        >
                          <td className="px-4 py-3 text-sm font-mono text-foreground">
                            {item.submissionId}
                          </td>
                          <td className="px-4 py-3">
                            <Input
                              type="number"
                              step="0.0001"
                              value={item.amount}
                              onChange={(e) =>
                                handleUpdateCartItemAmount(
                                  item.submissionId,
                                  e.target.value
                                )
                              }
                              className="w-32"
                              placeholder="0.0"
                            />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() =>
                                handleRemoveFromStreakCart(item.submissionId)
                              }
                            >
                              Remove
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              variant="primary"
              onClick={() => setShowStreaksDialog(true)}
              disabled={isDistributingStreaks || streakCart.length === 0}
            >
              {isDistributingStreaks
                ? "Distributing..."
                : `Distribute Rewards (${streakCart.length})`}
            </Button>
          </div>
        </div>
      )}

      <Dialog
        open={showSendDialog}
        onOpenChange={setShowSendDialog}
        title="Confirm Send Rewards"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Are you sure you want to send rewards to the following recipients?
          </p>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {recipients
              .filter((r) => r.address && r.amount)
              .map((recipient, index) => (
                <div
                  key={index}
                  className="p-2 bg-muted rounded border border-border"
                >
                  <p className="text-sm font-mono text-foreground">
                    {formatAddress(recipient.address)}
                  </p>
                  <p className="text-sm text-foreground">
                    {recipient.amount} B3TR - Type:{" "}
                    {recipient.rewardType === 0
                      ? "Referral"
                      : recipient.rewardType === 1
                      ? "Bonus"
                      : "Others"}
                  </p>
                </div>
              ))}
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="secondary"
              onClick={() => setShowSendDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSendRewards}>
              Confirm Send
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={showDistributeDialog}
        onOpenChange={setShowDistributeDialog}
        title="Confirm Distribute Rewards"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Are you sure you want to distribute rewards for cleanup ID{" "}
            {selectedCleanup ? selectedCleanup : ""}?
          </p>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {participantRewards
              .filter((p) => p.address && p.amount)
              .map((participant, index) => (
                <div
                  key={index}
                  className="p-2 bg-muted rounded border border-border"
                >
                  <p className="text-sm font-mono text-foreground">
                    {formatAddress(participant.address)}
                  </p>
                  <p className="text-sm text-foreground">
                    {participant.amount} B3TR
                  </p>
                </div>
              ))}
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="secondary"
              onClick={() => setShowDistributeDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleDistributeRewards}>
              Confirm Distribute
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={showStreaksDialog}
        onOpenChange={setShowStreaksDialog}
        title="Confirm Distribute Streak Rewards"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Are you sure you want to distribute rewards for the following streak
            submissions? Amounts must match the approved reward amounts.
          </p>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {streakCart
              .filter((r) => r.submissionId && r.amount)
              .map((item, index) => (
                <div
                  key={index}
                  className="p-2 bg-muted rounded border border-border"
                >
                  <p className="text-sm font-mono text-foreground">
                    Submission ID: {item.submissionId}
                  </p>
                  <p className="text-sm text-foreground">{item.amount} B3TR</p>
                </div>
              ))}
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="secondary"
              onClick={() => setShowStreaksDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleDistributeStreaksReward}>
              Confirm Distribute
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
