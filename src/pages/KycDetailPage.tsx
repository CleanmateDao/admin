import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useKycSubmissionDetails, useKycMutations } from "../hooks/useKyc";
import { Button } from "../components/ui/Button";
import KycApproveModal from "../components/KycApproveModal";
import KycRejectModal from "../components/KycRejectModal";
import { formatAddress } from "../helpers/format";

export default function KycDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: submission, isLoading } = useKycSubmissionDetails(id || null);
  const { updateStatus, isUpdating } = useKycMutations();
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

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
          KYC submission not found
        </div>
      </div>
    );
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "status-badge pending";
      case "VERIFIED":
        return "status-badge verified";
      case "REJECTED":
        return "status-badge rejected";
      default:
        return "status-badge";
    }
  };

  const handleApprove = () => {
    updateStatus(
      {
        submissionId: submission.id,
        status: "VERIFIED",
      },
      {
        onSuccess: () => {
          setShowApproveModal(false);
        },
      }
    );
  };

  const handleReject = (reason: string) => {
    updateStatus(
      {
        submissionId: submission.id,
        status: "REJECTED",
        rejectionReason: reason,
      },
      {
        onSuccess: () => {
          setShowRejectModal(false);
        },
      }
    );
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        <Button variant="secondary" onClick={() => navigate("/kyc")}>
          ← Back to KYC Submissions
        </Button>
      </div>

      <div className="bg-card rounded-lg p-6 space-y-6 border border-border">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              KYC Submission Details
            </h1>
            <div className="flex items-center gap-4">
              <span className={getStatusBadgeClass(submission.status)}>
                {submission.status}
              </span>
            </div>
          </div>
          {submission.status === "PENDING" && (
            <div className="flex gap-2">
              <Button
                variant="primary"
                onClick={() => setShowApproveModal(true)}
                disabled={isUpdating}
              >
                Approve
              </Button>
              <Button
                variant="danger"
                onClick={() => setShowRejectModal(true)}
                disabled={isUpdating}
              >
                Reject
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-muted-foreground">Submission ID</label>
            <p className="text-foreground font-mono text-sm">{submission.id}</p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Address</label>
            <p className="text-foreground font-mono text-sm">
              {formatAddress(submission.address)}
            </p>
            <p className="text-foreground font-mono text-xs mt-1 break-all">
              {submission.address}
            </p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Status</label>
            <p className="text-foreground">{submission.status}</p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Submitted At</label>
            <p className="text-foreground">
              {submission.submittedAt
                ? new Date(submission.submittedAt).toLocaleString()
                : "N/A"}
            </p>
          </div>
          {submission.reviewedAt && (
            <div>
              <label className="text-sm text-muted-foreground">Reviewed At</label>
              <p className="text-foreground">
                {new Date(submission.reviewedAt).toLocaleString()}
              </p>
            </div>
          )}
          {submission.reviewedBy && (
            <div>
              <label className="text-sm text-muted-foreground">Reviewed By</label>
              <p className="text-foreground">{submission.reviewedBy}</p>
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
            Full Submission Data
          </label>
          <div className="bg-muted rounded p-4 border border-border">
            <pre className="text-sm text-foreground whitespace-pre-wrap overflow-auto">
              {JSON.stringify(submission, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      <KycApproveModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleApprove}
        submissionId={submission.id}
        address={submission.address}
        isLoading={isUpdating}
      />

      <KycRejectModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleReject}
        submissionId={submission.id}
        isLoading={isUpdating}
      />
    </div>
  );
}

