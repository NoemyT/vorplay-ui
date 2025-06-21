import { Card } from "../../ui/Card";
import { FaMusic } from "react-icons/fa";

type TrackSummaryDto = {
  id: string;
  title: string;
  artistNames: string[];
  albumName: string;
  imageUrl?: string;
  durationMs: number;
};

type TracksProps = {
  tracks: TrackSummaryDto[];
  query: string;
};

export default function Tracks({ tracks, query }: TracksProps) {
  if (!tracks.length) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-white text-center opacity-70 py-10">
        <FaMusic size={48} className="mb-4 text-[#8a2be2]" />
        <p className="text-lg">No tracks found for "{query}".</p>
      </div>
    );
  }

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${Number.parseInt(seconds) < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      {tracks.map((track) => (
        <Card
          key={track.id}
          className="bg-white/5 border border-white/10 p-4 rounded-xl text-white flex items-center gap-4 hover:bg-white/10 transition-colors"
        >
          <img
            src={track.imageUrl || "/placeholder.svg?height=64&width=64"}
            alt={track.albumName}
            className="w-16 h-16 rounded-md object-cover flex-shrink-0"
          />
          <div className="flex-grow">
            <h3 className="text-lg font-semibold truncate">{track.title}</h3>
            <p className="text-sm opacity-80 truncate">
              {track.artistNames.join(", ")} • {track.albumName}
            </p>
          </div>
          <span className="text-sm opacity-70 flex-shrink-0">
            {formatDuration(track.durationMs)}
          </span>
        </Card>
      ))}
    </div>
  );
}
