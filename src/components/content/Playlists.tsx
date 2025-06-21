"use client";

import { useEffect, useState } from "react";
import { TiNotes } from "react-icons/ti";
import { FaPlus, FaTrashAlt } from "react-icons/fa";
import { Card } from "../ui/Card";
import { useAuth } from "../../context/authContext";

type Playlist = {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  playlistTracks: { track: { coverUrl?: string } }[];
};

export default function Playlists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchPlaylists() {
      if (!user) {
        setError("You must be logged in to view playlists.");
        setLoading(false);
        return;
      }
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${import.meta.env.VITE_API_URL}/playlists`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setPlaylists(data);
        } else {
          setError("Failed to fetch playlists. Please try again.");
        }
      } catch (err) {
        setError("An unexpected error occurred while fetching playlists.");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPlaylists();
  }, [user]);

  async function deletePlaylist(id: number) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this playlist?"
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/playlists/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        setPlaylists((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert("Failed to delete playlist. Please try again.");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("An unexpected error occurred while deleting the playlist.");
    }
  }

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
    <div className="flex flex-col w-full h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 text-2xl font-bold text-white">
        <TiNotes className="text-[#8a2be2]" size={28} />
        <span>Playlists</span>
        <button className="ml-auto bg-[#8a2be2] text-white px-3 py-1 rounded-full text-sm flex items-center gap-1 hover:bg-[#7a1fd1]">
          <FaPlus size={12} /> New Playlist
        </button>
      </div>

      {/* Playlists list or empty state */}
      {playlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-white text-center opacity-70">
          <TiNotes size={48} className="mb-4 text-[#8a2be2]" />
          <p className="text-lg">You haven’t created any playlists yet.</p>
          <p className="text-sm">Click "New Playlist" to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-y-auto pr-2 max-h-[calc(100%-64px)]">
          {playlists.map((playlist) => (
            <Card
              key={playlist.id}
              className="bg-white/5 border border-white/10 p-4 rounded-xl text-white relative flex flex-col items-center text-center hover:bg-white/10 transition-colors"
            >
              <button
                onClick={() => deletePlaylist(playlist.id)}
                className="absolute top-3 right-3 text-red-400 hover:text-red-300 bg-transparent p-1 rounded-full"
              >
                <FaTrashAlt size={16} />
              </button>
              <img
                src={
                  playlist.playlistTracks[0]?.track?.coverUrl ||
                  "/placeholder.svg?height=128&width=128"
                }
                alt={playlist.name}
                className="w-32 h-32 rounded-md object-cover mb-3"
              />
              <h3 className="text-lg font-semibold truncate w-full px-1">
                {playlist.name}
              </h3>
              {playlist.description && (
                <p className="text-sm opacity-80 truncate w-full px-1">
                  {playlist.description}
                </p>
              )}
              <p className="text-xs text-white/50 mt-1">
                Created on {new Date(playlist.createdAt).toLocaleDateString()}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
