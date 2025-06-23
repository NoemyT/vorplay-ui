"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { FaStar, FaTimes } from "react-icons/fa";
import { Card } from "./ui/Card";
import { useAuth } from "../context/authContext";
import {
  createReview,
  updateReview,
  type Review,
  type ReviewPayload,
  type ReviewUpdatePayload,
} from "../lib/api";

type TrackDetails = {
  id: string; // Spotify track ID
  title: string;
  artistNames: string[];
  albumName: string;
  imageUrl?: string;
};

type ReviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  track: TrackDetails;
  existingReview?: Review | null;
  onReviewSubmitted: (review: Review) => void;
};

const MAX_COMMENT_LENGTH = 250;

export default function ReviewModal({
  isOpen,
  onClose,
  track,
  existingReview,
  onReviewSubmitted,
}: ReviewModalProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setRating(existingReview?.rating || 0);
      setComment(existingReview?.comment || "");
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, existingReview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!user) {
      setError("You must be logged in to submit a review.");
      setLoading(false);
      return;
    }

    if (rating === 0) {
      setError("Please select a star rating.");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication token missing. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      let submittedReview: Review;
      if (existingReview) {
        // Update existing review
        const payload: ReviewUpdatePayload = {};
        if (rating !== existingReview.rating) payload.rating = rating;
        if (comment !== existingReview.comment) payload.comment = comment;

        if (Object.keys(payload).length === 0) {
          setSuccess("No changes to save.");
          setLoading(false);
          onClose();
          return;
        }

        submittedReview = await updateReview(token, existingReview.id, payload);
        setSuccess("Review updated successfully!");
      } else {
        // Create new review
        const payload: ReviewPayload = {
          trackId: track.id, // Changed from externalId to trackId
          rating,
          comment,
        };
        submittedReview = await createReview(token, payload);
        setSuccess("Review submitted successfully!");
      }
      onReviewSubmitted(submittedReview);
      setTimeout(onClose, 1500); // Close modal after a short delay
    } catch (err) {
      setError((err as Error).message || "Failed to submit review.");
      console.error("Review submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Card className="bg-neutral-800 rounded-[20px] p-6 w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white"
        >
          <FaTimes size={20} />
        </button>

        <h2 className="text-2xl font-bold text-white mb-4 text-center">
          {existingReview ? "Edit Your Review" : "Write a Review"}
        </h2>

        <div className="flex items-center gap-4 mb-6">
          <img
            src={track.imageUrl || "/placeholder.svg?height=64&width=64"}
            alt={track.albumName}
            className="w-20 h-20 rounded-md object-cover flex-shrink-0"
          />
          <div className="flex-grow">
            <h3 className="text-xl font-semibold text-white truncate">
              {track.title}
            </h3>{" "}
            {/* Track title made more prominent */}
            <p className="text-sm text-white/70 truncate">
              {track.artistNames.join(", ")}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Star Rating */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Your Rating:
            </label>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <FaStar
                  key={i}
                  size={32}
                  className={`cursor-pointer transition-colors ${
                    i < rating
                      ? "text-[#8a2be2]"
                      : "text-white/30 hover:text-white/50"
                  }`}
                  onClick={() => setRating(i + 1)}
                />
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label
              htmlFor="comment"
              className="block text-white text-sm font-medium mb-2"
            >
              Your Review (Markdown supported, max {MAX_COMMENT_LENGTH}{" "}
              characters):
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) =>
                setComment(e.target.value.slice(0, MAX_COMMENT_LENGTH))
              }
              rows={5}
              placeholder="Write your review here..."
              className="w-full p-3 rounded-md bg-white/80 text-black placeholder-gray-500 focus:outline-none resize-none"
            />
            <p className="text-right text-xs text-white/70">
              {comment.length}/{MAX_COMMENT_LENGTH}
            </p>
          </div>

          {error && <p className="text-red-400 text-center">{error}</p>}
          {success && <p className="text-green-400 text-center">{success}</p>}

          <button
            type="submit"
            className="bg-[#8a2be2] text-white py-2.5 px-10 rounded-full font-semibold hover:bg-[#7a1fd1] transition w-fit self-center"
            disabled={loading}
          >
            {loading
              ? "Submitting..."
              : existingReview
              ? "Update Review"
              : "Submit Review"}
          </button>
        </form>
      </Card>
    </div>
  );
}
