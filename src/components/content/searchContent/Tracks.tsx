"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "../../ui/Card";
import { FaMusic, FaHeart, FaPlus } from "react-icons/fa";
import AddToPlaylistModal from "../../AddToPlaylistModal";
import { useAuth } from "../../../../src/hooks/use-auth"; // Corrected import path
import { useNavigate, createSearchParams } from "react-router-dom";
import {
  fetchUserFavorites,
  type Favorite,
  type TrackSummaryDto,
} from "../../../../src/lib/api"; // Corrected import path
import { handleFavoriteToggle } from "../../../../src/lib/utils"; // Corrected import path
import placeholder from "../../../assets/placeholder.svg"; // Corrected import path

type TracksProps = {
  tracks: TrackSummaryDto[];
  query: string;
};

export default function Tracks({ tracks, query }: TracksProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<TrackSummaryDto | null>(
    null,
  );
  const [userFavorites, setUserFavorites] = useState<Favorite[]>([]);

  const refreshUserData = useCallback(async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem("token");
      if (token) {
        const favorites = await fetchUserFavorites(token, user.id);
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
        setUserFavorites([]);
      }
    }
    loadUserData();
  }, [user, refreshUserData]);

  const handlePlaylistClick = (track: TrackSummaryDto) => {
    setSelectedTrack(track);
    setIsPlaylistModalOpen(true);
  };

  const handleTrackAdded = () => {
    // Playlist refresh logic if needed
  };

  const handleTrackClick = (track: TrackSummaryDto) => {
    navigate({
      pathname: "/",
      search: createSearchParams({
        section: "track",
        trackId: track.id,
      }).toString(),
    });
  };

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
          const isFavorited = userFavorites.some((fav) => {
            return fav.externalId === track.id;
          });

          return (
            <Card
              key={track.id}
              className="bg-white/5 border border-white/10 p-4 rounded-xl text-white flex flex-col xs:flex-row items-start xs:items-center gap-4 hover:bg-white/10 transition-colors relative cursor-pointer"
              onClick={() => handleTrackClick(track)}
            >
              {/* Album Art Image */}
              <img
                src={track.imageUrl || placeholder}
                alt={track.title}
                className="w-12 h-12 rounded-md object-cover flex-shrink-0"
              />

              <div className="flex flex-col xs:flex-row flex-grow min-w-0 xs:items-center justify-between">
                {/* Track Info (Title, Artist, Album) */}
                <div className="flex flex-col flex-grow min-w-0">
                  <h3 className="text-lg font-semibold line-clamp-1">
                    {track.title}
                  </h3>
                  <p className="text-sm opacity-80 line-clamp-2">
                    {track.artistNames?.join(", ") || "Unknown Artist"} •{" "}
                    {track.albumName}
                  </p>
                </div>

                {/* Duration and Buttons Group */}
                {user && (
                  <div className="flex items-center gap-2 flex-shrink-0 mt-1">
                    <span className="text-sm opacity-70 flex-shrink-0">
                      {formatDuration(track.durationMs)}
                    </span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Favorite button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFavoriteToggle(
                            track,
                            user,
                            userFavorites,
                            setUserFavorites,
                          );
                        }}
                        className="flex-shrink-0 p-2 bg-[#8a2be2] rounded-full text-white hover:scale-110 transition-transform"
                        title={
                          isFavorited
                            ? "Already in Favorites"
                            : "Add to Favorites"
                        }
                      >
                        <FaHeart
                          size={18}
                          className={
                            isFavorited ? "text-white" : "text-white/30"
                          }
                          style={{
                            color: isFavorited
                              ? "white"
                              : "rgba(255, 255, 255, 0.3)",
                          }}
                        />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlaylistClick(track);
                        }}
                        className="p-2 bg-[#8a2be2] text-white rounded-full hover:bg-[#7a1fd1] transition-colors flex-shrink-0"
                        title="Add to Playlist"
                      >
                        <FaPlus size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {selectedTrack && (
        <AddToPlaylistModal
          isOpen={isPlaylistModalOpen}
          onClose={() => setIsPlaylistModalOpen(false)}
          track={selectedTrack}
          onTrackAdded={handleTrackAdded}
        />
      )}
    </>
  );
}
