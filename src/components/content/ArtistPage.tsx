"use client";

import { useState, useEffect } from "react";
import { FaArrowLeft, FaMusic, FaCompactDisc } from "react-icons/fa";
import { Card } from "../ui/Card";
import { useAuth } from "../../context/authContext";
import { useNavigate, createSearchParams } from "react-router-dom";
import {
  fetchArtistDetails,
  fetchArtistTopTracks,
  fetchArtistAlbums,
  fetchUserFollows,
  type Artist,
  type TrackSummaryDto,
  type AlbumSummaryDto,
} from "../../lib/api";

type ArtistPageProps = {
  artistId: string;
};

export default function ArtistPage({ artistId }: ArtistPageProps) {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [artist, setArtist] = useState<Artist | null>(null);
  const [topTracks, setTopTracks] = useState<TrackSummaryDto[]>([]);
  const [albums, setAlbums] = useState<AlbumSummaryDto[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followId, setFollowId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArtistData() {
      setLoading(true);
      setError(null);
      try {
        // Fetch artist details
        const artistData = await fetchArtistDetails(artistId);
        setArtist(artistData);

        // Fetch artist's top tracks
        const tracksData = await fetchArtistTopTracks(artistId);
        setTopTracks(tracksData);

        // Fetch artist's albums
        const albumsData = await fetchArtistAlbums(artistId);
        setAlbums(albumsData);

        // Check if current user is following this artist
        if (currentUser) {
          const token = localStorage.getItem("token");
          const myFollows = await fetchUserFollows(token!, currentUser.id); // Fetch current user's follows
          const existingFollow = myFollows.find(
            (f: { targetId: number; targetType: string }) =>
              f.targetId === Number(artistId) && f.targetType === "artista",
          );
          if (existingFollow) {
            setIsFollowing(true);
            setFollowId(existingFollow.id);
          } else {
            setIsFollowing(false);
            setFollowId(null);
          }
        }
      } catch (err) {
        setError((err as Error).message || "Failed to load artist data.");
        console.error("Error fetching artist data:", err);
      } finally {
        setLoading(false);
      }
    }

    if (artistId) {
      fetchArtistData();
    }
  }, [artistId, currentUser]);

  const handleFollowToggle = async () => {
    if (!currentUser) {
      alert("You must be logged in to follow users.");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token missing.");

      if (isFollowing && followId) {
        // Unfollow
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/follows/${followId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (!res.ok) throw new Error("Failed to unfollow.");
        setIsFollowing(false);
        setFollowId(null);
      } else {
        // Follow
        const res = await fetch(`${import.meta.env.VITE_API_URL}/follows`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            targetId: Number(artistId),
            targetType: "usuario",
          }),
        });
        if (!res.ok) throw new Error("Failed to follow.");
        const newFollow = await res.json();
        setIsFollowing(true);
        setFollowId(newFollow.id);
      }
    } catch (err) {
      setError((err as Error).message);
      console.error("Follow/Unfollow error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1); // Go back to the previous page (search results)
  };

  const handleAlbumClick = (albumId: string) => {
    navigate({
      pathname: "/",
      search: createSearchParams({
        section: "album", // Navigate to the new album details section
        artistId: artistId, // Pass artistId to AlbumDetails
        albumId: albumId, // Pass the album ID
      }).toString(),
    });
  };

  // ADDED: New handler for "View All Tracks" button
  const handleViewAllTracks = () => {
    navigate({
      pathname: "/",
      search: createSearchParams({
        section: "artist-tracks", // New section for all artist tracks
        artistId: artistId,
      }).toString(),
    });
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${Number.parseInt(seconds) < 10 ? "0" : ""}${seconds}`;
  };

  if (loading) return <p className="text-white">Loading artist profile...</p>;
  if (error) return <p className="text-red-400">Error: {error}</p>;
  if (!artist) return <p className="text-white">Artist not found.</p>;

  return (
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
            src={artist.imageUrl || "/placeholder.svg?height=128&width=128"}
            alt={artist.name}
            className="w-32 h-32 rounded-full object-cover border-2 border-[#8a2be2]"
          />
          <div className="flex items-center gap-2">
            <h2 className="font-extrabold text-4xl text-white">
              {artist.name}
            </h2>
            {currentUser && ( // Only show follow button if logged in
              <button
                onClick={handleFollowToggle}
                className={`px-4 py-1 rounded-full font-semibold text-sm transition ${
                  isFollowing
                    ? "bg-red-600 text-white hover:bg-red-500"
                    : "bg-[#8a2be2] text-white hover:bg-[#7a1fd1]"
                }`}
                disabled={loading}
              >
                {loading
                  ? "Processing..."
                  : isFollowing
                    ? "Unfollow"
                    : "Follow"}
              </button>
            )}
          </div>
        </div>

        {/* Top Tracks Section */}
        <div className="mb-8">
          <h3 className="flex items-center gap-2 text-xl font-bold text-white mb-4">
            <FaMusic className="text-[#8a2be2]" /> Top Tracks
          </h3>
          {topTracks.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {topTracks.slice(0, 5).map((track) => (
                <Card
                  key={track.id}
                  className="bg-white/5 border border-white/10 p-3 rounded-xl text-white flex items-center justify-between hover:bg-white/10 transition-colors"
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
              No top tracks found for this artist.
            </p>
          )}
          {topTracks.length > 0 && ( // Only show button if there are tracks
            <div className="flex justify-center mt-4">
              <button
                onClick={handleViewAllTracks}
                className="bg-[#8a2be2] text-white py-2 px-6 rounded-full font-semibold hover:bg-[#7a1fd1] transition"
              >
                View More Tracks
              </button>
            </div>
          )}
        </div>

        {/* Albums Section */}
        <div className="mb-8">
          <h3 className="flex items-center gap-2 text-xl font-bold text-white mb-4">
            <FaCompactDisc className="text-[#8a2be2]" /> Albums
          </h3>
          {albums.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {albums.map((album) => (
                <Card
                  key={album.id}
                  className="bg-white/5 border border-white/10 p-3 rounded-xl text-white flex flex-col items-center text-center cursor-pointer hover:bg-white/10 transition-colors"
                  onClick={() => handleAlbumClick(album.id)}
                >
                  <img
                    src={
                      album.imageUrl || "/placeholder.svg?height=96&width=96"
                    }
                    alt={album.title}
                    className="w-24 h-24 rounded-md object-cover mb-2"
                  />
                  <h4 className="font-semibold text-base truncate w-full px-1">
                    {album.title}
                  </h4>{" "}
                  {/* CORRECTED: Display album.name */}
                  <p className="text-xs opacity-70">
                    {album.releaseDate.split("-")[0]}
                  </p>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-white/70 text-center">
              No albums found for this artist.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
