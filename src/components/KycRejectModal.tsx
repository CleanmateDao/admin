import { useState } from 'react';
import Modal from './Modal';

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
  submissionId,
  isLoading = false,
}: KycRejectModalProps) {
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim()) {
      onConfirm(reason.trim());
      setReason('');
    }
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Reject KYC Submission">
      <form onSubmit={handleSubmit}>
        <p style={{ marginBottom: '1rem', color: 'rgba(255, 255, 255, 0.7)' }}>
          Please provide a reason for rejecting this KYC submission.
        </p>
        <div className="form-group">
          <label htmlFor="rejection-reason">Rejection Reason:</label>
          <textarea
            id="rejection-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            rows={4}
            placeholder="Enter the reason for rejection..."
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #3a3a3a',
              borderRadius: '4px',
              background: '#1a1a1a',
              color: 'rgba(255, 255, 255, 0.87)',
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
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
            {isLoading ? 'Rejecting...' : 'Reject Submission'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

