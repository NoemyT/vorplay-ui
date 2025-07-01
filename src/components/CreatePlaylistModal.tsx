"use client";

import type React from "react";
import { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { Card } from "./ui/Card";
import { useAuth } from "../context/authContext";
import { createPlaylist, type CreatePlaylistPayload } from "../lib/api";

type CreatePlaylistModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onPlaylistCreated: () => void;
};

export default function CreatePlaylistModal({
  isOpen,
  onClose,
  onPlaylistCreated,
}: CreatePlaylistModalProps) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!user) {
      setError("You must be logged in to create a playlist.");
      setLoading(false);
      return;
    }

    if (!name.trim()) {
      setError("Playlist name is required.");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication token missing. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const payload: CreatePlaylistPayload = {
        name: name.trim(),
        description: description.trim() || undefined,
      };

      await createPlaylist(token, payload);
      onPlaylistCreated();
      onClose();
      setName("");
      setDescription("");
    } catch (err) {
      setError((err as Error).message || "Failed to create playlist.");
      console.error("Create playlist error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <Card className="bg-neutral-800 rounded-[20px] p-6 w-full max-w-md relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white"
        >
          <FaTimes size={20} />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white text-center">
            Create New Playlist
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="name"
              className="block text-white text-sm font-medium mb-2"
            >
              Playlist Name *
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="My Awesome Playlist"
              maxLength={50}
              className="w-full p-3 rounded-md bg-white/80 text-black placeholder-gray-500 focus:outline-none"
            />
            <p className="text-right text-xs text-white/70 mt-1">
              {name.length}/50
            </p>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-white text-sm font-medium mb-2"
            >
              Description (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe your playlist..."
              maxLength={50}
              className="w-full p-3 rounded-md bg-white/80 text-black placeholder-gray-500 focus:outline-none resize-none"
            />
            <p className="text-right text-xs text-white/70 mt-1">
              {description.length}/50
            </p>
          </div>

          {error && <p className="text-red-400 text-center">{error}</p>}

          <div className="flex gap-3 justify-center mt-4">
            <button
              type="button"
              onClick={handleClose}
              className="bg-neutral-700 text-white py-2.5 px-8 rounded-full font-semibold hover:bg-neutral-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#8a2be2] text-white py-2.5 px-8 rounded-full font-semibold hover:bg-[#7a1fd1] transition"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Playlist"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
