"use client";

import { useEffect, useState } from "react";
import { TiHeartFullOutline } from "react-icons/ti";
import { FaTrashAlt } from "react-icons/fa";
import { Card } from "../ui/Card";
import { useAuth } from "../../context/authContext";
import {
  fetchUserFavorites,
  removeFavorite,
  type Favorite,
} from "../../lib/api";

export default function Favorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const refreshFavorites = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token missing.");

      console.log("Refreshing favorites from server...");
      const data = await fetchUserFavorites(token, user.id);
      console.log("Fresh favorites data from server:", data);
      setFavorites(data);
      setError(null);
      alert("Favorites refreshed!");
    } catch (err) {
      setError((err as Error).message || "Failed to refresh favorites.");
      console.error("Error refreshing favorites:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadFavorites() {
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
    }

    loadFavorites();
  }, [user]);

  async function handleDeleteFavorite(favoriteId: number) {
    console.log(`Attempting to delete favorite with ID: ${favoriteId}`);
    console.log("Current favorites state:", favorites);

    const confirmDelete = window.confirm(
      "Are you sure you want to remove this from your favorites?",
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token missing.");

      console.log(
        `Making DELETE request to: ${
          import.meta.env.VITE_API_URL
        }/favorites/${favoriteId}`,
      );
      await removeFavorite(token, favoriteId);

      console.log(
        `Successfully deleted favorite ${favoriteId}, updating state`,
      );
      setFavorites((prev) => {
        const updated = prev.filter((fav) => fav.id !== favoriteId);
        console.log("Updated favorites after deletion:", updated);
        return updated;
      });

      alert("Successfully removed from favorites!");
    } catch (err) {
      console.error("Error deleting favorite:", err);
      const errorMessage =
        (err as Error).message ||
        "An unexpected error occurred while removing the favorite.";

      // If the favorite doesn't exist on the server, remove it from local state anyway
      if (errorMessage.includes("not found") || errorMessage.includes("404")) {
        console.log("Favorite not found on server, removing from local state");
        setFavorites((prev) => {
          const updated = prev.filter((fav) => fav.id !== favoriteId);
          console.log("Updated favorites after local removal:", updated);
          return updated;
        });
        alert("Item was already removed from favorites.");
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
        <button
          onClick={refreshFavorites}
          className="ml-auto bg-[#8a2be2] text-white px-3 py-1 rounded-full text-sm hover:bg-[#7a1fd1] transition-colors"
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
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
          {favorites.map((favorite) => (
            <Card
              key={favorite.id}
              className="bg-white/5 border border-white/10 p-4 rounded-xl text-white relative"
            >
              {/* Trash icon */}
              <button
                onClick={() => handleDeleteFavorite(favorite.id)}
                className="absolute top-3 right-3 text-red-400 hover:text-red-300 bg-transparent p-1 rounded-full"
              >
                <FaTrashAlt size={16} />
              </button>

              {/* Top section: image + title */}
              <div className="flex gap-4 items-start">
                <img
                  src={
                    favorite.coverUrl || "/placeholder.svg?height=64&width=64"
                  }
                  alt="cover"
                  className="w-16 h-16 rounded-md object-cover"
                />
                <div className="flex flex-col">
                  <h3 className="text-lg font-semibold">{favorite.title}</h3>
                  <p className="text-sm text-white/70">
                    {favorite.artist?.name || "Unknown artist"} •{" "}
                    {favorite.album?.name || "Unknown album"}
                  </p>
                </div>
              </div>

              {/* Date (optional) */}
              <p className="text-xs text-white/50 mt-2">
                Added on {new Date(favorite.createdAt).toLocaleDateString()}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
