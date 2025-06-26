"use client";

import { useEffect, useState } from "react";
import { FaArrowLeft, FaMusic } from "react-icons/fa";
import { Card } from "../ui/Card";
import { useNavigate } from "react-router-dom";
import { fetchArtistAllTracks, type TrackSummaryDto } from "../../lib/api";
import TrackDetailsModal from "../TrackDetailsModal"; // ADDED: Import TrackDetailsModal

type ArtistAllTracksProps = {
  artistId: string;
};

const TRACKS_PER_PAGE = 20; // Define a constant for pagination limit

export default function ArtistAllTracks({ artistId }: ArtistAllTracksProps) {
  const navigate = useNavigate();
  const [tracks, setTracks] = useState<TrackSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0); // State for current page/offset
  const [hasMore, setHasMore] = useState(true); // State to track if more tracks are available

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false); // ADDED: State for track details modal
  const [selectedTrack, setSelectedTrack] = useState<TrackSummaryDto | null>(
    null,
  ); // ADDED: State for selected track

  const loadArtistTracks = async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const offset = page * TRACKS_PER_PAGE;
      console.log(
        `ArtistAllTracks: Fetching tracks for artistId: ${artistId}, page: ${page}, offset: ${offset}`,
      );
      const data = await fetchArtistAllTracks(
        artistId,
        TRACKS_PER_PAGE,
        offset,
      );
      console.log("ArtistAllTracks: Fetched data:", data);

      if (page === 0) {
        setTracks(data.items);
      } else {
        setTracks((prevTracks) => [...prevTracks, ...data.items]);
      }
      setHasMore(data.items.length === TRACKS_PER_PAGE); // If less than limit, no more pages
    } catch (err) {
      setError((err as Error).message || "Failed to load artist tracks.");
      console.error("Error fetching artist tracks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (artistId) {
      setCurrentPage(0); // Reset page when artistId changes
      setTracks([]); // Clear tracks when artistId changes
      setHasMore(true); // Assume more data initially
      loadArtistTracks(0);
    }
  }, [artistId]);

  const handleGoBack = () => {
    navigate(-1); // Go back to the ArtistPage
  };

  const handleLoadMore = () => {
    setCurrentPage((prevPage) => {
      const nextPage = prevPage + 1;
      loadArtistTracks(nextPage);
      return nextPage;
    });
  };

  // ADDED: Function to open track details modal
  const handleTrackClick = (track: TrackSummaryDto) => {
    console.log("Track clicked for details:", track);
    setSelectedTrack(track);
    setIsDetailsModalOpen(true);
  };

  // ADDED: Function to close track details modal
  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedTrack(null);
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${Number.parseInt(seconds) < 10 ? "0" : ""}${seconds}`;
  };

  if (loading && tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-white text-center opacity-70 py-10">
        <FaMusic size={48} className="mb-4 text-[#8a2be2]" />
        <p className="text-lg">Loading all tracks for this artist...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-white text-center opacity-70">
        <FaMusic size={48} className="mb-4 text-red-400" />
        <p className="text-lg">Oops! Something went wrong.</p>
        <p className="text-sm text-red-300">{error}</p>
      </div>
    );
  }

  if (!tracks.length && !loading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-white text-center opacity-70 py-10">
        <FaMusic size={48} className="mb-4 text-[#8a2be2]" />
        <p className="text-lg">No tracks found for this artist.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col w-full h-full items-center">
        <Card className="flex flex-col w-full max-w-[800px] bg-white/5 rounded-[20px] p-6 relative">
          <button
            onClick={handleGoBack}
            className="absolute top-4 left-6 text-white/70 hover:text-white bg-transparent p-2 rounded-full"
            title="Go Back"
          >
            <FaArrowLeft size={20} />
          </button>

          <h2 className="font-extrabold text-4xl text-white text-center mb-6">
            All Tracks
          </h2>

          <div className="w-full">
            <div className="grid grid-cols-1 gap-3">
              {tracks.map((track) => (
                <Card
                  key={track.id}
                  className="bg-white/5 border border-white/10 p-3 rounded-xl text-white flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => handleTrackClick(track)} // ADDED: onClick to open details modal
                >
                  <div>
                    <h4 className="font-semibold text-base truncate">
                      {track.title}
                    </h4>
                    <p className="text-sm opacity-70 truncate">
                      {track.artistNames.join(", ")}
                    </p>
                  </div>
                  <span className="text-sm opacity-70 flex-shrink-0">
                    {formatDuration(track.durationMs)}
                  </span>
                </Card>
              ))}
            </div>
            {hasMore && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleLoadMore}
                  className="bg-[#8a2be2] text-white py-2 px-6 rounded-full font-semibold hover:bg-[#7a1fd1] transition"
                  disabled={loading}
                >
                  {loading ? "Loading More..." : "Load More Tracks"}
                </button>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* ADDED: Track Details Modal */}
      {selectedTrack && (
        <TrackDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={closeDetailsModal}
          track={selectedTrack}
        />
      )}
    </>
  );
}
