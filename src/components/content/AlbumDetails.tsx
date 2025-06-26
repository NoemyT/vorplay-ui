"use client";

import { useEffect, useState } from "react";
import { FaCompactDisc, FaArrowLeft } from "react-icons/fa";
import { Card } from "../ui/Card";
import { useNavigate } from "react-router-dom";
import { fetchArtistAlbums } from "../../lib/api";
import { fetchTracksForAlbum, type TrackSummaryDto } from "../../lib/api";
import TrackDetailsModal from "../TrackDetailsModal"; // ADDED: Import TrackDetailsModal

type AlbumDetailsData = {
  id: string;
  title: string;
  imageUrl?: string;
  releaseDate: string;
  externalUrl: string;
};

type AlbumDetailsProps = {
  albumId: string;
  artistId: string;
};

export default function AlbumDetails({ albumId, artistId }: AlbumDetailsProps) {
  const navigate = useNavigate();
  const [album, setAlbum] = useState<AlbumDetailsData | null>(null);
  const [albumTracks, setAlbumTracks] = useState<TrackSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false); // ADDED: State for track details modal
  const [selectedTrack, setSelectedTrack] = useState<TrackSummaryDto | null>(
    null,
  ); // ADDED: State for selected track

  useEffect(() => {
    async function loadAlbumDetails() {
      setLoading(true);
      setError(null);
      console.log(
        `AlbumDetails: Loading details for albumId: ${albumId}, artistId: ${artistId}`,
      );
      try {
        const token = localStorage.getItem("token");

        console.log(
          `AlbumDetails: Fetching artist albums for artistId: ${artistId}`,
        );
        const artistAlbums = await fetchArtistAlbums(artistId);
        console.log("AlbumDetails: Fetched artist albums:", artistAlbums);

        const foundAlbum = artistAlbums.find((a) => a.id === albumId);
        console.log("AlbumDetails: Found album:", foundAlbum);

        if (!foundAlbum) {
          throw new Error("Album not found for this artist.");
        }
        setAlbum(foundAlbum);

        console.log(`AlbumDetails: Fetching tracks for albumId: ${albumId}`);
        const tracksData = await fetchTracksForAlbum(albumId, token || "");
        console.log("AlbumDetails: Fetched album tracks:", tracksData);
        setAlbumTracks(tracksData);
      } catch (err) {
        setError((err as Error).message || "Failed to load album details.");
        console.error("Error fetching album details:", err);
      } finally {
        setLoading(false);
      }
    }

    if (albumId && artistId) {
      loadAlbumDetails();
    } else {
      setError("Album ID or Artist ID not provided.");
      setLoading(false);
    }
  }, [albumId, artistId]);

  const handleGoBack = () => {
    navigate(-1);
  };

  // ADDED: Function to open track details modal
  const handleTrackClick = (track: TrackSummaryDto) => {
    console.log("Track clicked for details:", track);
    setSelectedTrack(track);
    setIsDetailsModalOpen(true);
  };

  // ADDED: Function to close track details modal
  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedTrack(null);
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${Number.parseInt(seconds) < 10 ? "0" : ""}${seconds}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-white text-center opacity-70 py-10">
        <FaCompactDisc size={48} className="mb-4 text-[#8a2be2]" />
        <p className="text-lg">Loading album details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-white text-center opacity-70">
        <FaCompactDisc size={48} className="mb-4 text-red-400" />
        <p className="text-lg">Oops! Something went wrong.</p>
        <p className="text-sm text-red-300">{error}</p>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-white text-center opacity-70 py-10">
        <FaCompactDisc size={48} className="mb-4 text-[#8a2be2]" />
        <p className="text-lg">Album not found.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col w-full h-full items-center">
        <Card className="flex flex-col w-full max-w-[800px] bg-white/5 rounded-[20px] p-6 relative">
          <button
            onClick={handleGoBack}
            className="absolute top-4 left-6 text-white/70 hover:text-white bg-transparent p-2 rounded-full"
            title="Go Back"
          >
            <FaArrowLeft size={20} />
          </button>

          <div className="flex flex-col items-center gap-4 mb-6">
            <img
              src={album.imageUrl || "/placeholder.svg?height=128&width=128"}
              alt={album.title}
              className="w-32 h-32 rounded-md object-cover border-2 border-[#8a2be2]"
            />
            <h2 className="font-extrabold text-4xl text-white text-center">
              {album.title}
            </h2>
            <p className="text-white/70 text-sm">
              Released: {new Date(album.releaseDate).toLocaleDateString()}
            </p>
          </div>

          <div className="w-full">
            <h3 className="text-xl font-bold text-white mb-4">Tracks</h3>
            {albumTracks.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {albumTracks.map((track) => (
                  <Card
                    key={track.id}
                    className="bg-white/5 border border-white/10 p-3 rounded-xl text-white flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => handleTrackClick(track)} // ADDED: onClick to open details modal
                  >
                    <div>
                      <h4 className="font-semibold text-base truncate">
                        {track.title}
                      </h4>
                      <p className="text-sm opacity-70 truncate">
                        {track.artistNames.join(", ")}
                      </p>
                    </div>
                    <span className="text-sm opacity-70 flex-shrink-0">
                      {formatDuration(track.durationMs)}
                    </span>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-white/70 text-center">
                No tracks found for this album.
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* ADDED: Track Details Modal */}
      {selectedTrack && (
        <TrackDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={closeDetailsModal}
          track={selectedTrack}
        />
      )}
    </>
  );
}
