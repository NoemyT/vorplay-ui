"use client";

import { useState, useEffect } from "react";
import { FaTimes, FaPlus } from "react-icons/fa";
import { Card } from "./ui/Card";
import { useAuth } from "../hooks/use-auth";
import {
  fetchUserPlaylists,
  addTrackToPlaylist,
  type Playlist,
  type TrackSummaryDto,
} from "../lib/api";

type AddToPlaylistModalProps = {
  isOpen: boolean;
  onClose: () => void;
  track: TrackSummaryDto;
  onTrackAdded: () => void;
};

export default function AddToPlaylistModal({
  isOpen,
  onClose,
  track,
  onTrackAdded,
}: AddToPlaylistModalProps) {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingToPlaylist, setAddingToPlaylist] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      fetchPlaylists();
    }
  }, [isOpen, user]);

  const fetchPlaylists = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token missing. Please log in again.");
        return;
      }

      const userPlaylists = await fetchUserPlaylists(token);
      /* console.log(
        "AddToPlaylistModal: Raw API response for fetchUserPlaylists:",
        userPlaylists,
      ); */

      const normalizedPlaylists = userPlaylists.map((playlist) => {
        const normalized = {
          ...playlist,
          playlistTracks: playlist.playlistTracks || [],
        };
        /* console.log(
          `AddToPlaylistModal: Normalized Playlist "${playlist.name}" (ID: ${playlist.id}) has ${normalized.playlistTracks.length} tracks. Tracks data:`,
          normalized.playlistTracks,
        ); */
        return normalized;
      });

      const availablePlaylists = normalizedPlaylists.filter(
        (playlist) =>
          !playlist.playlistTracks.some(
            (pt) => pt.track.externalId === track.id,
          ),
      );

      setPlaylists(availablePlaylists);
    } catch (err) {
      setError((err as Error).message || "Failed to fetch playlists.");
      console.error("AddToPlaylistModal: Fetch playlists error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToPlaylist = async (playlistId: number) => {
    if (!user) {
      setError("You must be logged in to add tracks to playlists.");
      return;
    }

    setAddingToPlaylist(playlistId);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token missing. Please log in again.");
        return;
      }

      await addTrackToPlaylist(token, playlistId, {
        externalId: track.id,
        externalProvider: "Spotify",
      });

      onTrackAdded();
      onClose();
    } catch (err) {
      setError((err as Error).message || "Failed to add track to playlist.");
      console.error("AddToPlaylistModal: Add to playlist error:", err);
    } finally {
      setAddingToPlaylist(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Card className="bg-neutral-800 rounded-[20px] p-6 w-full max-w-md relative max-h-[80vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white"
        >
          <FaTimes size={20} />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-white text-center mb-2">
            Add to Playlist
          </h2>
          <div className="text-center">
            <p className="text-white font-semibold">{track.title}</p>
            <p className="text-white/70 text-sm">
              {track.artistNames.join(", ")}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-white py-8">
            <p>Loading your playlists...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-400 py-8">
            <p>{error}</p>
          </div>
        ) : playlists.length === 0 ? (
          <div className="text-center text-white/70 py-8">
            <p>No available playlists.</p>
            <p className="text-sm mt-2">
              This track is already in all your playlists or you don't have any
              playlists yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {playlists.map((playlist) => {
              return (
                <Card
                  key={playlist.id}
                  className="bg-white/5 border border-white/10 p-3 rounded-xl text-white flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => handleAddToPlaylist(playlist.id)}
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="font-semibold">{playlist.name}</h3>
                      {playlist.description && (
                        <p className="text-sm text-white/70 truncate">
                          {playlist.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {addingToPlaylist === playlist.id ? (
                      <div className="w-6 h-6 border-2 border-[#8a2be2] border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FaPlus className="text-[#8a2be2]" size={20} />
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
