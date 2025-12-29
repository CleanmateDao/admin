import { useState } from "react";
import Modal from "./Modal";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";

interface UpdateReferralCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (referralCode: string) => void;
  currentReferralCode?: string | null;
  userAddress?: string;
  isLoading?: boolean;
}

export default function UpdateReferralCodeModal({
  isOpen,
  onClose,
  onConfirm,
  currentReferralCode,
  userAddress,
  isLoading = false,
}: UpdateReferralCodeModalProps) {
  const [referralCode, setReferralCode] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    const trimmedCode = referralCode.trim();
    
    if (!trimmedCode) {
      setError("Referral code cannot be empty");
      return;
    }

    // Basic validation - you can add more validation rules here
    if (trimmedCode.length < 2) {
      setError("Referral code must be at least 2 characters");
      return;
    }

    if (trimmedCode.length > 50) {
      setError("Referral code must be less than 50 characters");
      return;
    }

    setError("");
    onConfirm(trimmedCode);
  };

  const handleClose = () => {
    setReferralCode("");
    setError("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Update User Referral Code">
      <div>
        <p className="mb-4 text-muted-foreground">
          Update the referral code for this user. This will replace the existing referral code if one is set.
        </p>
        
        {userAddress && (
          <div className="mb-4 p-3 bg-muted rounded border border-border">
            <strong className="text-foreground">User Address:</strong>{" "}
            <span className="font-mono text-foreground text-sm">{userAddress}</span>
          </div>
        )}

        {currentReferralCode && (
          <div className="mb-4 p-3 bg-muted rounded border border-border">
            <strong className="text-foreground">Current Referral Code:</strong>{" "}
            <span className="text-foreground">{currentReferralCode}</span>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-2">
            New Referral Code
          </label>
          <Input
            type="text"
            value={referralCode}
            onChange={(e) => {
              setReferralCode(e.target.value);
              setError("");
            }}
            placeholder="Enter referral code"
            disabled={isLoading}
            className={error ? "border-destructive" : ""}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isLoading) {
                handleConfirm();
              }
            }}
          />
          {error && (
            <p className="mt-1 text-sm text-destructive">{error}</p>
          )}
        </div>

        <div className="flex gap-2 justify-end mt-6">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={isLoading || !referralCode.trim()}
          >
            {isLoading ? "Updating..." : "Update Referral Code"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

