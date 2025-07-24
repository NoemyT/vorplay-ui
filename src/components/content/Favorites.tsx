"use client";

import { useEffect, useState } from "react";
import { TiHeartFullOutline } from "react-icons/ti";
import { FaTrashAlt } from "react-icons/fa";
import { Card } from "../ui/Card";
import { useAuth } from "../../hooks/use-auth";
import {
  fetchUserFavorites,
  removeFavorite,
  type Favorite,
} from "../../lib/api";
import placeholder from "../../assets/placeholder.svg";
import { useNavigate } from "react-router-dom";

export default function Favorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const loadFavorites = async () => {
    if (!user) {
      setError("You must be logged in to view your favorites.");
      setLoading(false);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token missing. Please log in again.");
        setLoading(false);
        return;
      }
      const data = await fetchUserFavorites(token, user.id);
      setFavorites(data);
      setError(null);
    } catch (err) {
      setError(
        (err as Error).message ||
          "Failed to fetch favorites. Please try again.",
      );
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, [user]);

  async function handleDeleteFavorite(favoriteId: number) {
    console.log(`Attempting to delete favorite with primary ID: ${favoriteId}`);
    console.log("Current favorites state:", favorites);
    const favoriteToDelete = favorites.find((fav) => fav.id === favoriteId);
    console.log("Favorite object to delete:", favoriteToDelete);

    if (!favoriteToDelete) {
      alert("Favorite not found in local state.");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to remove this track from your favorites?",
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token missing.");

      await removeFavorite(token, favoriteToDelete.trackId);

      setFavorites((prev) => {
        const updated = prev.filter((fav) => fav.id !== favoriteId);
        return updated;
      });

      alert("Successfully removed from favorites!");
    } catch (err) {
      console.error("Error deleting favorite:", err);
      const errorMessage =
        (err as Error).message ||
        "An unexpected error occurred while removing the favorite.";

      if (errorMessage.includes("not found") || errorMessage.includes("404")) {
        setFavorites((prev) => {
          const updated = prev.filter((fav) => fav.id !== favoriteId);
          return updated;
        });
        alert("Item was already removed from favorites (locally).");
      } else {
        alert(errorMessage);
      }
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-white text-center opacity-70">
        <TiHeartFullOutline size={48} className="mb-4 text-[#8a2be2]" />
        <p className="text-lg">Loading your favorite tracks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-white text-center opacity-70">
        <TiHeartFullOutline size={48} className="mb-4 text-red-400" />
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
        <TiHeartFullOutline className="text-[#8a2be2]" size={28} />
        <span>Favorites</span>
      </div>

      {/* Favorites list or empty state */}
      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-white text-center opacity-70">
          <TiHeartFullOutline size={48} className="mb-4 text-[#8a2be2]" />
          <p className="text-lg">You haven't added any favorite tracks yet.</p>
          <p className="text-sm">
            Search for tracks and add them to your favorites!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 overflow-y-auto pr-2 max-h-[calc(100%-64px)]">
          {favorites.map((favorite) => {
            const artistName =
              typeof favorite.artist === "string"
                ? favorite.artist
                : favorite.artist?.name || "Unknown artist";
            const albumName =
              typeof favorite.album === "string"
                ? favorite.album
                : favorite.album?.name || "Unknown album";

            return (
              <Card
                key={favorite.id}
                className="bg-white/15 border border-white/10 p-4 rounded-xl text-white relative hover:bg-white/20 transition-colors cursor-pointer"
                onClick={() =>
                  navigate(`/?section=track&trackId=${favorite.externalId}`)
                }
              >
                {/* Trash icon */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFavorite(favorite.id);
                  }}
                  className="absolute top-3 right-3 text-red-400 hover:text-red-300 bg-transparent p-1 rounded-full"
                >
                  <FaTrashAlt size={16} />
                </button>

                {/* Top section: image + title */}
                <div className="flex gap-4 items-start">
                  <img
                    src={favorite.coverUrl || placeholder}
                    alt="cover"
                    className="w-16 h-16 rounded-md object-cover"
                  />
                  <div className="flex flex-col">
                    <h3 className="text-lg font-semibold">{favorite.title}</h3>
                    <p className="text-sm text-white/70">
                      {artistName} • {albumName}
                    </p>
                  </div>
                </div>

                {/* Date (optional) */}
                <p className="text-xs text-white/50 mt-2">
                  Added on {new Date(favorite.createdAt).toLocaleDateString()}
                </p>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
