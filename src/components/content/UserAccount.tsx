"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FaStar,
  FaHeart,
  FaUsers,
  FaArrowLeft,
  FaTimes,
  FaUserCircle,
} from "react-icons/fa";
import { Card } from "../ui/Card";
import { useAuth } from "../../hooks/use-auth";
import type { User } from "../../context/auth-context";
import { useNavigate, createSearchParams } from "react-router-dom";
import {
  fetchUserFollows,
  fetchUserReviews,
  fetchUserFavorites,
  type Follow,
  type Review,
  type Favorite,
} from "../../lib/api";
import placeholder from "../../assets/placeholder.svg";

type ReviewFullViewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  review: Review;
};

function ReviewFullViewModal({
  isOpen,
  onClose,
  review,
}: ReviewFullViewModalProps) {
  if (!isOpen) return null;

  const artistName =
    typeof review.artist === "string"
      ? review.artist
      : review.artist?.name || "Unknown artist";
  const albumName =
    typeof review.album === "string"
      ? review.album
      : review.album?.name || "Unknown album";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Card className="bg-neutral-800 rounded-[20px] p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white"
        >
          <FaTimes size={20} />
        </button>

        <div className="flex items-start gap-6 mb-6">
          <img
            src={review.coverUrl || placeholder}
            alt={review.title}
            className="w-32 h-32 rounded-md object-cover flex-shrink-0"
          />
          <div className="flex flex-col flex-grow min-w-0">
            <div className="flex gap-1 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <FaStar
                  key={i}
                  size={24}
                  className={
                    i < review.rating ? "text-[#8a2be2]" : "text-white/30"
                  }
                />
              ))}
            </div>
            <h3 className="text-2xl font-bold text-white leading-tight mb-1 break-all">
              {review.title}
            </h3>
            <p className="text-base text-white/70 mb-4 break-all">
              {artistName} • {albumName}
            </p>
            <p className="text-base opacity-90 whitespace-pre-wrap break-all">
              {review.comment}
            </p>
            <p className="text-xs text-white/50 mt-4">
              Reviewed on {new Date(review.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

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

  const [isFullViewModalOpen, setIsFullViewModalOpen] = useState(false);
  const [selectedReviewForView, setSelectedReviewForView] =
    useState<Review | null>(null);

  const fetchUserData = useCallback(async () => {
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

      const token = localStorage.getItem("token") || ""; // Ensure token is available for authenticated fetches

      const reviewsData = await fetchUserReviews(token, Number(userId));
      setReviews(reviewsData.sort((a, b) => b.rating - a.rating)); // Sort by rating for top reviews

      const favoritesData = await fetchUserFavorites(token, Number(userId));
      setFavorites(favoritesData);

      const fetchedFollowing = await fetchUserFollows(token, Number(userId));
      const processedFollowing = fetchedFollowing.map((f: Follow) => {
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
      setFollowing(processedFollowing);

      if (currentUser) {
        const myFollows = await fetchUserFollows(token, currentUser.id);
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
  }, [userId, currentUser]);

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId, fetchUserData]);

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
      fetchUserData();
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

  const openFullViewModal = (review: Review) => {
    setSelectedReviewForView(review);
    setIsFullViewModalOpen(true);
  };

  const closeFullViewModal = () => {
    setIsFullViewModalOpen(false);
    setSelectedReviewForView(null);
  };

  const handleViewUser = (targetId: number) => {
    navigate({
      pathname: "/",
      search: createSearchParams({
        section: "user",
        userId: targetId.toString(),
      }).toString(),
    });
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-white text-center opacity-70">
        <FaUserCircle size={48} className="mb-4 text-[#8a2be2]" />
        <p className="text-lg">Loading user profile...</p>
      </div>
    );
  if (error)
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-white text-center opacity-70">
        <FaUserCircle size={48} className="mb-4 text-red-400" />
        <p className="text-lg">Oops! Something went wrong.</p>
        <p className="text-sm text-red-300">{error}</p>
      </div>
    );
  if (!profile)
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-white text-center opacity-70">
        <FaUserCircle size={48} className="mb-4 text-[#8a2be2]" />
        <p className="text-lg">User not found.</p>
      </div>
    );

  return (
    <>
      <div className="flex flex-col w-full h-full items-center">
        <Card className="flex flex-col w-full max-w-[800px] mt-5 bg-white/5 rounded-[20px] p-6 relative">
          <button
            onClick={handleGoBack}
            className="absolute top-4 left-6 text-white/70 hover:text-white bg-transparent p-2 rounded-full"
            title="Go Back"
          >
            <FaArrowLeft size={20} />
          </button>
          <div className="flex flex-col items-center gap-4 mb-6">
            <img
              src={profile.profilePicture || placeholder}
              alt={profile.name}
              className="w-32 h-32 rounded-full object-cover border-2 border-[#8a2be2]"
            />
            <h2 className="font-extrabold text-4xl text-white">
              {profile.name}
            </h2>
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
                {loading
                  ? "Processing..."
                  : isFollowing
                    ? "Unfollow"
                    : "Follow"}
              </button>
            )}
          </div>

          {/* Highest Rated Reviews Section */}
          <div className="mb-8">
            <h3 className="flex items-center gap-2 text-xl font-bold text-white mb-4">
              <FaStar className="text-[#8a2be2]" /> Highest Rated Reviews
            </h3>
            {reviews.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {reviews.slice(0, 3).map((review) => {
                  const artistName =
                    typeof review.artist === "string"
                      ? review.artist
                      : review.artist?.name || "Unknown artist";
                  const albumName =
                    typeof review.album === "string"
                      ? review.album
                      : review.album?.name || "Unknown album";
                  return (
                    <Card
                      key={review.id}
                      className="bg-white/5 border border-white/10 p-3 rounded-xl text-white flex flex-col items-center text-center cursor-pointer hover:bg-white/10 transition-colors h-full"
                      onClick={() => openFullViewModal(review)}
                    >
                      <img
                        src={review.coverUrl || placeholder}
                        alt={review.title}
                        className="w-24 h-24 rounded-md object-cover mb-2"
                      />
                      <h4 className="font-semibold text-base truncate w-full px-1">
                        {review.title}
                      </h4>
                      <p className="text-xs opacity-70 truncate w-full px-1">
                        {artistName} • {albumName}
                      </p>
                      <div className="flex mt-1 gap-[2px]">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <FaStar
                            key={i}
                            size={16}
                            className={
                              i < review.rating
                                ? "text-[#8a2be2]"
                                : "text-white/30"
                            }
                          />
                        ))}
                      </div>
                      {review.comment && (
                        <p className="text-xs opacity-90 mt-2 line-clamp-2 overflow-hidden text-center px-1">
                          {review.comment}
                        </p>
                      )}
                    </Card>
                  );
                })}
              </div>
            ) : (
              <p className="text-white/70 text-center">No reviews yet.</p>
            )}
          </div>

          {/* Favorite Tracks Section */}
          <div className="mb-8">
            <h3 className="flex items-center gap-2 text-xl font-bold text-white mb-4">
              <FaHeart className="text-[#8a2be2]" /> Favorite Tracks (
              {favorites.length})
            </h3>
            {favorites.length > 0 ? (
              <div className="flex overflow-x-auto gap-4 pb-2">
                {favorites.map((favorite) => {
                  const artistName =
                    typeof favorite.artist === "string"
                      ? favorite.artist
                      : favorite.artist?.name || "Unknown artist";
                  return (
                    <Card
                      key={favorite.id}
                      className="bg-white/5 border border-white/10 p-3 rounded-xl text-white flex flex-col items-center text-center flex-shrink-0 w-28 cursor-pointer hover:bg-white/10 transition-colors"
                    >
                      <img
                        src={favorite.coverUrl || placeholder}
                        alt={favorite.title}
                        className="w-16 h-16 rounded-md object-cover mb-2"
                      />
                      <h4 className="font-semibold text-sm truncate w-full px-1">
                        {favorite.title}
                      </h4>
                      <p className="text-xs opacity-70 truncate w-full px-1">
                        {artistName}
                      </p>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <p className="text-white/70 text-center">
                No favorite tracks yet.
              </p>
            )}
          </div>

          {/* Following Section */}
          <div className="mb-8">
            <h3 className="flex items-center gap-2 text-xl font-bold text-white mb-4">
              <FaUsers className="text-[#8a2be2]" /> Following (
              {following.length})
            </h3>
            {following.length > 0 ? (
              <div className="flex overflow-x-auto gap-4 pb-2">
                {following.map((follow) => (
                  <Card
                    key={follow.id}
                    className="bg-white/5 border border-white/10 p-3 rounded-xl text-white flex flex-col items-center text-center flex-shrink-0 w-28 cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => handleViewUser(follow.targetId)}
                  >
                    <img
                      src={
                        follow.targetProfilePicture ||
                        "/placeholder.svg?height=64&width=64"
                      }
                      alt={follow.targetName}
                      className="w-16 h-16 rounded-full object-cover mb-2"
                    />
                    <h4 className="font-semibold text-sm truncate w-full px-1">
                      {follow.targetName}
                    </h4>
                    <p className="text-xs opacity-70 capitalize">
                      {follow.targetType}
                    </p>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-white/70 text-center">
                Not following anyone yet.
              </p>
            )}
          </div>
        </Card>
      </div>

      {selectedReviewForView && (
        <ReviewFullViewModal
          isOpen={isFullViewModalOpen}
          onClose={closeFullViewModal}
          review={selectedReviewForView}
        />
      )}
    </>
  );
}
