"use client";

import type React from "react";
import { useState } from "react";
import { FaTimes, FaMusic, FaPlus } from "react-icons/fa";
import { Card } from "./ui/Card";
import { useAuth } from "../hooks/use-auth";
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
      <Card className="auth-card-modern flex flex-col w-full max-w-md rounded-[20px] p-6 relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors duration-200"
        >
          <FaTimes size={16} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#8a2be2] to-[#a855f7] rounded-full mb-3">
            <FaMusic size={18} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">Create New Playlist</h2>
          <p className="text-white/60 text-sm">Build your perfect music collection</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          <div className="space-y-3">
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="Playlist Name"
              maxLength={15}
              className="auth-input-modern w-full p-3 rounded-xl text-white placeholder-white/50 focus:outline-none"
            />
            <div className="flex justify-between items-center text-xs px-1">
              <span className="text-white/50">Choose a memorable name</span>
              <span className="text-white/60 font-mono">{name.length}/15</span>
            </div>
            
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Description (optional)"
              maxLength={50}
              className="auth-input-modern w-full p-3 rounded-xl text-white placeholder-white/50 focus:outline-none resize-none"
            />
            <div className="flex justify-between items-center text-xs px-1">
              <span className="text-white/50">Add some context</span>
              <span className="text-white/60 font-mono">{description.length}/50</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
              <p className="text-center text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2.5 px-4 rounded-xl font-medium transition-all duration-200 border border-white/20 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 auth-button-modern text-white py-2.5 px-4 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <FaPlus size={12} />
                  Create
                </>
              )}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
