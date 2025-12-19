import Modal from "./Modal";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
  isLoading?: boolean;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  isLoading = false,
}: DeleteConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="small">
      <div>
        <p className="mb-4 text-muted-foreground">{message}</p>
        {itemName && (
          <div className="mb-4 p-3 bg-muted rounded border border-border">
            <strong className="text-foreground">{itemName}</strong>
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
            className="btn-primary bg-destructive hover:bg-destructive/90"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
