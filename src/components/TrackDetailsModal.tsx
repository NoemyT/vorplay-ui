"use client";
import { FaTimes } from "react-icons/fa";
import { Card } from "./ui/Card";

type TrackDetails = {
  id: string;
  title: string;
  artistNames: string[];
  albumName: string;
  imageUrl?: string;
  durationMs: number;
  popularity?: number;
  previewUrl?: string;
  href?: string;
};

type TrackDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  track: TrackDetails;
};

export default function TrackDetailsModal({
  isOpen,
  onClose,
  track,
}: TrackDetailsModalProps) {
  console.log("TrackDetailsModal received track:", track);

  if (!isOpen) return null;

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${Number.parseInt(seconds) < 10 ? "0" : ""}${seconds}`;
  };

  const spotifyEmbedUrl = track.href
    ? track.href.replace(
        "open.spotify.com/track/",
        "open.spotify.com/embed/track/",
      )
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Card className="bg-neutral-800 rounded-[20px] p-6 w-full max-w-md relative flex flex-col max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white"
        >
          <FaTimes size={20} />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-1">{track.title}</h2>
          <p className="text-base text-white/70 mb-2">
            {track.artistNames.join(", ")}
          </p>
          <p className="text-sm text-white/50 mb-4">
            {track.albumName} • {formatDuration(track.durationMs)}
          </p>

          {spotifyEmbedUrl && (
            <div className="w-full mt-4 rounded-md overflow-hidden">
              {" "}
              {/* ADDED: overflow-hidden */}
              <h3 className="text-white text-lg font-semibold mb-2">
                Listen Preview:
              </h3>
              <iframe
                src={spotifyEmbedUrl}
                width="100%"
                height="80"
                allow="encrypted-media"
                className="rounded-md"
                title="Track Preview"
              ></iframe>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
