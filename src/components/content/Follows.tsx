"use client";

import { useEffect, useState } from "react";
import { TiGroup } from "react-icons/ti";
import { Card } from "../ui/Card";
import { useAuth } from "../../hooks/use-auth";
import { useNavigate, createSearchParams } from "react-router-dom";
import { fetchMyFollows, type Follow } from "../../lib/api";
import placeholder from "../../assets/placeholder.svg";

export default function Follows() {
  const [follows, setFollows] = useState<Follow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchFollowsData() {
      if (!user) {
        setError("You must be logged in to view follows.");
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

        const data = await fetchMyFollows(token);

        const processedFollows = data.map((f) => {
          let displayName = "";
          let displayPicture = placeholder;

          if (f.targetType === "usuario" && f.user) {
            displayName = f.user.name;
            displayPicture = f.user.profilePicture || placeholder;
          } else {
            displayName =
              f.targetName ||
              (f.targetType === "usuario"
                ? `User ${f.targetId}`
                : `Artist ${f.targetId}`);
            displayPicture = f.targetProfilePicture || placeholder;
          }

          return {
            ...f,
            targetName: displayName,
            targetProfilePicture: displayPicture,
          };
        });
        setFollows(processedFollows);
        setError(null);
      } catch (err) {
        setError(
          (err as Error).message ||
            "Failed to fetch follows. Please try again.",
        );
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchFollowsData();
  }, [user]);

  const handleCardClick = (follow: Follow) => {
    if (follow.targetType === "usuario") {
      navigate({
        pathname: "/",
        search: createSearchParams({
          section: "user",
          userId: follow.targetId.toString(),
        }).toString(),
      });
    }
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
              className={`bg-white/5 border border-white/10 p-4 rounded-xl text-white relative flex flex-col items-center text-center hover:bg-white/10 transition-colors ${
                follow.targetType === "usuario" ? "cursor-pointer" : ""
              }`}
              onClick={() => handleCardClick(follow)}
            >
              <img
                src={follow.targetProfilePicture || placeholder}
                alt={follow.targetName}
                className="w-24 h-24 rounded-full object-cover mb-3"
              />
              <h3 className="font-semibold text-base truncate w-full px-1">
                {follow.targetName}
              </h3>
              <p className="text-sm opacity-70 capitalize">
                {follow.targetType}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
