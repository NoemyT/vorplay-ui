"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react"; // ADDED: useRef
import {
  FaUserCircle,
  FaStar,
  FaUsers,
  FaPencilAlt,
  FaTrashAlt,
  FaCamera,
} from "react-icons/fa"; // ADDED: FaCamera
import { Card } from "../ui/Card";
import { useAuth } from "../../context/authContext";
import { updateUserProfile } from "../../lib/auth";
import { useNavigate, createSearchParams } from "react-router-dom"; // Corrected import path
import {
  uploadProfilePicture,
  fetchMyFollows,
  type Follow,
} from "../../lib/api"; // ADDED: uploadProfilePicture, fetchMyFollows

// Define types for fetched data
type ReviewSummary = {
  id: number;
  title: string;
  rating: number;
  coverUrl?: string;
  createdAt: string;
};

export default function MyAccount() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null); // ADDED: Ref for file input

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [reviews, setReviews] = useState<ReviewSummary[]>([]);
  const [following, setFollowing] = useState<Follow[]>([]); // Renamed from 'followers' to 'following'

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(
    null,
  );
  const [uploading, setUploading] = useState(false); // ADDED: State for upload loading

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);

      const fetchUserData = async () => {
        setLoading(true);
        try {
          const token = localStorage.getItem("token");

          // Fetch user's reviews
          const reviewsRes = await fetch(
            `${import.meta.env.VITE_API_URL}/reviews/user/${user.id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          if (reviewsRes.ok) {
            const reviewsData: ReviewSummary[] = await reviewsRes.json();
            // Sort by rating descending and take top 3
            const topReviews = reviewsData
              .sort((a, b) => b.rating - a.rating)
              .slice(0, 3);
            setReviews(topReviews);
          } else {
            console.warn("Failed to fetch user reviews.");
            setReviews([]);
          }

          // Fetch "People I Follow" (Following)
          console.log(`Attempting to fetch following for user ID: ${user.id}`);
          const fetchedFollowing = await fetchMyFollows(token!); // Use the new API function
          // MODIFIED: Process fetchedFollowing to correctly extract targetName and targetProfilePicture from 'user' or 'artist'
          const processedFollowing = fetchedFollowing.map((f: Follow) => {
            let displayName = "";
            let displayPicture = "/placeholder.svg?height=96&width=96"; // Default placeholder

            if (f.targetType === "usuario" && f.user) {
              displayName = f.user.name;
              displayPicture =
                f.user.profilePicture || "/placeholder.svg?height=96&width=96";
            } else if (f.targetType === "artista" && f.artist) {
              displayName = f.artist.name;
              displayPicture =
                f.artist.imageUrl || "/placeholder.svg?height=96&width=96";
            } else {
              // Fallback if nested user/artist object is not present or type is unknown
              displayName =
                f.targetName ||
                (f.targetType === "usuario"
                  ? `User ${f.targetId}`
                  : `Artist ${f.targetId}`);
              displayPicture =
                f.targetProfilePicture || "/placeholder.svg?height=96&width=96";
            }

            return {
              ...f,
              targetName: displayName,
              targetProfilePicture: displayPicture,
            };
          });
          console.log(
            "Successfully fetched following data:",
            processedFollowing,
          );
          setFollowing(processedFollowing);
        } catch (err) {
          console.error("Error fetching user data:", err);
          setMessage("Failed to load profile data.");
          setMessageType("error");
        } finally {
          setLoading(false);
        }
      };

      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [user]);

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
    if (name !== user?.name) updateData.name = name;
    if (email !== user?.email) updateData.email = email;
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
      setIsEditing(false); // Exit edit mode on success
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
        navigate("/"); // Redirect to home or login page
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

  // ADDED: Function to handle profile picture file selection
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
    <div className="flex flex-col w-full h-full items-center">
      <Card className="flex flex-col w-full max-w-[800px] bg-white/5 rounded-[20px] p-6">
        {/* Profile Header */}
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="relative">
            <img
              src={
                user.profilePicture || "/placeholder.svg?height=128&width=128"
              }
              alt={user.name}
              className="w-32 h-32 rounded-full object-cover border-2 border-[#8a2be2]"
            />
            {/* ADDED: Camera icon for upload */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-[#8a2be2] text-white p-2 rounded-full hover:bg-[#7a1fd1] transition-colors"
              title="Upload Profile Picture"
              disabled={uploading}
            >
              {uploading ? (
                <span className="animate-spin">⚙️</span> // Simple loading indicator
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
            <h2 className="font-extrabold text-4xl text-white">{user.name}</h2>
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
          {/* MODIFIED: Display creation date instead of email */}
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
                New Password (leave blank to keep current)
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
                  setName(user.name); // Reset name/email if user cancels
                  setEmail(user.email);
                }}
                className="bg-neutral-700 text-white py-2.5 px-10 rounded-full font-semibold hover:bg-neutral-600 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Highest Rated Tracks */}
        <div className="mb-8">
          <h3 className="flex items-center gap-2 text-xl font-bold text-white mb-4">
            <FaStar className="text-[#8a2be2]" /> Highest Rated Tracks
          </h3>
          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {reviews.map((review) => (
                <Card
                  key={review.id}
                  className="bg-white/5 border border-white/10 p-3 rounded-xl text-white flex flex-col items-center text-center"
                >
                  <img
                    src={
                      review.coverUrl || "/placeholder.svg?height=96&width=96"
                    }
                    alt={review.title}
                    className="w-24 h-24 rounded-md object-cover mb-2"
                  />
                  <h4 className="font-semibold text-base truncate w-full px-1">
                    {review.title}
                  </h4>
                  <div className="flex mt-1 gap-[2px]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <FaStar
                        key={i}
                        size={16}
                        className={
                          i < review.rating ? "text-[#8a2be2]" : "text-white/30"
                        }
                      />
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-white/70 text-center">
              No reviews yet. Start reviewing tracks!
            </p>
          )}
        </div>

        {/* Following Section */}
        <div className="mb-8">
          <h3 className="flex items-center gap-2 text-xl font-bold text-white mb-4">
            <FaUsers className="text-[#8a2be2]" /> Following ({following.length}
            )
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
                  {/* MODIFIED: Display targetType only if it's an artist */}
                  {follow.targetType === "artista" && (
                    <p className="text-xs opacity-70 capitalize">
                      {follow.targetType}
                    </p>
                  )}
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
  );
}
