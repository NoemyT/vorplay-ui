"use client";

import { useEffect, useState } from "react";
import { FaPlus, FaTrashAlt } from "react-icons/fa";
import { TiNotes } from "react-icons/ti";
import { Card } from "../ui/Card";
import { useAuth } from "../../hooks/use-auth";
import { useNavigate, createSearchParams } from "react-router-dom";
import CreatePlaylistModal from "../CreatePlaylistModal";
import { fetchUserPlaylists, type Playlist } from "../../lib/api";

type PlaylistWithColor = Playlist & { displayColorClass: string };

const getRandomColorClass = () => {
  const colors = [
    "text-red-400",
    "text-green-400",
    "text-yellow-400",
    "text-purple-400",
    "text-pink-400",
    "text-teal-400",
    "text-blue-400",
    "text-orange-400",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export default function Playlists() {
  const [playlistsWithColors, setPlaylistsWithColors] = useState<
    PlaylistWithColor[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deletingPlaylistId, setDeletingPlaylistId] = useState<number | null>(
    null
  );
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadPlaylists();
    } else {
      setError("You must be logged in to view playlists.");
      setLoading(false);
    }
  }, [user]);

  const loadPlaylists = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token missing. Please log in again.");
        return;
      }

      const data = await fetchUserPlaylists(token);
      const normalizedData: PlaylistWithColor[] = data.map((playlist) => ({
        ...playlist,
        playlistTracks: playlist.playlistTracks || [],
        displayColorClass: getRandomColorClass(),
      }));
      setPlaylistsWithColors(normalizedData);
    } catch (err) {
      setError(
        (err as Error).message || "Failed to fetch playlists. Please try again."
      );
      console.error("Playlists.tsx: Error fetching playlists:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlaylist = async (id: number) => {
    const playlist = playlistsWithColors.find((p) => p.id === id);
    if (!playlist) {
      alert("Playlist not found in local state.");
      return;
    }

    const confirmMessage =
      "Are you sure you want to delete this playlist? This action cannot be undone.";

    const confirmDelete = window.confirm(confirmMessage);
    if (!confirmDelete) return;

    setDeletingPlaylistId(id);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication token missing. Please log in again.");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/playlists/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "Playlists.tsx: Delete playlist (final step) error response:",
          errorText
        );

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = {
            message: `HTTP ${response.status}: ${response.statusText}`,
          };
        }
        throw new Error(errorData.message || "Failed to delete playlist.");
      }

      setPlaylistsWithColors((prev) => prev.filter((p) => p.id !== id));
      alert("Playlist deleted successfully!");
    } catch (err) {
      console.error(
        "Playlists.tsx: Error during playlist deletion process:",
        err
      );
      alert(
        (err as Error).message || "Failed to delete playlist. Please try again."
      );
    } finally {
      setDeletingPlaylistId(null);
    }
  };

  const handlePlaylistClick = (playlistId: number) => {
    navigate({
      pathname: "/",
      search: createSearchParams({
        section: "playlist",
        playlistId: playlistId.toString(),
      }).toString(),
    });
  };

  const handlePlaylistCreated = () => {
    loadPlaylists();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-white text-center opacity-70">
        <TiNotes size={48} className="mb-4 text-[#8a2be2]" />
        <p className="text-lg">Loading your playlists...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-white text-center opacity-70">
        <TiNotes size={48} className="mb-4 text-red-400" />
        <p className="text-lg">Oops! Something went wrong.</p>
        <p className="text-sm text-red-300">{error}</p>
        <p className="text-sm mt-2">
          Please try refreshing the page or logging in again.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col w-full h-full">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4 text-2xl font-bold text-white">
          <TiNotes className="text-[#8a2be2]" size={28} />
          <span>Playlists</span>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="ml-auto bg-[#8a2be2] text-white px-3 py-1 rounded-full text-sm flex items-center gap-1 hover:bg-[#7a1fd1]"
          >
            <FaPlus size={12} /> New Playlist
          </button>
        </div>

        {/* Playlists list or empty state */}
        {playlistsWithColors.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-white text-center opacity-70">
            <TiNotes size={48} className="mb-4 text-[#8a2be2]" />
            <p className="text-lg">You haven't created any playlists yet.</p>
            <p className="text-sm">Click "New Playlist" to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto pr-2 max-h-[calc(100%-64px)]">
            {playlistsWithColors.map((playlist) => {
              return (
                <Card
                  key={playlist.id}
                  className="bg-slate-800/60 border border-white/10 p-4 rounded-xl text-white relative flex flex-col items-center text-center hover:bg-slate-600/40 transition-colors cursor-pointer"
                  onClick={() => handlePlaylistClick(playlist.id)}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePlaylist(playlist.id);
                    }}
                    disabled={deletingPlaylistId === playlist.id}
                    className="absolute top-3 right-3 text-red-400 hover:text-red-300 bg-transparent p-1 rounded-full disabled:opacity-50"
                  >
                    {deletingPlaylistId === playlist.id ? (
                      <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FaTrashAlt size={16} />
                    )}
                  </button>
                  <div className="w-32 h-32 rounded-md bg-neutral-700 flex items-center justify-center mb-3">
                    <TiNotes size={64} className={playlist.displayColorClass} />{" "}
                  </div>
                  <h3 className="text-lg font-semibold truncate w-full px-1">
                    {playlist.name}
                  </h3>
                  {playlist.description && (
                    <p className="text-sm opacity-80 truncate w-full px-1">
                      {playlist.description}
                    </p>
                  )}
                  <p className="pt-2 text-xs text-white/50">
                    Created on{" "}
                    {new Date(playlist.createdAt).toLocaleDateString()}
                  </p>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <CreatePlaylistModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPlaylistCreated={handlePlaylistCreated}
      />
    </>
  );
}
