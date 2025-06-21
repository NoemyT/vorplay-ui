"use client";

import { useEffect, useState } from "react";
import { TiStarFullOutline } from "react-icons/ti";
import { FaTrashAlt } from "react-icons/fa";
import { Card } from "../ui/Card";
import { useAuth } from "../../context/authContext";

type Review = {
  id: number;
  trackId: number;
  externalId: string;
  title: string;
  artist: { name?: string };
  album: { name?: string };
  coverUrl: string;
  rating: number;
  comment: string;
  userId: number;
  userName: string;
  createdAt: string;
};

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchReviews() {
      if (!user) {
        setError("You must be logged in to view your reviews.");
        setLoading(false);
        return;
      }
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${import.meta.env.VITE_API_URL}/reviews`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setReviews(data);
        } else {
          setError("Failed to fetch reviews. Please try again.");
        }
      } catch (err) {
        setError("An unexpected error occurred while fetching reviews.");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, [user]);

  async function deleteReview(id: number) {
    const confirm = window.confirm(
      "Are you sure you want to delete this review?"
    );
    if (!confirm) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/reviews/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
      } else {
        alert("Failed to delete review. Please try again.");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("An unexpected error occurred while deleting the review.");
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-white text-center opacity-70">
        <TiStarFullOutline size={48} className="mb-4 text-[#8a2be2]" />
        <p className="text-lg">Loading your reviews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-white text-center opacity-70">
        <TiStarFullOutline size={48} className="mb-4 text-red-400" />
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
        <TiStarFullOutline className="text-[#8a2be2]" size={28} />
        <span>Reviews</span>
      </div>

      {/* Reviews list or empty state */}
      {reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-white text-center opacity-70">
          <TiStarFullOutline size={48} className="mb-4 text-[#8a2be2]" />
          <p className="text-lg">You haven’t written any reviews yet.</p>
          <p className="text-sm">Search for tracks and share your thoughts!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 overflow-y-auto pr-2 max-h-[calc(100%-64px)]">
          {reviews.map((review) => (
            <Card
              key={review.id}
              className="bg-white/5 border border-white/10 p-4 rounded-xl text-white relative"
            >
              {/* Trash icon */}
              <button
                onClick={() => deleteReview(review.id)}
                className="absolute top-3 right-3 text-red-400 hover:text-red-300 bg-transparent p-1 rounded-full"
              >
                <FaTrashAlt size={16} />
              </button>

              {/* Top section: image + title */}
              <div className="flex gap-4 items-start">
                <img
                  src={review.coverUrl || "/placeholder.svg?height=64&width=64"}
                  alt="cover"
                  className="w-16 h-16 rounded-md object-cover"
                />
                <div className="flex flex-col">
                  <h3 className="text-lg font-semibold">{review.title}</h3>
                  <p className="text-sm text-white/70">
                    {review.artist?.name || "Unknown artist"} •{" "}
                    {review.album?.name || "Unknown album"}
                  </p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex mt-2 gap-[2px]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <TiStarFullOutline
                    key={i}
                    size={20}
                    className={
                      i < review.rating ? "text-[#8a2be2]" : "text-white/30"
                    }
                  />
                ))}
              </div>

              {/* Comment */}
              <p className="text-sm mt-3 opacity-90">{review.comment}</p>

              {/* Date (optional) */}
              <p className="text-xs text-white/50 mt-2">
                Reviewed on {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
