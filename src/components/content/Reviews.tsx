"use client";

import { useEffect, useState } from "react";
import { TiStarFullOutline } from "react-icons/ti";
import { FaTrashAlt } from "react-icons/fa";
import { Card } from "../ui/Card";
import { useAuth } from "../../hooks/use-auth";
import { useNavigate, createSearchParams } from "react-router-dom";
import { fetchUserReviews, deleteReviewApi, type Review } from "../../lib/api";
import placeholder from "../../assets/placeholder.svg";

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const loadReviews = async () => {
    if (!user) {
      setError("You must be logged in to view your reviews.");
      setLoading(false);
      return;
    }
    const userId = user.id;
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token missing. Please log in again.");
        setLoading(false);
        return;
      }
      const data = await fetchUserReviews(token, userId);
      setReviews(data);
      setError(null);
    } catch (err) {
      setError(
        (err as Error).message || "Failed to fetch reviews. Please try again."
      );
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [user]);

  async function handleDeleteReview(id: number) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this review?"
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token missing.");
      await deleteReviewApi(token, id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      alert("Review deleted successfully!");
    } catch (err) {
      alert(
        (err as Error).message ||
          "An unexpected error occurred while deleting the review."
      );
      console.error("Error:", err);
    }
  }

  const handleReviewCardClick = (review: Review) => {
    navigate({
      pathname: "/",
      search: createSearchParams({
        section: "track",
        trackId: review.externalId,
      }).toString(),
    });
  };

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
        <div className="grid lg:grid-cols-2 sm:grid-cols-2 md:grid-cols-1 gap-4 overflow-y-auto pr-2 max-h-[calc(100%-64px)]">
          {reviews.map((review) => {
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
                className="bg-slate-800/60 border border-white/10 p-4 rounded-xl text-white relative flex gap-4 h-[220px] hover:bg-slate-600/40 transition-colors cursor-pointer"
                onClick={() => handleReviewCardClick(review)}
              >
                {/* Track Image */}
                <img
                  src={review.coverUrl || placeholder}
                  alt={review.title}
                  className="w-28 h-28 rounded-md object-cover flex-shrink-0"
                />

                <div className="flex flex-col flex-grow min-w-0">
                  {/* Track Title */}
                  <h3 className="text-xl font-semibold leading-tight mb-1 break-all">
                    {review.title}
                  </h3>
                  {/* Artist(s) & Album */}
                  <p className="text-base text-white/70 mb-2 break-all">
                    {artistName} • {albumName}
                  </p>
                  {/* Star Rating */}
                  <div className="xl:flex xl:justify-between mb-2">
                    <div className="flex gap-[2px] mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <TiStarFullOutline
                          key={i}
                          size={20}
                          className={
                            i < review.rating
                              ? "text-[#8a2be2]"
                              : "text-white/30"
                          }
                        />
                      ))}
                    </div>
                    <p className="text-xs text-white/50 pt-1">
                      Reviewed on{" "}
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {/* Review Comment */}
                  <p className="text-sm opacity-90 break-all line-clamp-3 overflow-y-auto">
                    {review.comment}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteReview(review.id);
                    }}
                    className="text-red-400 hover:text-red-300 bg-transparent p-1 rounded-full"
                    title="Delete Review"
                  >
                    <FaTrashAlt size={16} />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
