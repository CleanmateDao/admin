import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUsers";
import { useKycMutations } from "../hooks/useKyc";
import { Button } from "../components/ui/Button";
import {
  formatAddress,
  formatDate,
  getKycStatusLabel,
} from "../helpers/format";

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: user, isLoading } = useUser(id || null);
  const { setOrganizerStatus, isSettingOrganizerStatus } = useKycMutations();

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
            <label className="text-sm text-muted-foreground">
              Referral Code
            </label>
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
                {user.totalRewardsClaimed} B3TR
              </p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Pending</label>
              <p className="text-status-approved text-lg font-semibold">
                {user.pendingRewards} B3TR
              </p>
            </div>
          </div>
        </div>

        {user.metadata && (
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Metadata
            </label>
            <div className="bg-muted rounded p-4 border border-border">
              <pre className="text-sm text-foreground whitespace-pre-wrap">
                {user.metadata}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
