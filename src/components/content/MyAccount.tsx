"use client";

import type React from "react";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  FaUserCircle,
  FaStar,
  FaUsers,
  FaPencilAlt,
  FaTrashAlt,
  FaCamera,
  FaInfoCircle,
  FaHeart,
  FaTimes,
} from "react-icons/fa";
import { Card } from "../ui/Card";
import { useAuth } from "../../hooks/use-auth";
import { updateUserProfile } from "../../lib/auth";
import { useNavigate, createSearchParams } from "react-router-dom";
import {
  uploadProfilePicture,
  fetchMyFollows,
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

export default function MyAccount() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [reviews, setReviews] = useState<Review[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [following, setFollowing] = useState<Follow[]>([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(
    null,
  );
  const [uploading, setUploading] = useState(false);

  const [activeTooltip, setActiveTooltip] = useState<
    "name" | "email" | "password" | null
  >(null);

  const [isFullViewModalOpen, setIsFullViewModalOpen] = useState(false);
  const [selectedReviewForView, setSelectedReviewForView] =
    useState<Review | null>(null);

  const fetchUserData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const [reviewsData, favoritesData, fetchedFollowing] = await Promise.all([
        fetchUserReviews(token!, user.id),
        fetchUserFavorites(token!, user.id),
        fetchMyFollows(token!),
      ]);

      setReviews(reviewsData.sort((a, b) => b.rating - a.rating));
      setFavorites(favoritesData);
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
    } catch (err) {
      console.error("Error fetching user data:", err);
      setMessage("Failed to load profile data.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUserData();
  }, [user, fetchUserData]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setMessageType(null);
    setLoading(true);

    if (password && password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setMessageType("error");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Authentication token missing. Please log in again.");
      setMessageType("error");
      setLoading(false);
      return;
    }

    const updateData: { name?: string; email?: string; password?: string } = {};

    if (name.trim() !== "" && name.trim() !== user?.name) {
      updateData.name = name.trim();
    }

    if (email.trim() !== "" && email.trim() !== user?.email) {
      updateData.email = email.trim();
    }

    if (password) updateData.password = password;

    if (Object.keys(updateData).length === 0) {
      setMessage("No changes to save.");
      setMessageType("success");
      setLoading(false);
      setIsEditing(false);
      return;
    }

    try {
      const updatedUser = await updateUserProfile(token, updateData);
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setMessage("Profile updated successfully!");
      setMessageType("success");
      setPassword("");
      setConfirmPassword("");
      setIsEditing(false);
    } catch (err) {
      setMessage((err as Error).message || "Failed to update profile.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone.",
      )
    ) {
      return;
    }

    if (!user) return;

    setLoading(true);
    setMessage(null);
    setMessageType(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token missing.");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        alert("Your account has been successfully deleted.");
        navigate("/");
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete account.");
      }
    } catch (err) {
      setMessage(
        (err as Error).message || "An error occurred during account deletion.",
      );
      setMessageType("error");
      console.error("Account deletion error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!user) {
      setMessage("You must be logged in to upload a profile picture.");
      setMessageType("error");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Authentication token missing. Please log in again.");
      setMessageType("error");
      return;
    }

    setUploading(true);
    setMessage(null);
    setMessageType(null);

    try {
      const result = await uploadProfilePicture(token, file);
      const updatedUser = { ...user, profilePicture: result.url };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setMessage("Profile picture updated successfully!");
      setMessageType("success");
    } catch (err) {
      setMessage((err as Error).message || "Failed to upload profile picture.");
      setMessageType("error");
    } finally {
      setUploading(false);
    }
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

  const openFullViewModal = (review: Review) => {
    setSelectedReviewForView(review);
    setIsFullViewModalOpen(true);
  };

  const closeFullViewModal = () => {
    setIsFullViewModalOpen(false);
    setSelectedReviewForView(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-white text-center opacity-70">
        <FaUserCircle size={48} className="mb-4 text-[#8a2be2]" />
        <p className="text-lg">Loading your account details...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-white text-center opacity-70">
        <FaUserCircle size={48} className="mb-4 text-[#8a2be2]" />
        <p className="text-lg">Please log in to view your account details.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col w-full h-full items-center">
        <Card className="flex flex-col w-full max-w-[800px] bg-white/5 rounded-[20px] p-6">
          {/* Profile Header */}
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="relative">
              <img
                src={user.profilePicture || placeholder}
                alt={user.name}
                className="w-32 h-32 rounded-full object-cover border-2 border-[#8a2be2]"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-[#8a2be2] text-white p-2 rounded-full hover:bg-[#7a1fd1] transition-colors"
                title="Upload Profile Picture"
                disabled={uploading}
              >
                {uploading ? (
                  <span className="animate-spin">⚙️</span>
                ) : (
                  <FaCamera size={16} />
                )}
              </button>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
              />
            </div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-4xl text-white">
                {user.name}
              </h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-transparent p-1"
              >
                <FaPencilAlt
                  size={20}
                  className="text-white/70 hover:text-[#8a2be2] transition-colors"
                />
              </button>
            </div>
            {user.createdAt && (
              <p className="text-white/70 text-sm">
                Joined: {new Date(user.createdAt).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Edit Form */}
          {isEditing && (
            <form
              onSubmit={handleUpdateProfile}
              className="flex flex-col gap-5 w-full mb-8"
            >
              <h3 className="text-xl font-bold text-white mb-2 text-center">
                Edit Profile
              </h3>
              <div>
                <label
                  htmlFor="name"
                  className="block text-white text-sm font-medium mb-1"
                >
                  Username
                  <span
                    className="relative inline-block ml-2 cursor-pointer"
                    onMouseEnter={() => setActiveTooltip("name")}
                    onMouseLeave={() => setActiveTooltip(null)}
                    onClick={() =>
                      setActiveTooltip(activeTooltip === "name" ? null : "name")
                    }
                  >
                    <FaInfoCircle size={14} className="text-white/70" />
                    {activeTooltip === "name" && (
                      <div className="absolute z-10 bg-neutral-700 text-white text-sm rounded py-1 px-2 w-64 -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap shadow-lg before:content-[''] before:absolute before:bottom-[-5px] before:left-1/2 before:-translate-x-1/2 before:border-t-neutral-700 before:border-x-transparent before:border-b-transparent before:border-[6px]">
                        To keep current username, leave as is.
                      </div>
                    )}
                  </span>
                </label>
                <input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  placeholder="Username"
                  className="p-3 rounded-md bg-white/80 text-black placeholder-gray-500 focus:outline-none w-full"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-white text-sm font-medium mb-1"
                >
                  Email
                  <span
                    className="relative inline-block ml-2 cursor-pointer"
                    onMouseEnter={() => setActiveTooltip("email")}
                    onMouseLeave={() => setActiveTooltip(null)}
                    onClick={() =>
                      setActiveTooltip(
                        activeTooltip === "email" ? null : "email",
                      )
                    }
                  >
                    <FaInfoCircle size={14} className="text-white/70" />
                    {activeTooltip === "email" && (
                      <div className="absolute z-10 bg-neutral-700 text-white text-sm rounded py-1 px-2 w-54 -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap shadow-lg before:content-[''] before:absolute before:bottom-[-5px] before:left-1/2 before:-translate-x-1/2 before:border-t-neutral-700 before:border-x-transparent before:border-b-transparent before:border-[6px]">
                        To keep current email, leave as is.
                      </div>
                    )}
                  </span>
                </label>
                <input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="Email"
                  className="p-3 rounded-md bg-white/80 text-black placeholder-gray-500 focus:outline-none w-full"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-white text-sm font-medium mb-1"
                >
                  New Password
                  <span
                    className="relative inline-block ml-2 cursor-pointer"
                    onMouseEnter={() => setActiveTooltip("password")}
                    onMouseLeave={() => setActiveTooltip(null)}
                    onClick={() =>
                      setActiveTooltip(
                        activeTooltip === "password" ? null : "password",
                      )
                    }
                  >
                    <FaInfoCircle size={14} className="text-white/70" />
                    {activeTooltip === "password" && (
                      <div className="absolute z-10 bg-neutral-700 text-white text-sm rounded py-1 px-2 w-66 -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap shadow-lg before:content-[''] before:absolute before:bottom-[-5px] before:left-1/2 before:-translate-x-1/2 before:border-t-neutral-700 before:border-x-transparent before:border-b-transparent before:border-[6px]">
                        Leave blank to keep current password.
                      </div>
                    )}
                  </span>
                </label>
                <input
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="New Password"
                  className="p-3 rounded-md bg-white/80 text-black placeholder-gray-500 focus:outline-none w-full"
                />
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-white text-sm font-medium mb-1"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type="password"
                  placeholder="Confirm New Password"
                  className="p-3 rounded-md bg-white/80 text-black placeholder-gray-500 focus:outline-none w-full"
                />
              </div>

              {message && (
                <p
                  className={`text-center ${messageType === "error" ? "text-red-400" : "text-green-400"}`}
                >
                  {message}
                </p>
              )}

              <div className="flex justify-center gap-4 mt-2">
                <button
                  type="submit"
                  className="bg-[#8a2be2] text-white py-2.5 px-10 rounded-full font-semibold hover:bg-[#7a1fd1] transition"
                  disabled={loading}
                >
                  {loading ? "Updating…" : "Update Profile"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setMessage(null);
                    setMessageType(null);
                    setPassword("");
                    setConfirmPassword("");
                    setName(user.name);
                    setEmail(user.email);
                  }}
                  className="bg-neutral-700 text-white py-2.5 px-10 rounded-full font-semibold hover:bg-neutral-600 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

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
              <p className="text-white/70 text-center">
                No reviews yet. Start reviewing tracks!
              </p>
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
                      onClick={() =>
                        navigate({
                          pathname: "/",
                          search: createSearchParams({
                            section: "track",
                            trackId: favorite.externalId,
                          }).toString(),
                        })
                      }
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
                      src={follow.targetProfilePicture || "/placeholder.svg"}
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
                You are not following anyone yet.
              </p>
            )}
          </div>

          {/* Delete Account Button */}
          <div className="flex justify-center mt-6">
            <button
              onClick={handleDeleteAccount}
              className="bg-red-600 text-white py-2.5 px-10 rounded-full font-semibold hover:bg-red-500 transition flex items-center gap-2"
              disabled={loading}
            >
              <FaTrashAlt size={16} />{" "}
              {loading ? "Deleting..." : "Delete Account"}
            </button>
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
