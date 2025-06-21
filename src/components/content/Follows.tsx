"use client";

import { useEffect, useState } from "react";
import { TiGroup } from "react-icons/ti";
import { FaTrashAlt } from "react-icons/fa";
import { Card } from "../ui/Card";
import { useAuth } from "../../context/authContext";
import { useNavigate, createSearchParams } from "react-router-dom";

type Follow = {
  id: number;
  targetId: number;
  targetType: "usuario" | "artista";
  createdAt: string;
  // Assuming the API returns some info about the followed user/artist
  // For now, we'll just use a placeholder name
  targetName?: string; // This would ideally come from the API
  targetProfilePicture?: string; // This would ideally come from the API
};

export default function Follows() {
  const [follows, setFollows] = useState<Follow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchFollows() {
      if (!user) {
        setError("You must be logged in to view follows.");
        setLoading(false);
        return;
      }
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${import.meta.env.VITE_API_URL}/follows`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          // For demonstration, adding placeholder names and profile pictures
          const followsWithNames = data.map((f: Follow) => ({
            ...f,
            targetName:
              f.targetType === "usuario"
                ? `User ${f.targetId}`
                : `Artist ${f.targetId}`,
            targetProfilePicture: "/placeholder.svg?height=96&width=96",
          }));
          setFollows(followsWithNames);
        } else {
          setError("Failed to fetch follows. Please try again.");
        }
      } catch (err) {
        setError("An unexpected error occurred while fetching follows.");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchFollows();
  }, [user]);

  async function unfollow(id: number) {
    const confirmUnfollow = window.confirm(
      "Are you sure you want to unfollow this item?"
    );
    if (!confirmUnfollow) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/follows/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setFollows((prev) => prev.filter((f) => f.id !== id));
      } else {
        alert("Failed to unfollow. Please try again.");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("An unexpected error occurred while unfollowing.");
    }
  }

  const handleViewProfile = (targetId: number) => {
    navigate({
      pathname: "/",
      search: createSearchParams({
        section: "user",
        userId: targetId.toString(),
      }).toString(),
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-white text-center opacity-70">
        <TiGroup size={48} className="mb-4 text-[#8a2be2]" />
        <p className="text-lg">Loading who you're following...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-white text-center opacity-70">
        <TiGroup size={48} className="mb-4 text-red-400" />
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
        <TiGroup className="text-[#8a2be2]" size={28} />
        <span>Following</span>
      </div>

      {/* Follows list or empty state */}
      {follows.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-white text-center opacity-70">
          <TiGroup size={48} className="mb-4 text-[#8a2be2]" />
          <p className="text-lg">You are not following anyone yet.</p>
          <p className="text-sm">Find users or artists to follow!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-y-auto pr-2 max-h-[calc(100%-64px)]">
          {follows.map((follow) => (
            <Card
              key={follow.id}
              className="bg-white/5 border border-white/10 p-4 rounded-xl text-white relative flex flex-col items-center text-center hover:bg-white/10 transition-colors"
            >
              <button
                onClick={() => unfollow(follow.id)}
                className="absolute top-3 right-3 text-red-400 hover:text-red-300 bg-transparent p-1 rounded-full"
              >
                <FaTrashAlt size={16} />
              </button>
              <img
                src={
                  follow.targetProfilePicture ||
                  "/placeholder.svg?height=96&width=96"
                }
                alt={follow.targetName}
                className="w-24 h-24 rounded-full object-cover"
              />
              <h3 className="font-semibold text-base truncate w-full px-1">
                {follow.targetName}
              </h3>
              <p className="text-sm opacity-70 capitalize">
                {follow.targetType}
              </p>
              {follow.targetType === "usuario" && (
                <button
                  onClick={() => handleViewProfile(follow.targetId)}
                  className="mt-2 bg-[#8a2be2] text-white px-3 py-1 rounded-full text-xs hover:bg-[#7a1fd1]"
                >
                  View Profile
                </button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
