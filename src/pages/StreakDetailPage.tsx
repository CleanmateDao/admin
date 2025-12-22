import { useParams, useNavigate } from "react-router-dom";
import { useStreakSubmission } from "../hooks/useStreakSubmissions";
import {
  useApproveStreaks,
  useRejectStreaks,
} from "../hooks/useStreakMutations";
import { Button } from "../components/ui/Button";
import { Dialog } from "../components/ui/Dialog";
import { Input } from "../components/ui/Input";
import { formatDate, getStatusLabel, getStatusColor } from "../helpers/format";
import { useState } from "react";
import { parseEther, formatEther } from "viem";
import { parseStreakSubmissionMetadata } from "@cleanmate/cip-sdk";
import { useStreakCart } from "../contexts/StreakCartContext";

export default function StreakDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: submission, isLoading } = useStreakSubmission(id || null);
  const { approve, isPending: isApproving } = useApproveStreaks();
  const { reject, isPending: isRejecting } = useRejectStreaks();
  const { addToCart, isInCart } = useStreakCart();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"approve" | "reject">("approve");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  // Parse metadata
  const parsedMetadata = submission
    ? parseStreakSubmissionMetadata(submission.metadata)
    : null;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="p-6">
        <div className="text-center py-8 text-muted-foreground">
          Submission not found
        </div>
      </div>
    );
  }

  const handleApprove = () => {
    if (!amount) return;

    const submissionId = BigInt(submission.submissionId);
    const amountWei = parseEther(amount);

    approve({
      submissionIds: [submissionId],
      amounts: [amountWei],
    });

    setDialogOpen(false);
    setAmount("");
  };

  const handleReject = () => {
    if (!reason) return;

    const submissionId = BigInt(submission.submissionId);

    reject({
      submissionIds: [submissionId],
      reasons: [reason],
    });

    setDialogOpen(false);
    setReason("");
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        <Button variant="secondary" onClick={() => navigate("/streaks")}>
          ← Back to Submissions
        </Button>
      </div>

      <div className="bg-card rounded-lg p-6 space-y-6 border border-border">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Submission #{submission.submissionId}
            </h1>
            <div className="flex items-center gap-4">
              <span className={getStatusColor(submission.status)}>
                {getStatusLabel(submission.status)}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {submission.status === 0 && (
              <>
                <Button
                  variant="primary"
                  onClick={() => {
                    setDialogType("approve");
                    setDialogOpen(true);
                  }}
                >
                  Approve
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    setDialogType("reject");
                    setDialogOpen(true);
                  }}
                >
                  Reject
                </Button>
              </>
            )}
            {submission.status === 1 && (
              <Button
                variant="primary"
                onClick={() => addToCart(submission)}
                disabled={isInCart(submission.submissionId)}
              >
                {isInCart(submission.submissionId)
                  ? "Already in Cart"
                  : "Add to Cart"}
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-muted-foreground">
              User Address
            </label>
            <p className="text-foreground">{submission.user}</p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">
              Submitted At
            </label>
            <p className="text-foreground">
              {formatDate(submission.submittedAt)}
            </p>
          </div>
          {submission.reviewedAt && (
            <div>
              <label className="text-sm text-muted-foreground">
                Reviewed At
              </label>
              <p className="text-foreground">
                {formatDate(submission.reviewedAt)}
              </p>
            </div>
          )}
          {submission.rewardAmount && (
            <div>
              <label className="text-sm text-muted-foreground">
                Reward Amount
              </label>
              <p className="text-foreground">
                {formatEther(BigInt(submission.rewardAmount))} B3TR
              </p>
            </div>
          )}
          {submission.rejectionReason && (
            <div className="col-span-2">
              <label className="text-sm text-muted-foreground">
                Rejection Reason
              </label>
              <p className="text-foreground">{submission.rejectionReason}</p>
            </div>
          )}
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-2 block">
            Metadata
          </label>
          {parsedMetadata ? (
            <div className="bg-muted rounded p-4 border border-border space-y-3">
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                  Description
                </span>
                <p className="text-sm text-foreground mt-1">
                  {parsedMetadata.description}
                </p>
              </div>
              {parsedMetadata.timestamp && (
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    Timestamp
                  </span>
                  <p className="text-sm text-foreground mt-1">
                    {new Date(parsedMetadata.timestamp).toLocaleString()}
                  </p>
                </div>
              )}
              {parsedMetadata.mediaCount !== undefined && (
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    Media Count
                  </span>
                  <p className="text-sm text-foreground mt-1">
                    {parsedMetadata.mediaCount}
                  </p>
                </div>
              )}
              {parsedMetadata.totalMediaLength && (
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    Total Media Length
                  </span>
                  <p className="text-sm text-foreground mt-1">
                    {parsedMetadata.totalMediaLength}s
                  </p>
                </div>
              )}
              {parsedMetadata.totalSize && (
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    Total Size
                  </span>
                  <p className="text-sm text-foreground mt-1">
                    {(parsedMetadata.totalSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
              {parsedMetadata.deviceType && (
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    Device Type
                  </span>
                  <p className="text-sm text-foreground mt-1">
                    {parsedMetadata.deviceType}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-muted rounded p-4 border border-border">
              <pre className="text-sm text-foreground whitespace-pre-wrap">
                {submission.metadata}
              </pre>
              <p className="text-xs text-muted-foreground mt-2">
                Could not parse metadata as valid CIP format
              </p>
            </div>
          )}
        </div>

        {submission.media.length > 0 && (
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Media
            </label>
            <div className="grid grid-cols-3 gap-4">
              {submission.media.map((media, idx) => {
                const isVideo = media.mimeType.startsWith("video/");
                return (
                  <div
                    key={media.id}
                    className="bg-muted rounded p-2 border border-border"
                  >
                    {isVideo ? (
                      <video
                        src={media.ipfsHash}
                        className="w-full h-32 object-cover rounded"
                        controls
                        onError={(e) => {
                          (e.target as HTMLVideoElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <img
                        src={media.ipfsHash}
                        alt={`Media ${idx + 1}`}
                        className="w-full h-32 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/placeholder.svg";
                        }}
                      />
                    )}
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {media.mimeType}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <label className="text-sm text-muted-foreground mb-2 block">
            Transaction Hash
          </label>
          <p className="text-foreground font-mono text-sm">
            {submission.transactionHash}
          </p>
        </div>
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={
          dialogType === "approve" ? "Approve Submission" : "Reject Submission"
        }
        size="md"
      >
        {dialogType === "approve" ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Amount (B3TR)
              </label>
              <Input
                type="number"
                step="0.0001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleApprove}
                disabled={!amount || isApproving}
              >
                {isApproving ? "Approving..." : "Approve"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Rejection Reason
              </label>
              <textarea
                className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-ring resize-y"
                style={{
                  backgroundColor: "hsl(var(--background))",
                  color: "hsl(var(--foreground))",
                  borderColor: "hsl(var(--input))",
                }}
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter rejection reason..."
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleReject}
                disabled={!reason || isRejecting}
              >
                {isRejecting ? "Rejecting..." : "Reject"}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
