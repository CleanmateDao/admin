import { useState } from "react";
import Modal from "./Modal";

interface KycRejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  submissionId?: string;
  isLoading?: boolean;
}

export default function KycRejectModal({
  isOpen,
  onClose,
  onConfirm,
  submissionId: _submissionId,
  isLoading = false,
}: KycRejectModalProps) {
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim()) {
      onConfirm(reason.trim());
      setReason("");
    }
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Reject KYC Submission">
      <form onSubmit={handleSubmit}>
        <p className="mb-4 text-muted-foreground">
          Please provide a reason for rejecting this KYC submission.
        </p>
        <div className="form-group">
          <label htmlFor="rejection-reason" className="text-foreground">
            Rejection Reason:
          </label>
          <textarea
            id="rejection-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            rows={4}
            placeholder="Enter the reason for rejection..."
            disabled={isLoading}
            className="w-full px-3 py-3 rounded border text-base transition-colors focus:outline-none resize-y font-inherit"
            style={{
              borderColor: "hsl(var(--input))",
              backgroundColor: "hsl(var(--background))",
              color: "hsl(var(--foreground))",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "hsl(var(--ring))";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "hsl(var(--input))";
            }}
          />
        </div>
        <div className="flex gap-2 justify-end mt-6">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading || !reason.trim()}
          >
            {isLoading ? "Rejecting..." : "Reject Submission"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
