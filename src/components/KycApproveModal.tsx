import Modal from './Modal';

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
  submissionId,
  address,
  isLoading = false,
}: KycApproveModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Approve KYC Submission">
      <div>
        <p style={{ marginBottom: '1rem', color: 'rgba(255, 255, 255, 0.7)' }}>
          Are you sure you want to approve this KYC submission?
        </p>
        {address && (
          <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#1a1a1a', borderRadius: '4px' }}>
            <strong>Address:</strong>{' '}
            <span style={{ fontFamily: 'monospace' }}>{address}</span>
          </div>
        )}
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
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
            {isLoading ? 'Approving...' : 'Approve Submission'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

