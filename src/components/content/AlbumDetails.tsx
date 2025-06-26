"use client";

import { useEffect, useState } from "react";
import { FaCompactDisc, FaArrowLeft } from "react-icons/fa";
import { Card } from "../ui/Card";
import { useNavigate } from "react-router-dom";
import { fetchArtistAlbums, fetchArtistDetails } from "../../lib/api"; // ADDED: fetchArtistDetails
import {
  fetchTracksForAlbum,
  type AlbumTrackItemDto,
  type TrackSummaryDto,
  type Artist,
} from "../../lib/api"; // MODIFIED: Import AlbumTrackItemDto and Artist
import TrackDetailsModal from "../TrackDetailsModal";

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
  const [artist, setArtist] = useState<Artist | null>(null); // ADDED: State for artist details
  const [albumTracks, setAlbumTracks] = useState<AlbumTrackItemDto[]>([]); // MODIFIED: Use AlbumTrackItemDto
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<TrackSummaryDto | null>(
    null,
  ); // Keep TrackSummaryDto for modal

  useEffect(() => {
    async function loadAlbumDetails() {
      setLoading(true);
      setError(null);
      console.log(
        `AlbumDetails: Starting load for albumId: ${albumId}, artistId: ${artistId}`,
      );
      try {
        const token = localStorage.getItem("token");

        // Fetch artist details to get artist name
        console.log(
          `AlbumDetails: Fetching artist details for artistId: ${artistId}`,
        );
        const artistData = await fetchArtistDetails(artistId);
        setArtist(artistData);
        console.log("AlbumDetails: Fetched artist details:", artistData);

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

  const handleTrackClick = (trackItem: AlbumTrackItemDto) => {
    console.log("Album track clicked for details:", trackItem);
    if (!album || !artist) {
      console.error(
        "Album or Artist data not available for track details modal.",
      );
      return;
    }

    // Construct TrackSummaryDto for the modal
    const fullTrackDetails: TrackSummaryDto = {
      id: trackItem.id,
      title: trackItem.title,
      artistNames: [artist.name], // Use the album's artist name
      albumName: album.title,
      imageUrl: album.imageUrl, // Use the album's image
      durationMs: trackItem.durationMs,
      popularity: undefined, // Not available from this endpoint
      previewUrl: undefined, // Not available from this endpoint
      href: undefined, // Not available from this endpoint
    };
    console.log("Constructed TrackSummaryDto for modal:", fullTrackDetails);
    setSelectedTrack(fullTrackDetails);
    setIsDetailsModalOpen(true);
  };

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

  if (!album || !artist) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-white text-center opacity-70 py-10">
        <FaCompactDisc size={48} className="mb-4 text-[#8a2be2]" />
        <p className="text-lg">Album or Artist not found.</p>
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
              {artist.name} • Released:{" "}
              {new Date(album.releaseDate).toLocaleDateString()}
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
                    onClick={() => handleTrackClick(track)}
                  >
                    <div>
                      <h4 className="font-semibold text-base truncate">
                        {track.title}
                      </h4>
                      {/* MODIFIED: Display artist name from fetched artist and album name */}
                      <p className="text-sm opacity-70 truncate">
                        {artist.name} • {album.title}
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
