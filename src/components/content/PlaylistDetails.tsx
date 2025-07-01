"use client";

import { useEffect, useState } from "react";
import { FaArrowLeft, FaTrashAlt, FaPencilAlt, FaPlay } from "react-icons/fa";
import { Card } from "../ui/Card";
import { useAuth } from "../../context/authContext";
import { useNavigate } from "react-router-dom";
import {
  fetchPlaylistDetails,
  updatePlaylist,
  removeTrackFromPlaylist,
  type Playlist,
  type UpdatePlaylistPayload,
} from "../../lib/api";
import placeholder from "../../assets/placeholder.svg";

type PlaylistDetailsProps = {
  playlistId: string;
};

export default function PlaylistDetails({ playlistId }: PlaylistDetailsProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (playlistId && user) {
      loadPlaylistDetails();
    }
  }, [playlistId, user]);

  const loadPlaylistDetails = async () => {
    if (!user || !playlistId) return;

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token missing. Please log in again.");
        return;
      }

      const playlistData = await fetchPlaylistDetails(
        token,
        Number(playlistId),
      );
      // Ensure playlistTracks is always an array
      const normalizedPlaylist = {
        ...playlistData,
        playlistTracks: playlistData.playlistTracks || [],
      };
      setPlaylist(normalizedPlaylist);
      setEditName(normalizedPlaylist.name);
      setEditDescription(normalizedPlaylist.description || "");
    } catch (err) {
      setError((err as Error).message || "Failed to load playlist details.");
      console.error("Error fetching playlist details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlaylist = async () => {
    if (!playlist || !user) return;

    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token missing. Please log in again.");
        return;
      }

      const payload: UpdatePlaylistPayload = {};
      if (editName.trim() !== playlist.name) {
        payload.name = editName.trim();
      }
      if (editDescription.trim() !== (playlist.description || "")) {
        payload.description = editDescription.trim() || undefined;
      }

      if (Object.keys(payload).length > 0) {
        const updatedPlaylist = await updatePlaylist(
          token,
          playlist.id,
          payload,
        );
        // Keep the existing tracks when updating
        const normalizedUpdated = {
          ...updatedPlaylist,
          playlistTracks: playlist.playlistTracks, // Keep existing tracks
        };
        setPlaylist(normalizedUpdated);
      }

      setIsEditing(false);
    } catch (err) {
      setError((err as Error).message || "Failed to update playlist.");
      console.error("Update playlist error:", err);
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveTrack = async (trackId: number) => {
    if (!playlist || !user) return;

    if (
      !window.confirm(
        "Are you sure you want to remove this track from the playlist?",
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token missing. Please log in again.");
        return;
      }

      await removeTrackFromPlaylist(token, playlist.id, trackId);

      // Update local state
      setPlaylist((prev) =>
        prev
          ? {
              ...prev,
              playlistTracks: (prev.playlistTracks || []).filter(
                (pt) => pt.trackId !== trackId,
              ),
            }
          : null,
      );
    } catch (err) {
      setError(
        (err as Error).message || "Failed to remove track from playlist.",
      );
      console.error("Remove track error:", err);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const getPlaylistCoverUrl = (playlist: Playlist) => {
    if (playlist.playlistTracks && playlist.playlistTracks.length > 0) {
      return playlist.playlistTracks[0]?.track?.coverUrl || placeholder;
    }
    return placeholder;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-white text-center opacity-70 py-10">
        <FaPlay size={48} className="mb-4 text-[#8a2be2]" />
        <p className="text-lg">Loading playlist details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-white text-center opacity-70">
        <FaPlay size={48} className="mb-4 text-red-400" />
        <p className="text-lg">Oops! Something went wrong.</p>
        <p className="text-sm text-red-300">{error}</p>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-white text-center opacity-70 py-10">
        <FaPlay size={48} className="mb-4 text-[#8a2be2]" />
        <p className="text-lg">Playlist not found.</p>
      </div>
    );
  }

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
            src={getPlaylistCoverUrl(playlist) || placeholder}
            alt={playlist.name}
            className="w-32 h-32 rounded-md object-cover border-2 border-[#8a2be2]"
          />

          {isEditing ? (
            <div className="flex flex-col gap-3 w-full max-w-md">
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                maxLength={50}
                className="text-center text-2xl font-bold bg-white/10 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8a2be2]"
                placeholder="Playlist name"
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                maxLength={50}
                rows={2}
                className="text-center bg-white/10 text-white/70 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8a2be2] resize-none"
                placeholder="Playlist description (optional)"
              />
              <div className="flex gap-2 justify-center">
                <button
                  onClick={handleUpdatePlaylist}
                  disabled={updating}
                  className="bg-[#8a2be2] text-white px-4 py-2 rounded-full text-sm hover:bg-[#7a1fd1] transition"
                >
                  {updating ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditName(playlist.name);
                    setEditDescription(playlist.description || "");
                  }}
                  className="bg-neutral-700 text-white px-4 py-2 rounded-full text-sm hover:bg-neutral-600 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-4xl text-white text-center">
                  {playlist.name}
                </h2>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-white/70 hover:text-[#8a2be2] transition-colors bg-transparent p-1"
                >
                  <FaPencilAlt size={16} />
                </button>
              </div>
              {playlist.description && (
                <p className="text-white/70 text-center">
                  {playlist.description}
                </p>
              )}
              <p className="text-white/50 text-sm">
                {playlist.playlistTracks ? playlist.playlistTracks.length : 0}{" "}
                tracks • Created{" "}
                {new Date(playlist.createdAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        <div className="w-full">
          <h3 className="text-xl font-bold text-white mb-4">Tracks</h3>
          {playlist.playlistTracks && playlist.playlistTracks.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {playlist.playlistTracks
                .sort((a, b) => a.position - b.position)
                .map((playlistTrack) => (
                  <Card
                    key={`${playlistTrack.playlistId}-${playlistTrack.trackId}`}
                    className="bg-white/5 border border-white/10 p-3 rounded-xl text-white flex items-center justify-between hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={playlistTrack.track.coverUrl || placeholder}
                        alt={playlistTrack.track.title}
                        className="w-12 h-12 rounded-md object-cover"
                      />
                      <div>
                        <h4 className="font-semibold text-base">
                          {playlistTrack.track.title}
                        </h4>
                        <p className="text-sm opacity-70">
                          {playlistTrack.track.artist} •{" "}
                          {playlistTrack.track.album}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRemoveTrack(playlistTrack.trackId)}
                        className="text-red-400 hover:text-red-300 p-2 rounded-full transition-colors"
                        title="Remove from playlist"
                      >
                        <FaTrashAlt size={16} />
                      </button>
                    </div>
                  </Card>
                ))}
            </div>
          ) : (
            <div className="text-center text-white/70 py-8">
              <FaPlay size={48} className="mx-auto mb-4 text-[#8a2be2]" />
              <p className="text-lg">This playlist is empty.</p>
              <p className="text-sm">
                Start adding tracks to build your collection!
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
