import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useKycSubmissionDetails, useKycMutations } from "../hooks/useKyc";
import { Button } from "../components/ui/Button";
import KycApproveModal from "../components/KycApproveModal";
import KycRejectModal from "../components/KycRejectModal";

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
    switch (status.toLowerCase()) {
      case "pending":
        return "status-badge pending";
      case "approved":
        return "status-badge verified";
      case "rejected":
        return "status-badge rejected";
      default:
        return "status-badge";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Pending';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  const handleApprove = () => {
    updateStatus(
      {
        submissionId: submission.id || submission.submissionId,
        status: "approved",
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
        submissionId: submission.id || submission.submissionId,
        status: "rejected",
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
                {getStatusLabel(submission.status)}
              </span>
            </div>
          </div>
          {submission.status === "pending" && (
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

        <div className="space-y-6">
          {/* Submission Information */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Submission Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Submission ID</label>
                <p className="text-foreground font-mono text-sm">{submission.id || submission.submissionId}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">User ID</label>
                <p className="text-foreground font-mono text-sm">{submission.userId}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Wallet Address</label>
                <p className="text-foreground font-mono text-sm break-all">
                  {submission.walletAddress || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Status</label>
                <p className="text-foreground">{getStatusLabel(submission.status)}</p>
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
            </div>
            {submission.rejectionReason && (
              <div className="mt-4">
                <label className="text-sm text-muted-foreground">
                  Rejection Reason
                </label>
                <p className="text-foreground mt-1 p-3 bg-destructive/10 border border-destructive/20 rounded">
                  {submission.rejectionReason}
                </p>
              </div>
            )}
          </div>

          {/* Personal Information */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Personal Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">First Name</label>
                <p className="text-foreground">{submission.firstName}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Last Name</label>
                <p className="text-foreground">{submission.lastName}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Email</label>
                <p className="text-foreground">{submission.email}</p>
              </div>
              {submission.phoneNumber && (
                <div>
                  <label className="text-sm text-muted-foreground">Phone Number</label>
                  <p className="text-foreground">{submission.phoneNumber}</p>
                </div>
              )}
              {submission.dateOfBirth && (
                <div>
                  <label className="text-sm text-muted-foreground">Date of Birth</label>
                  <p className="text-foreground">
                    {new Date(submission.dateOfBirth).toLocaleDateString()}
                  </p>
                </div>
              )}
              {submission.nationality && (
                <div>
                  <label className="text-sm text-muted-foreground">Nationality</label>
                  <p className="text-foreground">{submission.nationality}</p>
                </div>
              )}
            </div>
          </div>

          {/* Document Information */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Document Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Document Type</label>
                <p className="text-foreground">
                  {submission.documentType?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || "N/A"}
                </p>
              </div>
              {submission.documentNumber && (
                <div>
                  <label className="text-sm text-muted-foreground">Document Number</label>
                  <p className="text-foreground font-mono text-sm">{submission.documentNumber}</p>
                </div>
              )}
            </div>
          </div>

          {/* Address Information */}
          {submission.address && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Address</h2>
              <div className="grid grid-cols-2 gap-4">
                {submission.address.street && (
                  <div>
                    <label className="text-sm text-muted-foreground">Street</label>
                    <p className="text-foreground">{submission.address.street}</p>
                  </div>
                )}
                {submission.address.city && (
                  <div>
                    <label className="text-sm text-muted-foreground">City</label>
                    <p className="text-foreground">{submission.address.city}</p>
                  </div>
                )}
                {submission.address.state && (
                  <div>
                    <label className="text-sm text-muted-foreground">State</label>
                    <p className="text-foreground">{submission.address.state}</p>
                  </div>
                )}
                {submission.address.country && (
                  <div>
                    <label className="text-sm text-muted-foreground">Country</label>
                    <p className="text-foreground">{submission.address.country}</p>
                  </div>
                )}
                {submission.address.zipCode && (
                  <div>
                    <label className="text-sm text-muted-foreground">Zip Code</label>
                    <p className="text-foreground">{submission.address.zipCode}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Media Files */}
          {submission.mediaUrls && submission.mediaUrls.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Document Files</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {submission.mediaUrls.map((url, index) => (
                  <div key={index} className="border border-border rounded p-3">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline break-all text-sm"
                    >
                      Document {index + 1}
                    </a>
                    {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
                      <div className="mt-2">
                        <img
                          src={url}
                          alt={`Document ${index + 1}`}
                          className="max-w-full h-auto rounded border border-border"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      <KycApproveModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleApprove}
        submissionId={submission.id || submission.submissionId}
        address={submission.walletAddress}
        isLoading={isUpdating}
      />

      <KycRejectModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleReject}
        submissionId={submission.id || submission.submissionId}
        isLoading={isUpdating}
      />
    </div>
  );
}

