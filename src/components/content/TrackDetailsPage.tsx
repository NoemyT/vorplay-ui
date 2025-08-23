"use client";

import { useEffect, useState, useCallback } from "react";
import {
  FaArrowLeft,
  FaStar,
  FaTrashAlt,
  FaHeart,
  FaPlus,
  FaMusic,
  FaPencilAlt,
} from "react-icons/fa";
import { Card } from "../ui/Card";
import { useNavigate } from "react-router-dom";
import {
  fetchTrackDetails,
  fetchUserReviews,
  createReview,
  deleteReviewApi,
  fetchUserFavorites,
  type TrackSummaryDto,
  type Review,
  type Favorite,
} from "../../lib/api";
import { useAuth } from "../../hooks/use-auth";
import { handleFavoriteToggle } from "../../lib/utils";
import AddToPlaylistModal from "../AddToPlaylistModal";
import placeholder from "../../assets/placeholder.svg";

type TrackDetailsPageProps = {
  trackId: string;
};

const MAX_COMMENT_LENGTH = 150;

export default function TrackDetailsPage({ trackId }: TrackDetailsPageProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [track, setTrack] = useState<TrackSummaryDto | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingTrack, setLoadingTrack] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [trackError, setTrackError] = useState<string | null>(null);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);
  const [reviewMessageType, setReviewMessageType] = useState<
    "success" | "error" | null
  >(null);
  const [isReviewFormExpanded, setIsReviewFormExpanded] = useState(false);

  const [userFavorites, setUserFavorites] = useState<Favorite[]>([]);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${Number.parseInt(seconds) < 10 ? "0" : ""}${seconds}`;
  };

  const fetchTrackAndReviews = useCallback(async () => {
    setTrackError(null);
    setReviewsError(null);
    setLoadingTrack(true);
    setLoadingReviews(true);

    try {
      const trackData = await fetchTrackDetails(trackId);
      setTrack(trackData);
      setLoadingTrack(false);
    } catch (err) {
      setTrackError((err as Error).message || "Failed to load track details.");
      console.error("Error fetching track details:", err);
      setLoadingTrack(false);
      return;
    }

    try {
      const token = localStorage.getItem("token") || "";

      const trackReviews = await fetchUserReviews(token, undefined, trackId);

      let currentUserReview: Review | null = null;
      let otherReviews: Review[] = [];

      if (user) {
        currentUserReview =
          trackReviews.find((r) => r.userId === user.id) || null;
        otherReviews = trackReviews.filter((r) => r.userId !== user.id);
        setUserHasReviewed(!!currentUserReview);
        if (currentUserReview) {
          setUserRating(currentUserReview.rating);
          setUserComment(currentUserReview.comment);
          setIsReviewFormExpanded(false);
        } else {
          setUserRating(0);
          setUserComment("");
          setIsReviewFormExpanded(false);
        }
      } else {
        otherReviews = trackReviews;
        setUserHasReviewed(false);
        setUserRating(0);
        setUserComment("");
        setIsReviewFormExpanded(false);
      }

      otherReviews.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setReviews(
        currentUserReview ? [currentUserReview, ...otherReviews] : otherReviews
      );

      if (user && token) {
        const favoritesData = await fetchUserFavorites(token, user.id);
        setUserFavorites(favoritesData);
      }
      setLoadingReviews(false);
    } catch (err) {
      setReviewsError((err as Error).message || "Failed to load reviews.");
      console.error("Error fetching reviews:", err);
      setLoadingReviews(false);
    }
  }, [trackId, user]);

  useEffect(() => {
    if (trackId) {
      fetchTrackAndReviews();
    }
  }, [trackId, fetchTrackAndReviews]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleSubmitReview = async () => {
    if (!user) {
      setReviewMessage("You must be logged in to submit a review.");
      setReviewMessageType("error");
      return;
    }
    if (userRating === 0) {
      setReviewMessage("Please select a star rating.");
      setReviewMessageType("error");
      return;
    }
    if (!track) return;

    setSubmittingReview(true);
    setReviewMessage(null);
    setReviewMessageType(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token missing.");

      const payload = {
        id: track.id,
        rating: userRating,
        comment: userComment,
      };
      await createReview(token, payload);
      setReviewMessage("Review submitted successfully!");
      setReviewMessageType("success");
      setUserHasReviewed(true);
      setIsReviewFormExpanded(false);
      fetchTrackAndReviews();
    } catch (err) {
      setReviewMessage((err as Error).message || "Failed to submit review.");
      setReviewMessageType("error");
      console.error("Review submission error:", err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!window.confirm("Are you sure you want to delete your review?")) {
      return;
    }
    setSubmittingReview(true);
    setReviewMessage(null);
    setReviewMessageType(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token missing.");

      await deleteReviewApi(token, reviewId);
      setReviewMessage("Review deleted successfully!");
      setReviewMessageType("success");
      setUserHasReviewed(false);
      setUserRating(0);
      setUserComment("");
      setIsReviewFormExpanded(true);
      fetchTrackAndReviews();
    } catch (err) {
      setReviewMessage((err as Error).message || "Failed to delete review.");
      setReviewMessageType("error");
      console.error("Review deletion error:", err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleTrackAdded = () => {
    setIsPlaylistModalOpen(false);
  };

  if (loadingTrack) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-white text-center opacity-70 py-10">
        <FaMusic size={48} className="mb-4 text-[#8a2be2]" />
        <p className="text-lg">Loading track details...</p>
      </div>
    );
  }

  if (trackError) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-white text-center opacity-70">
        <FaMusic size={48} className="mb-4 text-red-400" />
        <p className="text-lg">Oops! Something went wrong.</p>
        <p className="text-sm text-red-300">{trackError}</p>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-white text-center opacity-70 py-10">
        <FaMusic size={48} className="mb-4 text-[#8a2be2]" />
        <p className="text-lg">Track not found.</p>
      </div>
    );
  }

  const spotifyEmbedUrl = track.href
    ? track.href.replace(
        "open.spotify.com/track/",
        "open.spotify.com/embed/track/"
      )
    : null;

  const isFavorited = userFavorites.some((fav) => fav.externalId === track.id);

  return (
    <>
      <div className="flex flex-col w-full h-full items-center">
        <Card className="flex flex-col w-full max-w-[900px] bg-slate-800/60 rounded-[20px] p-6 relative">
          <button
            onClick={handleGoBack}
            className="absolute top-4 left-6 text-white/70 hover:text-white bg-transparent p-2 rounded-full"
            title="Go Back"
          >
            <FaArrowLeft size={20} />
          </button>

          <div className="flex flex-col items-center text-center mb-6">
            <img
              src={track.imageUrl || placeholder}
              alt={track.title}
              className="w-32 h-32 rounded-md object-cover border-2 border-[#8a2be2]"
            />
            <h2 className="text-2xl font-bold text-white mb-1 mt-4">
              {track.title}
            </h2>
            <p className="text-base text-white/70 mb-2">
              {track.artistNames?.join(", ") || "Unknown Artist"}
            </p>
            <p className="text-sm text-white/50 mb-4">
              {track.albumName} • {formatDuration(track.durationMs)}
            </p>

            {user && (
              <div className="flex items-center gap-4 mt-2">
                <button
                  onClick={() =>
                    handleFavoriteToggle(
                      track,
                      user,
                      userFavorites,
                      setUserFavorites
                    )
                  }
                  className="flex-shrink-0 p-3 bg-[#8a2be2] rounded-full text-white hover:scale-110 transition-transform"
                  title={
                    isFavorited ? "Remove from Favorites" : "Add to Favorites"
                  }
                >
                  <FaHeart
                    size={20}
                    className={isFavorited ? "text-white" : "text-white/30"}
                    style={{
                      color: isFavorited ? "white" : "rgba(255, 255, 255, 0.3)",
                    }}
                  />
                </button>
                <button
                  onClick={() => setIsPlaylistModalOpen(true)}
                  className="p-3 bg-[#8a2be2] text-white rounded-full hover:bg-[#7a1fd1] transition-colors flex-shrink-0"
                  title="Add to Playlist"
                >
                  <FaPlus size={20} />
                </button>
              </div>
            )}

            {spotifyEmbedUrl && (
              <div className="w-full mt-6 rounded-md overflow-hidden">
                <h3 className="text-white text-lg font-semibold mb-2 text-left">
                  Preview:
                </h3>
                <iframe
                  src={spotifyEmbedUrl}
                  width="100%"
                  height="80"
                  allow="encrypted-media"
                  className="rounded-md"
                  title="Track Preview"
                ></iframe>
              </div>
            )}
          </div>

          <div className="w-full mt-6">
            <div className="flex items-center justify-center gap-4 mb-4 w-full">
              <div className="flex-grow border-t border-white/10"></div>
              <h3 className="text-white font-semibold text-xl whitespace-nowrap">
                Reviews
              </h3>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            {user && !userHasReviewed && (
              <Card className="bg-white/5 border border-white/10 p-4 rounded-xl text-white mb-6">
                <button
                  onClick={() => setIsReviewFormExpanded(!isReviewFormExpanded)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full font-semibold bg-[#8a2be2] text-white hover:bg-[#7a1fd1] transition"
                >
                  <FaPencilAlt size={16} />
                  Write a Review
                </button>

                {isReviewFormExpanded && (
                  <div className="mt-4 animate-fadeInUp">
                    <h4 className="text-lg font-semibold mb-3 text-center">
                      New Review
                    </h4>
                    <div className="flex gap-1 justify-center mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <FaStar
                          key={i}
                          size={28}
                          className={`cursor-pointer transition-colors ${
                            i < userRating
                              ? "text-[#8a2be2]"
                              : "text-white/30 hover:text-white/50"
                          }`}
                          onClick={() => setUserRating(i + 1)}
                        />
                      ))}
                    </div>
                    <textarea
                      value={userComment}
                      onChange={(e) =>
                        setUserComment(
                          e.target.value.slice(0, MAX_COMMENT_LENGTH)
                        )
                      }
                      rows={4}
                      placeholder="Share your thoughts on this track..."
                      className="w-full p-3 rounded-md bg-white/80 text-black placeholder-gray-500 focus:outline-none resize-none"
                    />
                    <p className="text-right text-xs text-white/70 mt-1">
                      {userComment.length}/{MAX_COMMENT_LENGTH}
                    </p>
                    {reviewMessage && (
                      <p
                        className={`text-center mt-2 ${
                          reviewMessageType === "error"
                            ? "text-red-400"
                            : "text-green-400"
                        }`}
                      >
                        {reviewMessage}
                      </p>
                    )}
                    <div className="flex justify-center mt-4">
                      <button
                        onClick={handleSubmitReview}
                        disabled={submittingReview}
                        className="bg-[#8a2be2] text-white py-2.5 px-8 rounded-full font-semibold hover:bg-[#7a1fd1] transition"
                      >
                        {submittingReview ? "Submitting..." : "Submit Review"}
                      </button>
                    </div>
                  </div>
                )}
              </Card>
            )}

            {loadingReviews ? (
              <div className="text-center text-white/70 py-8">
                <p className="text-lg">Loading reviews...</p>
              </div>
            ) : reviewsError ? (
              <div className="text-center text-red-400 py-8">
                <p className="text-lg">Error loading reviews.</p>
                <p className="text-sm text-red-300">{reviewsError}</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center text-white/70 py-8">
                <p className="text-lg">No reviews yet.</p>
                {user ? (
                  <p className="text-sm">Be the first to review this track!</p>
                ) : (
                  <p className="text-sm">Log in to write a review!</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {reviews.map((review) => (
                  <Card
                    key={review.id}
                    className="bg-white/5 border border-white/10 p-4 rounded-xl text-white relative"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={review.profilePicture || placeholder}
                        alt={review.userName}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-[#8a2be2]"
                      />
                      <div className="flex flex-col flex-grow min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-[#8a2be2] truncate">
                            {review.userName}
                          </span>
                          {user && user.id === review.userId && (
                            <button
                              onClick={() => handleDeleteReview(review.id)}
                              className="text-red-400 hover:text-red-300 bg-transparent p-1 rounded-full"
                              title="Delete your review"
                              disabled={submittingReview}
                            >
                              <FaTrashAlt size={16} />
                            </button>
                          )}
                        </div>
                        <div className="flex gap-[2px] mb-2">
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
                        <p className="text-sm opacity-90 whitespace-pre-wrap break-words">
                          {review.comment}
                        </p>
                        <p className="text-xs text-white/50 mt-2">
                          Reviewed on{" "}
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {track && (
        <AddToPlaylistModal
          isOpen={isPlaylistModalOpen}
          onClose={() => setIsPlaylistModalOpen(false)}
          track={track}
          onTrackAdded={handleTrackAdded}
        />
      )}
    </>
  );
}
