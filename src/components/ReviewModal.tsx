"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { FaStar, FaTimes } from "react-icons/fa";
import { Card } from "./ui/Card";
import { useAuth } from "../hooks/use-auth";
import {
  createReview,
  type Review,
  type ReviewPayload,
  type TrackSummaryDto,
} from "../lib/api";

type ReviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  track: TrackSummaryDto;
  onReviewSubmitted: (newReview: Review) => void;
};

const MAX_COMMENT_LENGTH = 150;

export default function ReviewModal({
  isOpen,
  onClose,
  track,
  onReviewSubmitted,
}: ReviewModalProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccess(null);
      setRating(0);
      setComment("");
    }
  }, [isOpen]);

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
      const payload: ReviewPayload = {
        id: track.id,
        rating,
        comment,
      };
      const submittedReview = await createReview(token, payload);
      setSuccess("Review submitted successfully!");
      onReviewSubmitted(submittedReview);
      setTimeout(onClose, 1500);
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
      <Card className="bg-neutral-800 rounded-[20px] p-6 w-full max-w-sm relative flex flex-col max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white"
        >
          <FaTimes size={20} />
        </button>
        <div className="flex flex-col items-center text-center mb-6 flex-shrink-0">
          <h2 className="text-2xl font-bold text-white mb-1">{track.title}</h2>
          <p className="text-base text-white/70">
            {track.artistNames.join(", ")}
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 overflow-y-auto pr-2"
        >
          {/* Star Rating */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Your Rating:
            </label>
            <div className="flex gap-1 justify-center">
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
              Your Review (max {MAX_COMMENT_LENGTH} characters):
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
            <p className="text-right text-xs text-white/70 mt-1">
              {comment.length}/{MAX_COMMENT_LENGTH}
            </p>
          </div>
          {error && <p className="text-red-400 text-center">{error}</p>}
          {success && <p className="text-green-400 text-center">{success}</p>}
          <div className="flex gap-3 justify-center mt-auto flex-shrink-0">
            <button
              type="submit"
              className="bg-[#8a2be2] text-white py-2.5 px-8 rounded-full font-semibold hover:bg-[#7a1fd1] transition"
              disabled={loading}
            >
              {loading ? "Processing..." : "Submit Review"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
