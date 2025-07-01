"use client";

import { useEffect, useState } from "react";
import { TiStarFullOutline } from "react-icons/ti";
import { FaTrashAlt, FaTimes } from "react-icons/fa";
import { Card } from "../ui/Card";
import { useAuth } from "../../context/authContext";
import { fetchUserReviews, deleteReviewApi, type Review } from "../../lib/api";
import placeholder from "../../assets/placeholder.svg";

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const [isFullViewModalOpen, setIsFullViewModalOpen] = useState(false);
  const [selectedReviewForView, setSelectedReviewForView] =
    useState<Review | null>(null);

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
        (err as Error).message || "Failed to fetch reviews. Please try again.",
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
      "Are you sure you want to delete this review?",
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
          "An unexpected error occurred while deleting the review.",
      );
      console.error("Error:", err);
    }
  }

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
                className="bg-white/15 border border-white/10 p-4 rounded-xl text-white relative flex gap-4 h-[220px] hover:bg-white/20 transition-colors cursor-pointer"
                onClick={() => openFullViewModal(review)}
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
                  <div className="flex gap-[2px] mb-2">
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
                  {/* Review Comment */}
                  <p className="text-sm opacity-90 break-all line-clamp-3 overflow-hidden">
                    {review.comment}
                  </p>
                  <p className="text-xs text-white/50 mt-auto pt-2">
                    Reviewed on{" "}
                    {new Date(review.createdAt).toLocaleDateString()}
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

      {/* Full View Modal */}
      {isFullViewModalOpen && selectedReviewForView && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeFullViewModal();
          }}
        >
          <Card className="bg-neutral-800 rounded-[20px] p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeFullViewModal}
              className="absolute top-4 right-4 text-white/70 hover:text-white"
            >
              <FaTimes size={20} />
            </button>

            <div className="flex items-start gap-6 mb-6">
              <img
                src={selectedReviewForView.coverUrl || placeholder}
                alt={selectedReviewForView.title}
                className="w-32 h-32 rounded-md object-cover flex-shrink-0"
              />
              <div className="flex flex-col flex-grow min-w-0">
                {/* Star Rating */}
                <div className="flex gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TiStarFullOutline
                      key={i}
                      size={24}
                      className={
                        i < selectedReviewForView.rating
                          ? "text-[#8a2be2]"
                          : "text-white/30"
                      }
                    />
                  ))}
                </div>
                {/* Track Title */}
                <h3 className="text-2xl font-bold text-white leading-tight mb-1 break-all">
                  {selectedReviewForView.title}
                </h3>
                {/* Artist(s) & Album */}
                <p className="text-base text-white/70 mb-4 break-all">
                  {typeof selectedReviewForView.artist === "string"
                    ? selectedReviewForView.artist
                    : selectedReviewForView.artist?.name ||
                      "Unknown artist"}{" "}
                  •{" "}
                  {typeof selectedReviewForView.album === "string"
                    ? selectedReviewForView.album
                    : selectedReviewForView.album?.name || "Unknown album"}
                </p>
                {/* Review Comment */}
                <p className="text-base opacity-90 whitespace-pre-wrap break-all">
                  {selectedReviewForView.comment}
                </p>
                <p className="text-xs text-white/50 mt-4">
                  Reviewed on{" "}
                  {new Date(
                    selectedReviewForView.createdAt,
                  ).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
