"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "../../ui/Card";
import { FaMusic, FaPencilAlt, FaHeart } from "react-icons/fa";
import ReviewModal from "../../ReviewModal";
import { useAuth } from "../../../context/authContext";
import {
  fetchUserReviews,
  type Review,
  fetchUserFavorites,
  addFavorite,
  type Favorite,
} from "../../../lib/api";

type TrackSummaryDto = {
  id: string;
  title: string;
  artistNames: string[];
  albumName: string;
  imageUrl?: string;
  durationMs: number;
};

type TracksProps = {
  tracks: TrackSummaryDto[];
  query: string;
};

export default function Tracks({ tracks, query }: TracksProps) {
  const { user } = useAuth();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<TrackSummaryDto | null>(
    null
  );
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [userFavorites, setUserFavorites] = useState<Favorite[]>([]);

  const refreshUserData = useCallback(async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem("token");
      if (token) {
        console.log("Refreshing user data...");
        const [reviews, favorites] = await Promise.all([
          fetchUserReviews(token, user.id),
          fetchUserFavorites(token, user.id),
        ]);
        console.log("Fresh user reviews:", reviews);
        console.log("Fresh user favorites:", favorites);
        setUserReviews(reviews);
        setUserFavorites(favorites);
      }
    } catch (err) {
      console.error("Failed to refresh user data:", err);
    }
  }, [user]);

  useEffect(() => {
    async function loadUserData() {
      if (user) {
        await refreshUserData();
      } else {
        setUserReviews([]);
        setUserFavorites([]);
      }
    }
    loadUserData();
  }, [user, refreshUserData]);

  const handleReviewClick = (track: TrackSummaryDto) => {
    setSelectedTrack(track);
    const review = userReviews.find((r) => r.trackId === track.id);
    setExistingReview(review || null);
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmitted = (newOrUpdatedReview: Review) => {
    setUserReviews((prevReviews) => {
      const existingIndex = prevReviews.findIndex(
        (r) => r.id === newOrUpdatedReview.id
      );
      if (existingIndex > -1) {
        return prevReviews.map((r, index) =>
          index === existingIndex ? newOrUpdatedReview : r
        );
      } else {
        return [...prevReviews, newOrUpdatedReview];
      }
    });
  };

  const handleFavoriteToggle = async (track: TrackSummaryDto) => {
    console.log(`=== FAVORITE TOGGLE START ===`);
    console.log(`Track: ${track.title} (ID: ${track.id})`);
    console.log("Current userFavorites state:", userFavorites);

    if (!user) {
      alert("You must be logged in to favorite tracks.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Authentication token missing. Please log in again.");
      return;
    }

    const existingFavorite = userFavorites.find(
      (fav) => fav.trackId === track.id
    );
    const isCurrentlyFavorited = !!existingFavorite;

    console.log(`Existing favorite found:`, existingFavorite);
    console.log(`Is currently favorited: ${isCurrentlyFavorited}`);

    if (isCurrentlyFavorited) {
      alert(
        "This song is already in your favorites. You can remove it from the Favorites tab."
      );
      return;
    }

    try {
      console.log("Adding to favorites...");
      const newFavorite = await addFavorite(token, {
        trackId: track.id,
        title: track.title,
        artistNames: track.artistNames,
        albumName: track.albumName,
        imageUrl: track.imageUrl,
      });

      console.log("New favorite created:", newFavorite);

      setUserFavorites((prev) => {
        const updated = [...prev, newFavorite];
        console.log("Updated userFavorites state:", updated);
        return updated;
      });

      alert("Song added to favorites!");
      console.log(`=== FAVORITE TOGGLE END (SUCCESS) ===`);
    } catch (err) {
      console.error("Favorite add error:", err);
      alert((err as Error).message || "Failed to add to favorites.");
      console.log(`=== FAVORITE TOGGLE END (ERROR) ===`);
    }
  };

  console.log(
    "Tracks component rendering with userFavorites (current state):",
    userFavorites
  );

  if (!tracks.length) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-white text-center opacity-70 py-10">
        <FaMusic size={48} className="mb-4 text-[#8a2be2]" />
        <p className="text-lg">No tracks found for "{query}".</p>
      </div>
    );
  }

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${Number.parseInt(seconds) < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4">
        {tracks.map((track) => {
          const isFavorited = userFavorites.some(
            (fav) => fav.trackId === track.id
          );
          const hasReviewed = userReviews.some((r) => r.trackId === track.id);

          console.log(
            `Track: ${track.title}, ID: ${track.id}, isFavorited: ${isFavorited}`
          );

          return (
            <Card
              key={track.id}
              className="bg-white/5 border border-white/10 p-4 rounded-xl text-white flex items-center gap-4 hover:bg-white/10 transition-colors relative"
            >
              {user && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFavoriteToggle(track);
                  }}
                  className="flex-shrink-0 p-1 bg-black rounded-full text-white hover:scale-110 transition-transform"
                  title={
                    isFavorited ? "Already in Favorites" : "Add to Favorites"
                  }
                >
                  <FaHeart
                    size={16}
                    className={isFavorited ? "text-[#8a2be2]" : "text-white/50"}
                    style={{
                      color: isFavorited
                        ? "#8a2be2"
                        : "rgba(255, 255, 255, 0.5)",
                    }}
                  />
                </button>
              )}

              <div className="flex-grow">
                <h3 className="text-lg font-semibold truncate">
                  {track.title}
                </h3>
                <p className="text-sm opacity-80 truncate">
                  {track.artistNames.join(", ")} • {track.albumName}
                </p>
              </div>
              <span className="text-sm opacity-70 flex-shrink-0">
                {formatDuration(track.durationMs)}
              </span>

              {user && (
                <button
                  onClick={() => handleReviewClick(track)}
                  className="ml-4 p-2 bg-[#8a2be2] text-white rounded-full hover:bg-[#7a1fd1] transition-colors flex-shrink-0"
                  title={hasReviewed ? "Edit Review" : "Write a Review"}
                >
                  <FaPencilAlt size={16} />
                </button>
              )}
            </Card>
          );
        })}
      </div>

      {selectedTrack && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          track={selectedTrack}
          existingReview={existingReview}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </>
  );
}
