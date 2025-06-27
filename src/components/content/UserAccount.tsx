"use client";

import { useState, useEffect } from "react";
import { FaStar, FaHeart, FaUsers, FaArrowLeft } from "react-icons/fa";
import { Card } from "../ui/Card";
import { useAuth, type User } from "../../context/authContext";
import { useNavigate } from "react-router-dom";
import {
  fetchUserFollows,
  type Follow,
  type Review,
  type Favorite,
} from "../../lib/api";

export default function UserAccount({ userId }: { userId: string }) {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [following, setFollowing] = useState<Follow[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followId, setFollowId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserData() {
      setLoading(true);
      setError(null);
      try {
        const userRes = await fetch(
          `${import.meta.env.VITE_API_URL}/users/${userId}`,
        );
        if (!userRes.ok)
          throw new Error(`Failed to fetch user profile: ${userRes.status}`);
        const userData: User = await userRes.json();
        setProfile(userData);

        const reviewsRes = await fetch(
          `${import.meta.env.VITE_API_URL}/reviews/user/${userId}`,
        );
        if (!reviewsRes.ok)
          throw new Error(`Failed to fetch user reviews: ${reviewsRes.status}`);
        const reviewsData: Review[] = await reviewsRes.json();
        setReviews(reviewsData);

        const favoritesRes = await fetch(
          `${import.meta.env.VITE_API_URL}/favorites/user/${userId}`,
        );
        if (!favoritesRes.ok)
          throw new Error(
            `Failed to fetch user favorites: ${favoritesRes.status}`,
          );
        const favoritesData: Favorite[] = await favoritesRes.json();
        setFavorites(favoritesData);

        const fetchedFollowing = await fetchUserFollows(
          localStorage.getItem("token") || "",
          Number(userId),
        );
        setFollowing(fetchedFollowing);

        if (currentUser) {
          const token = localStorage.getItem("token");
          const myFollows = await fetchUserFollows(token!, currentUser.id);
          const existingFollow = myFollows.find(
            (f: { targetId: number; targetType: string }) =>
              f.targetId === Number(userId) && f.targetType === "usuario",
          );
          if (existingFollow) {
            setIsFollowing(true);
            setFollowId(existingFollow.id);
          } else {
            setIsFollowing(false);
            setFollowId(null);
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
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/follows/${followId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (!res.ok) throw new Error("Failed to unfollow.");
        setIsFollowing(false);
        setFollowId(null);
      } else {
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

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) return <p className="text-white">Loading user profile...</p>;
  if (error) return <p className="text-red-400">Error: {error}</p>;
  if (!profile) return <p className="text-white">User not found.</p>;

  return (
    <div className="flex flex-col w-full h-full items-center">
      <Card className="flex flex-col w-full max-w-[800px] mt-5 bg-white/5 rounded-[20px] p-6 relative">
        {" "}
        <button
          onClick={handleGoBack}
          className="absolute top-4 left-6 text-white/70 hover:text-white bg-transparent p-2 rounded-full"
          title="Go Back"
        >
          <FaArrowLeft size={20} />
        </button>
        <div className="flex flex-col items-center gap-4 mb-6">
          <img
            src={
              profile.profilePicture || "/placeholder.svg?height=128&width=128"
            }
            alt={profile.name}
            className="w-32 h-32 rounded-full object-cover border-2 border-[#8a2be2]"
          />
          <h2 className="font-extrabold text-4xl text-white">{profile.name}</h2>
          {profile.createdAt && (
            <p className="text-white/70 text-sm">
              Joined: {new Date(profile.createdAt).toLocaleDateString()}
            </p>
          )}
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
            {reviews.length === 0 && (
              <p className="text-sm text-white/70">No reviews yet.</p>
            )}
          </div>

          {/* Favorites Summary */}
          <div className="flex flex-col items-center text-center bg-white/5 p-4 rounded-lg">
            <FaHeart className="text-[#8a2be2] mb-2" size={32} />
            <h3 className="text-xl font-semibold text-white mb-2">
              Favorites ({favorites.length})
            </h3>
            {favorites.length === 0 && (
              <p className="text-sm text-white/70">No favorites yet.</p>
            )}
          </div>

          {/* Following Summary */}
          <div className="flex flex-col items-center text-center bg-white/5 p-4 rounded-lg">
            <FaUsers className="text-[#8a2be2] mb-2" size={32} />
            <h3 className="text-xl font-semibold text-white mb-2">
              Following ({following.length})
            </h3>
            {following.length === 0 && (
              <p className="text-sm text-white/70">Not following anyone yet.</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
