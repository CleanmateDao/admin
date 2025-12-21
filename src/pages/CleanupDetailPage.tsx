import { useParams, useNavigate } from "react-router-dom";
import { useCleanup } from "../hooks/useCleanups";
import {
  useUpdateCleanupStatus,
  usePublishCleanup,
  useUnpublishCleanup,
} from "../hooks/useCleanupMutations";
import { Button } from "../components/ui/Button";
import { Select, SelectItem } from "../components/ui/Select";
import {
  formatAddress,
  formatDate,
  getCleanupStatusLabel,
  parseCleanupMetadata,
} from "../helpers/format";
import { useState } from "react";
import { formatEther } from "viem";

export default function CleanupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: cleanup, isLoading } = useCleanup(id || null);
  const { updateStatus, isPending: isUpdatingStatus } =
    useUpdateCleanupStatus();
  const { publish, isPending: isPublishing } = usePublishCleanup();
  const { unpublish, isPending: isUnpublishing } = useUnpublishCleanup();
  const [newStatus, setNewStatus] = useState("1");

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!cleanup) {
    return (
      <div className="p-6">
        <div className="text-center py-8 text-muted-foreground">
          Cleanup not found
        </div>
      </div>
    );
  }

  const handleUpdateStatus = () => {
    updateStatus({
      cleanupId: cleanup.id,
      status: Number(newStatus),
    });
  };

  const handlePublish = () => {
    publish({
      cleanupId: cleanup.id,
    });
  };

  const handleUnpublish = () => {
    unpublish({
      cleanupId: cleanup.id,
    });
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        <Button variant="secondary" onClick={() => navigate("/cleanups")}>
          ← Back to Cleanups
        </Button>
      </div>

      <div className="bg-card rounded-lg p-6 space-y-6 border border-border">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Cleanup Details
            </h1>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 rounded text-sm bg-primary/20 text-primary">
                {getCleanupStatusLabel(cleanup.status)}
              </span>
              <span
                className={
                  cleanup.published
                    ? "text-status-approved"
                    : "text-muted-foreground"
                }
              >
                {cleanup.published ? "Published" : "Unpublished"}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {!cleanup.published && (
              <Button
                variant="primary"
                onClick={handlePublish}
                disabled={isPublishing}
              >
                {isPublishing ? "Publishing..." : "Publish"}
              </Button>
            )}
            {cleanup.published && (
              <Button
                variant="secondary"
                onClick={handleUnpublish}
                disabled={isUnpublishing}
              >
                {isUnpublishing ? "Unpublishing..." : "Unpublish"}
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-muted-foreground">Cleanup ID</label>
            <p className="text-foreground font-mono text-sm">{cleanup.id}</p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Organizer</label>
            <p className="text-foreground font-mono text-sm">
              {cleanup.organizer}
            </p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Category</label>
            <p className="text-foreground">{cleanup.category || "N/A"}</p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Date</label>
            <p className="text-foreground">{formatDate(cleanup.date)}</p>
          </div>
          {cleanup.location && (
            <div className="col-span-2">
              <label className="text-sm text-muted-foreground">Location</label>
              <p className="text-foreground">{cleanup.location}</p>
              {cleanup.city && cleanup.country && (
                <p className="text-muted-foreground text-sm">
                  {cleanup.city}, {cleanup.country}
                </p>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-2 block">
            Metadata
          </label>
          <div className="bg-muted rounded p-4 border border-border space-y-4">
            {(() => {
              const parsed = parseCleanupMetadata(cleanup.metadata);
              if (!parsed) {
                return (
                  <pre className="text-sm text-foreground whitespace-pre-wrap">
                    {cleanup.metadata || "No metadata"}
                  </pre>
                );
              }

              return (
                <div className="space-y-3">
                  {parsed.title && (
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">
                        Title
                      </label>
                      <p className="text-sm text-foreground font-medium">
                        {parsed.title}
                      </p>
                    </div>
                  )}
                  {parsed.description && (
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">
                        Description
                      </label>
                      <div
                        className="text-sm text-foreground prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: parsed.description,
                        }}
                      />
                    </div>
                  )}
                  {parsed.category && (
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">
                        Category (from metadata)
                      </label>
                      <p className="text-sm text-foreground">
                        {parsed.category}
                      </p>
                    </div>
                  )}
                  {parsed.media && parsed.media.length > 0 && (
                    <div>
                      <label className="text-xs text-muted-foreground block mb-2">
                        Media from Metadata ({parsed.media.length})
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {parsed.media.map((item, index) => (
                          <div
                            key={index}
                            className="bg-background rounded p-2 border border-border"
                          >
                            {item.type === "video" ? (
                              <div className="w-full h-24 bg-secondary rounded flex items-center justify-center">
                                <span className="text-xs text-muted-foreground">
                                  Video
                                </span>
                              </div>
                            ) : (
                              <img
                                src={item.ipfsHash}
                                alt={item.name || "Media"}
                                className="w-full h-24 object-cover rounded"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "/placeholder.svg";
                                }}
                              />
                            )}
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                              {item.name || "Media"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="pt-2 border-t border-border">
                    <label className="text-xs text-muted-foreground block mb-1">
                      Raw JSON
                    </label>
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap overflow-auto max-h-40">
                      {cleanup.metadata}
                    </pre>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-sm text-muted-foreground mb-2">
              Update Status
            </label>
            <Select
              value={newStatus}
              onValueChange={setNewStatus}
              className="w-48"
            >
              <SelectItem value="0">Unpublished</SelectItem>
              <SelectItem value="1">Open</SelectItem>
              <SelectItem value="2">In Progress</SelectItem>
              <SelectItem value="3">Completed</SelectItem>
              <SelectItem value="4">Rewarded</SelectItem>
            </Select>
          </div>
          <Button
            variant="primary"
            onClick={handleUpdateStatus}
            disabled={isUpdatingStatus}
          >
            {isUpdatingStatus ? "Updating..." : "Update Status"}
          </Button>
        </div>

        {cleanup.medias.length > 0 && (
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Media
            </label>
            <div className="grid grid-cols-3 gap-4">
              {cleanup.medias.map((media) => {
                const isVideo = media.mimeType.startsWith("video/");
                return (
                  <div
                    key={media.id}
                    className="bg-muted rounded p-2 border border-border"
                  >
                    {isVideo ? (
                      <video
                        src={media.url}
                        className="w-full h-32 object-cover rounded"
                        controls
                        onError={(e) => {
                          (e.target as HTMLVideoElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <img
                        src={media.url}
                        alt="Cleanup media"
                        className="w-full h-32 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/placeholder.svg";
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {cleanup.proofOfWorkMedia.length > 0 && (
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Proof of Work Media
            </label>
            <div className="grid grid-cols-3 gap-4">
              {cleanup.proofOfWorkMedia.map((media) => {
                const isVideo = media.mimeType.startsWith("video/");
                return (
                  <div
                    key={media.id}
                    className="bg-muted rounded p-2 border border-border"
                  >
                    {isVideo ? (
                      <video
                        src={media.url}
                        className="w-full h-32 object-cover rounded"
                        controls
                        onError={(e) => {
                          (e.target as HTMLVideoElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <img
                        src={media.url}
                        alt="Proof of work"
                        className="w-full h-32 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/placeholder.svg";
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-foreground">
              Participants
            </h2>
            <span className="text-sm text-muted-foreground">
              {cleanup.participants.length} / {cleanup.maxParticipants || "∞"}
            </span>
          </div>
          <div className="space-y-2">
            {cleanup.participants.map((participant) => (
              <div
                key={participant.id}
                className="bg-muted rounded p-4 flex justify-between items-center border border-border"
              >
                <div>
                  <p className="text-foreground font-mono text-sm">
                    {formatAddress(participant.participant)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Status: {participant.status} | Applied:{" "}
                    {formatDate(participant.appliedAt)}
                  </p>
                  {participant.rewardEarned && (
                    <p className="text-sm text-status-approved">
                      Reward: {formatEther(BigInt(participant.rewardEarned))} B3TR
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
