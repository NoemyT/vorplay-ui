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
  type Favorite,
} from "../../../lib/api";
import { handleFavoriteToggle } from "../../../lib/utils"; // Corrected import for handleFavoriteToggle

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
    null,
  );
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [userFavorites, setUserFavorites] = useState<Favorite[]>([]);
  // REMOVED: existingReviewForModal state is no longer needed

  const refreshUserData = useCallback(async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem("token");
      if (token) {
        console.log("--- Refreshing User Data ---");
        const [reviews, favorites] = await Promise.all([
          fetchUserReviews(token, user.id),
          fetchUserFavorites(token, user.id),
        ]);
        console.log("Fetched user reviews:", reviews); // Log fetched reviews
        console.log("Fetched user favorites:", favorites); // Log fetched favorites
        setUserReviews(reviews);
        setUserFavorites(favorites);
        console.log("--- User Data Refreshed ---");
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
    // REMOVED: No need to find existing review here, as modal only creates new ones
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmitted = () => {
    // MODIFIED: Removed newReview parameter
    console.log("Review submitted, refreshing user data...");
    refreshUserData(); // This will re-fetch and update the list, causing button to disappear
  };

  console.log("Current userReviews state in Tracks component:", userReviews); // Log current state
  console.log(
    "Current userFavorites state in Tracks component:",
    userFavorites,
  ); // Log current state

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
            (fav) => fav.trackId === track.id,
          );
          const hasReviewed = userReviews.some((r) => {
            // MODIFIED: Use r.externalId for comparison, assuming backend provides it
            console.log(
              `Checking track ${track.title} (ID: ${track.id}): Review externalId=${r.externalId}, Review ID=${r.id}`,
            );
            return r.externalId === track.id;
          });

          console.log(
            `Track: ${track.title}, ID: ${track.id}, hasReviewed: ${hasReviewed}`,
          ); // Final check for each track

          return (
            <Card
              key={track.id}
              className="bg-white/5 border border-white/10 p-4 rounded-xl text-white flex items-center gap-4 hover:bg-white/10 transition-colors relative"
            >
              {user && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // MODIFIED: Pass user object to handleFavoriteToggle
                    handleFavoriteToggle(
                      track,
                      user,
                      userFavorites,
                      setUserFavorites,
                    );
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

              {user &&
                !hasReviewed && ( // MODIFIED: Button only shows if user is logged in AND hasn't reviewed
                  <button
                    onClick={() => handleReviewClick(track)}
                    className="ml-4 p-2 bg-[#8a2be2] text-white rounded-full hover:bg-[#7a1fd1] transition-colors flex-shrink-0"
                    title="Write a Review" // MODIFIED: Simplified title
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
          onReviewSubmitted={handleReviewSubmitted}
          // REMOVED: existingReview prop is no longer passed
        />
      )}
    </>
  );
}
