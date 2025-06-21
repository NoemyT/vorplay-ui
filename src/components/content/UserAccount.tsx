"use client";

import { useState, useEffect } from "react";
import { FaStar, FaHeart, FaNotesMedical } from "react-icons/fa";
import { Card } from "../ui/Card";
import { useAuth, type User } from "../../context/authContext";

type UserAccountProps = {
  userId: string;
};

type ReviewSummary = {
  id: number;
  title: string;
  rating: number;
  coverUrl?: string;
};

type FavoriteSummary = {
  id: number;
  title: string;
  coverUrl?: string;
};

type PlaylistSummary = {
  id: number;
  name: string;
  playlistTracks: { track: { coverUrl?: string } }[];
};

export default function UserAccount({ userId }: UserAccountProps) {
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [reviews, setReviews] = useState<ReviewSummary[]>([]);
  const [favorites, setFavorites] = useState<FavoriteSummary[]>([]);
  const [playlists, setPlaylists] = useState<PlaylistSummary[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followId, setFollowId] = useState<number | null>(null); // ID of the follow relationship
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserData() {
      setLoading(true);
      setError(null);
      try {
        // Fetch user profile
        const userRes = await fetch(
          `${import.meta.env.VITE_API_URL}/users/${userId}`
        );
        if (!userRes.ok)
          throw new Error(`Failed to fetch user profile: ${userRes.status}`);
        const userData: User = await userRes.json();
        setProfile(userData);

        // Fetch user's reviews
        const reviewsRes = await fetch(
          `${import.meta.env.VITE_API_URL}/reviews/user/${userId}`
        );
        if (!reviewsRes.ok)
          throw new Error(`Failed to fetch user reviews: ${reviewsRes.status}`);
        const reviewsData: ReviewSummary[] = await reviewsRes.json();
        setReviews(reviewsData);

        // Fetch user's favorites
        const favoritesRes = await fetch(
          `${import.meta.env.VITE_API_URL}/favorites/user/${userId}`
        );
        if (!favoritesRes.ok)
          throw new Error(
            `Failed to fetch user favorites: ${favoritesRes.status}`
          );
        const favoritesData: FavoriteSummary[] = await favoritesRes.json();
        setFavorites(favoritesData);

        // Fetch user's playlists
        const playlistsRes = await fetch(
          `${import.meta.env.VITE_API_URL}/playlists/user/${userId}`
        ); // Assuming this endpoint exists or is public
        if (!playlistsRes.ok) {
          // If no public endpoint, handle gracefully
          console.warn(
            "Public playlist endpoint not found for user. Skipping."
          );
          setPlaylists([]);
        } else {
          const playlistsData: PlaylistSummary[] = await playlistsRes.json();
          setPlaylists(playlistsData);
        }

        // Check if current user is following this user
        if (currentUser) {
          const token = localStorage.getItem("token");
          const followsRes = await fetch(
            `${import.meta.env.VITE_API_URL}/follows`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (followsRes.ok) {
            const myFollows = await followsRes.json();
            const existingFollow = myFollows.find(
              (f: { targetId: number; targetType: string }) =>
                f.targetId === Number(userId) && f.targetType === "usuario"
            );
            if (existingFollow) {
              setIsFollowing(true);
              setFollowId(existingFollow.id);
            } else {
              setIsFollowing(false);
              setFollowId(null);
            }
          }
        }
      } catch (err) {
        setError((err as Error).message);
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchUserData();
    }
  }, [userId, currentUser]);

  const handleFollowToggle = async () => {
    if (!currentUser) {
      alert("You must be logged in to follow users.");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token missing.");

      if (isFollowing && followId) {
        // Unfollow
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/follows/${followId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Failed to unfollow.");
        setIsFollowing(false);
        setFollowId(null);
      } else {
        // Follow
        const res = await fetch(`${import.meta.env.VITE_API_URL}/follows`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            targetId: Number(userId),
            targetType: "usuario",
          }),
        });
        if (!res.ok) throw new Error("Failed to follow.");
        const newFollow = await res.json();
        setIsFollowing(true);
        setFollowId(newFollow.id);
      }
    } catch (err) {
      setError((err as Error).message);
      console.error("Follow/Unfollow error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-white">Loading user profile...</p>;
  if (error) return <p className="text-red-400">Error: {error}</p>;
  if (!profile) return <p className="text-white">User not found.</p>;

  return (
    <div className="flex flex-col w-full h-full items-center">
      <Card className="flex flex-col w-full max-w-[800px] bg-white/5 rounded-[20px] p-6">
        <div className="flex flex-col items-center gap-4 mb-6">
          <img
            src={
              profile.profilePicture || "/placeholder.svg?height=128&width=128"
            }
            alt={profile.name}
            className="w-32 h-32 rounded-full object-cover border-2 border-[#8a2be2]"
          />
          <h2 className="font-extrabold text-4xl text-white">{profile.name}</h2>
          <p className="text-white/70 text-lg">{profile.email}</p>

          {currentUser && currentUser.id !== profile.id && (
            <button
              onClick={handleFollowToggle}
              className={`px-6 py-2 rounded-full font-semibold transition ${
                isFollowing
                  ? "bg-red-600 text-white hover:bg-red-500"
                  : "bg-[#8a2be2] text-white hover:bg-[#7a1fd1]"
              }`}
              disabled={loading}
            >
              {loading ? "Processing..." : isFollowing ? "Unfollow" : "Follow"}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Reviews Summary */}
          <div className="flex flex-col items-center text-center bg-white/5 p-4 rounded-lg">
            <FaStar className="text-[#8a2be2] mb-2" size={32} />
            <h3 className="text-xl font-semibold text-white mb-2">
              Reviews ({reviews.length})
            </h3>
            {reviews.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 w-full">
                {reviews.slice(0, 4).map((review) => (
                  <img
                    key={review.id}
                    src={
                      review.coverUrl || "/placeholder.svg?height=64&width=64"
                    }
                    alt={review.title}
                    className="w-full h-auto aspect-square object-cover rounded-md"
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/70">No reviews yet.</p>
            )}
          </div>

          {/* Favorites Summary */}
          <div className="flex flex-col items-center text-center bg-white/5 p-4 rounded-lg">
            <FaHeart className="text-[#8a2be2] mb-2" size={32} />
            <h3 className="text-xl font-semibold text-white mb-2">
              Favorites ({favorites.length})
            </h3>
            {favorites.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 w-full">
                {favorites.slice(0, 4).map((fav) => (
                  <img
                    key={fav.id}
                    src={fav.coverUrl || "/placeholder.svg?height=64&width=64"}
                    alt={fav.title}
                    className="w-full h-auto aspect-square object-cover rounded-md"
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/70">No favorites yet.</p>
            )}
          </div>

          {/* Playlists Summary */}
          <div className="flex flex-col items-center text-center bg-white/5 p-4 rounded-lg">
            <FaNotesMedical className="text-[#8a2be2] mb-2" size={32} />
            <h3 className="text-xl font-semibold text-white mb-2">
              Playlists ({playlists.length})
            </h3>
            {playlists.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 w-full">
                {playlists.slice(0, 4).map((playlist) => (
                  <img
                    key={playlist.id}
                    src={
                      playlist.playlistTracks[0]?.track?.coverUrl ||
                      "/placeholder.svg?height=64&width=64"
                    }
                    alt={playlist.name}
                    className="w-full h-auto aspect-square object-cover rounded-md"
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/70">No public playlists.</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
