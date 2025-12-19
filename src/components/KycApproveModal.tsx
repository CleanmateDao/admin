import Modal from "./Modal";

interface KycApproveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  submissionId?: string;
  address?: string;
  isLoading?: boolean;
}

export default function KycApproveModal({
  isOpen,
  onClose,
  onConfirm,
  submissionId: _submissionId,
  address,
  isLoading = false,
}: KycApproveModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Approve KYC Submission">
      <div>
        <p className="mb-4 text-muted-foreground">
          Are you sure you want to approve this KYC submission?
        </p>
        {address && (
          <div className="mb-4 p-3 bg-muted rounded border border-border">
            <strong className="text-foreground">Address:</strong>{" "}
            <span className="font-mono text-foreground">{address}</span>
          </div>
        )}
        <div className="flex gap-2 justify-end mt-6">
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Approving..." : "Approve Submission"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
