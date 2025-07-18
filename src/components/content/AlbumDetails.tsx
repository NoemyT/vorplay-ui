"use client";

import { useEffect, useState } from "react";
import { FaCompactDisc, FaArrowLeft } from "react-icons/fa";
import { Card } from "../ui/Card";
import { useNavigate, createSearchParams } from "react-router-dom";
import { fetchArtistAlbums, fetchArtistDetails } from "../../lib/api";
import {
  fetchTracksForAlbum,
  type AlbumTrackItemDto,
  type AlbumSummaryDto,
  type Artist,
} from "../../lib/api";

type AlbumDetailsProps = {
  albumId: string;
  artistId: string;
};

export default function AlbumDetails({ albumId, artistId }: AlbumDetailsProps) {
  const navigate = useNavigate();
  const [album, setAlbum] = useState<AlbumSummaryDto | null>(null);
  const [artist, setArtist] = useState<Artist | null>(null);
  const [albumTracks, setAlbumTracks] = useState<AlbumTrackItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAlbumDetails() {
      setLoading(true);
      setError(null);
      /* console.log(
        `AlbumDetails: Starting load for albumId: ${albumId}, artistId: ${artistId}`,
      ); */
      try {
        const token = localStorage.getItem("token");

        /* console.log(
          `AlbumDetails: Fetching artist details for artistId: ${artistId}`,
        ); */
        const artistData = await fetchArtistDetails(artistId);
        setArtist(artistData);
        // console.log("AlbumDetails: Fetched artist details:", artistData);

        /* console.log(
          `AlbumDetails: Fetching artist albums for artistId: ${artistId}`,
        ); */
        const artistAlbums = await fetchArtistAlbums(artistId);
        // console.log("AlbumDetails: Fetched artist albums:", artistAlbums);

        const foundAlbum = artistAlbums.find((a) => a.id === albumId);
        // console.log("AlbumDetails: Found album:", foundAlbum);

        if (!foundAlbum) {
          throw new Error("Album not found for this artist.");
        }
        setAlbum(foundAlbum);

        // console.log(`AlbumDetails: Fetching tracks for albumId: ${albumId}`);
        const tracksData = await fetchTracksForAlbum(albumId, token || "");
        // console.log("AlbumDetails: Fetched album tracks:", tracksData);
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
    navigate({
      pathname: "/",
      search: createSearchParams({
        section: "track",
        trackId: trackItem.id,
      }).toString(),
    });
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
    </>
  );
}
