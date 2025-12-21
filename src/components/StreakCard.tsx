import { useNavigate } from "react-router-dom";
import { Button } from "./ui/Button";
import { getStatusLabel, getStatusColor, formatDate } from "../helpers/format";
import type { StreakSubmission } from "../types";
import { useStreakCart } from "../contexts/StreakCartContext";
import { formatEther } from "viem";

interface StreakCardProps {
  streak: StreakSubmission;
}

export function StreakCard({ streak }: StreakCardProps) {
  const navigate = useNavigate();
  const { addToCart, isInCart } = useStreakCart();
  const inCart = isInCart(streak.submissionId);

  // Get the first video URL for thumbnail, or first image
  const thumbnailUrl = streak.media.find((m) =>
    m.mimeType.startsWith("video/")
  )?.ipfsHash || streak.media[0]?.ipfsHash;

  const isVideo = streak.media.some((m) => m.mimeType.startsWith("video/"));

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow">
      {/* Thumbnail */}
      <div
        className="relative aspect-video bg-muted cursor-pointer"
        onClick={() => navigate(`/streaks/${streak.id}`)}
      >
        {thumbnailUrl ? (
          isVideo ? (
            <video
              src={thumbnailUrl}
              className="absolute inset-0 w-full h-full object-cover"
              preload="metadata"
              muted
              playsInline
              onLoadedMetadata={(e) => {
                const video = e.currentTarget;
                video.currentTime = 0.1;
              }}
            />
          ) : (
            <img
              src={thumbnailUrl}
              alt="Streak thumbnail"
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          )
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            No Media
          </div>
        )}
        {/* Status badge */}
        <div className="absolute top-2 right-2">
          <span
            className={`px-2 py-1 text-xs font-medium rounded ${
              streak.status === 1
                ? "bg-green-500/20 text-green-600 dark:text-green-400"
                : streak.status === 2
                ? "bg-red-500/20 text-red-600 dark:text-red-400"
                : "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
            }`}
          >
            {getStatusLabel(streak.status)}
          </span>
        </div>
      </div>

      {/* Card content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-foreground">
            Submission #{streak.submissionId}
          </h3>
          <p className="text-sm text-muted-foreground">
            {formatDate(streak.submittedAt)}
          </p>
        </div>

        {streak.rewardAmount && (
          <div>
            <p className="text-sm font-medium text-foreground">
              Reward: {formatEther(BigInt(streak.rewardAmount))} B3TR
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/streaks/${streak.id}`)}
            className="flex-1"
          >
            View Details
          </Button>
          {streak.status === 1 && (
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                addToCart(streak);
              }}
              disabled={inCart}
              className="flex-1"
            >
              {inCart ? "In Cart" : "Add to Cart"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

