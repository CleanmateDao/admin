import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useUser } from "../hooks/useUsers";
import { useKycMutations } from "../hooks/useKyc";
import { useSetUserReferralCode } from "../hooks/useUserRegistry";
import { Button } from "../components/ui/Button";
import UpdateReferralCodeModal from "../components/UpdateReferralCodeModal";
import {
  formatAddress,
  formatDate,
  getKycStatusLabel,
  parseUserMetadata,
  getUserName,
  getUserLocation,
} from "../helpers/format";
import { formatEther } from "viem";
import { toast } from "sonner";

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: user, isLoading } = useUser(id || null);
  const { setOrganizerStatus, isSettingOrganizerStatus } = useKycMutations();
  const { setUserReferralCode, isPending: isUpdatingReferralCode } = useSetUserReferralCode();
  const [showUpdateReferralCodeModal, setShowUpdateReferralCodeModal] = useState(false);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center py-8 text-muted-foreground">
          User not found
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-4">
        <Button variant="secondary" onClick={() => navigate("/users")}>
          ← Back to Users
        </Button>
      </div>

      <div className="bg-card rounded-lg p-6 space-y-6 border border-border">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              User Details
            </h1>
            <p className="text-muted-foreground font-mono text-sm">{user.id}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={user.isOrganizer ? "danger" : "primary"}
              onClick={() => {
                setOrganizerStatus(
                  {
                    userAddress: user.id,
                    isOrganizer: !user.isOrganizer,
                  },
                  {
                    onSuccess: () => {
                      // Query will be invalidated automatically by the mutation hook
                    },
                  }
                );
              }}
              disabled={isSettingOrganizerStatus}
            >
              {user.isOrganizer ? "Remove Organizer" : "Set as Organizer"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-muted-foreground">Email</label>
            <p className="text-foreground">{user.email || "N/A"}</p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">
              Email Verified
            </label>
            <p
              className={
                user.emailVerified
                  ? "text-status-approved"
                  : "text-muted-foreground"
              }
            >
              {user.emailVerified ? "Yes" : "No"}
            </p>
            {user.emailVerifiedAt && (
              <p className="text-xs text-muted-foreground">
                {formatDate(user.emailVerifiedAt)}
              </p>
            )}
          </div>
          <div>
            <label className="text-sm text-muted-foreground">KYC Status</label>
            <p className="text-foreground">
              {getKycStatusLabel(user.kycStatus)}
            </p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Organizer</label>
            <p
              className={
                user.isOrganizer ? "text-primary" : "text-muted-foreground"
              }
            >
              {user.isOrganizer ? "Yes" : "No"}
            </p>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted-foreground">
                Referral Code
              </label>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowUpdateReferralCodeModal(true)}
                disabled={isUpdatingReferralCode}
              >
                Update
              </Button>
            </div>
            <p className="text-foreground">{user.referralCode || "N/A"}</p>
          </div>
          {user.referrer && (
            <div>
              <label className="text-sm text-muted-foreground">Referrer</label>
              <p className="text-foreground font-mono text-sm">
                {formatAddress(user.referrer)}
              </p>
            </div>
          )}
          <div>
            <label className="text-sm text-muted-foreground">
              Registered At
            </label>
            <p className="text-foreground">{formatDate(user.registeredAt)}</p>
          </div>
          {user.lastProfileUpdateAt && (
            <div>
              <label className="text-sm text-muted-foreground">
                Last Profile Update
              </label>
              <p className="text-foreground">
                {formatDate(user.lastProfileUpdateAt)}
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-border pt-4">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Rewards
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">
                Total Earned
              </label>
              <p className="text-foreground text-lg font-semibold">
                {user.totalRewardsEarned} B3TR
              </p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">
                Total Claimed
              </label>
              <p className="text-foreground text-lg font-semibold">
                {formatEther(BigInt(user.totalRewardsClaimed))} B3TR
              </p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Pending</label>
              <p className="text-status-approved text-lg font-semibold">
                {formatEther(BigInt(user.pendingRewards))} B3TR
              </p>
            </div>
          </div>
        </div>

        {user.metadata && (
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Profile Metadata
            </label>
            <div className="bg-muted rounded p-4 border border-border space-y-4">
              {(() => {
                const parsed = parseUserMetadata(user.metadata);
                if (!parsed) {
                  return (
                    <pre className="text-sm text-foreground whitespace-pre-wrap">
                      {user.metadata || "No metadata"}
                    </pre>
                  );
                }

                const location = getUserLocation(user.metadata);

                return (
                  <div className="space-y-3">
                    {parsed.name && (
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">
                          Name
                        </label>
                        <p className="text-sm text-foreground font-medium">
                          {parsed.name}
                        </p>
                      </div>
                    )}
                    {parsed.bio && (
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">
                          Bio
                        </label>
                        <p className="text-sm text-foreground">{parsed.bio}</p>
                      </div>
                    )}
                    {parsed.photo && (
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">
                          Profile Photo
                        </label>
                        <img
                          src={parsed.photo}
                          alt="Profile"
                          className="w-24 h-24 object-cover rounded-full border border-border"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/placeholder.svg";
                          }}
                        />
                      </div>
                    )}
                    {location && (
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">
                          Location
                        </label>
                        <p className="text-sm text-foreground">
                          {[location.city, location.state, location.country]
                            .filter(Boolean)
                            .join(", ") || "N/A"}
                        </p>
                      </div>
                    )}
                    {parsed.interests && parsed.interests.length > 0 && (
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">
                          Interests
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {parsed.interests.map((interest, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs bg-primary/20 text-primary rounded"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="pt-2 border-t border-border">
                      <label className="text-xs text-muted-foreground block mb-1">
                        Raw JSON
                      </label>
                      <pre className="text-xs text-muted-foreground whitespace-pre-wrap overflow-auto max-h-40">
                        {user.metadata}
                      </pre>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      <UpdateReferralCodeModal
        isOpen={showUpdateReferralCodeModal}
        onClose={() => setShowUpdateReferralCodeModal(false)}
        onConfirm={(referralCode) => {
          setUserReferralCode(
            {
              userAddress: user.id,
              referralCode,
            },
            {
              onSuccess: () => {
                setShowUpdateReferralCodeModal(false);
                toast.success("Referral code updated successfully");
              },
              onError: (error) => {
                const errorMessage = error instanceof Error ? error.message : String(error);
                toast.error(`Failed to update referral code: ${errorMessage || "Unknown error"}`);
              },
            }
          );
        }}
        currentReferralCode={user.referralCode}
        userAddress={user.id}
        isLoading={isUpdatingReferralCode}
      />
    </div>
  );
}
