"use client";

import { useEffect, useState } from "react";
import { TiStarFullOutline } from "react-icons/ti";
import { FaTrashAlt, FaPencilAlt, FaTimes } from "react-icons/fa";
import { Card } from "../ui/Card";
import { useAuth } from "../../context/authContext";
import { fetchUserReviews, deleteReviewApi, type Review } from "../../lib/api";
import ReviewModal from "../ReviewModal"; // Import the ReviewModal

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const [isFullViewModalOpen, setIsFullViewModalOpen] = useState(false);
  const [selectedReviewForView, setSelectedReviewForView] =
    useState<Review | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedReviewForEdit, setSelectedReviewForEdit] =
    useState<Review | null>(null);

  useEffect(() => {
    // Move loadReviews inside useEffect
    const loadReviews = async () => {
      if (!user) {
        setError("You must be logged in to view your reviews.");
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
        const data = await fetchUserReviews(token, user.id);
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

    loadReviews();
  }, [user]); // Now 'user' is the only dependency for this effect

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
    } catch (err) {
      alert(
        (err as Error).message ||
          "An unexpected error occurred while deleting the review."
      );
      console.error("Error:", err);
    }
  }

  const handleEditReview = (review: Review) => {
    setSelectedReviewForEdit(review);
    setIsEditModalOpen(true);
  };

  const handleReviewSubmitted = (updatedReview: Review) => {
    // Update the reviews list with the new/updated review
    setReviews((prevReviews) => {
      const existingIndex = prevReviews.findIndex(
        (r) => r.id === updatedReview.id
      );
      if (existingIndex > -1) {
        return prevReviews.map((r, index) =>
          index === existingIndex ? updatedReview : r
        );
      } else {
        return [...prevReviews, updatedReview]; // Should not happen for edits, but good for consistency
      }
    });
    setIsEditModalOpen(false); // Close edit modal
    setSelectedReviewForEdit(null);
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
              className="bg-white/5 border border-white/10 p-4 rounded-xl text-white relative flex gap-4 min-h-[160px] max-h-[160px] overflow-hidden cursor-pointer hover:bg-white/10 transition-colors"
              onClick={() => openFullViewModal(review)}
            >
              {/* Track Image */}
              <img
                src={review.coverUrl || "/placeholder.svg?height=96&width=96"}
                alt={review.title}
                className="w-24 h-24 rounded-md object-cover flex-shrink-0"
              />

              <div className="flex flex-col flex-grow overflow-hidden">
                {/* Star Rating */}
                <div className="flex gap-[2px] mb-1">
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

                {/* Track Title */}
                <h3 className="text-lg font-semibold leading-tight truncate">
                  {review.title}
                </h3>

                {/* Artist(s) & Album */}
                <p className="text-sm text-white/70 truncate mb-2">
                  {review.artist?.name || "Unknown artist"} •{" "}
                  {review.album?.name || "Unknown album"}
                </p>

                {/* Review Comment */}
                <p className="text-sm opacity-90 line-clamp-3">
                  {review.comment}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click from opening full view
                    handleEditReview(review);
                  }}
                  className="text-white/70 hover:text-[#8a2be2] bg-transparent p-1 rounded-full"
                  title="Edit Review"
                >
                  <FaPencilAlt size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click from opening full view
                    handleDeleteReview(review.id);
                  }}
                  className="text-red-400 hover:text-red-300 bg-transparent p-1 rounded-full"
                  title="Delete Review"
                >
                  <FaTrashAlt size={16} />
                </button>
              </div>
            </Card>
          ))}
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
          <Card className="bg-[#696969]/40 rounded-[20px] p-6 w-full max-w-2xl relative">
            <button
              onClick={closeFullViewModal}
              className="absolute top-4 right-4 text-white/70 hover:text-white"
            >
              <FaTimes size={20} />
            </button>

            <div className="flex items-start gap-6 mb-6">
              <img
                src={
                  selectedReviewForView.coverUrl ||
                  "/placeholder.svg?height=128&width=128"
                }
                alt={selectedReviewForView.title}
                className="w-32 h-32 rounded-md object-cover flex-shrink-0"
              />
              <div className="flex flex-col flex-grow">
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
                <h3 className="text-2xl font-bold text-white leading-tight mb-1">
                  {selectedReviewForView.title}
                </h3>

                {/* Artist(s) & Album */}
                <p className="text-base text-white/70 mb-4">
                  {selectedReviewForView.artist?.name || "Unknown artist"} •{" "}
                  {selectedReviewForView.album?.name || "Unknown album"}
                </p>

                {/* Review Comment */}
                <p className="text-base opacity-90 whitespace-pre-wrap">
                  {selectedReviewForView.comment}
                </p>

                <p className="text-xs text-white/50 mt-4">
                  Reviewed on{" "}
                  {new Date(
                    selectedReviewForView.createdAt
                  ).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Review Modal */}
      {isEditModalOpen && selectedReviewForEdit && (
        <ReviewModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          track={{
            id: selectedReviewForEdit.externalId,
            title: selectedReviewForEdit.title,
            artistNames: selectedReviewForEdit.artist?.name
              ? [selectedReviewForEdit.artist.name]
              : [],
            albumName: selectedReviewForEdit.album?.name || "",
            imageUrl: selectedReviewForEdit.coverUrl,
          }}
          existingReview={selectedReviewForEdit}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </div>
  );
}
