"use client";

import { useState, useEffect } from "react";
import Tracks from "./searchContent/Tracks";
import Artists from "./searchContent/Artists";
import Users from "./searchContent/Users";
import type { User } from "../../context/authContext";

type TrackSummaryDto = {
  id: string;
  title: string;
  artistNames: string[];
  albumName: string;
  imageUrl?: string;
  durationMs: number;
};

type ArtistSummaryDto = {
  id: string;
  name: string;
  externalUrl: string;
  imageUrl?: string;
};

type ResultsProps = {
  query: string;
};

export default function Results({ query }: ResultsProps) {
  const [tracks, setTracks] = useState<TrackSummaryDto[]>([]);
  const [artists, setArtists] = useState<ArtistSummaryDto[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null); // Specific error for tracks
  const [artistError, setArtistError] = useState<string | null>(null); // Specific error for artists
  const [userError, setUserError] = useState<string | null>(null); // Specific error for users
  const [activeTab, setActiveTab] = useState<"tracks" | "artists" | "users">(
    "tracks",
  );

  useEffect(() => {
    if (!query) {
      setTracks([]);
      setArtists([]);
      setUsers([]);
      setTrackError(null);
      setArtistError(null);
      setUserError(null);
      return;
    }

    setLoading(true);
    setTrackError(null);
    setArtistError(null);
    setUserError(null);

    const fetchAllResults = async () => {
      const trackPromise = fetch(
        `${
          import.meta.env.VITE_API_URL
        }/tracks/search?query=${encodeURIComponent(query)}`,
      );
      const artistPromise = fetch(
        `${
          import.meta.env.VITE_API_URL
        }/artists/search?query=${encodeURIComponent(query)}`,
      );
      const userPromise = fetch(
        `${
          import.meta.env.VITE_API_URL
        }/users/search?query=${encodeURIComponent(query)}`,
      );

      const results = await Promise.allSettled([
        trackPromise,
        artistPromise,
        userPromise,
      ]);

      // Process Tracks
      if (results[0].status === "fulfilled") {
        const tracksRes = results[0].value;
        if (tracksRes.ok) {
          const tracksData = await tracksRes.json();
          setTracks(tracksData.items || []);
        } else {
          setTrackError(`Error fetching tracks: ${tracksRes.status}`);
          setTracks([]);
        }
      } else {
        setTrackError(
          `Network error fetching tracks: ${
            results[0].reason?.message || "Unknown error"
          }`,
        );
        setTracks([]);
      }

      // Process Artists
      if (results[1].status === "fulfilled") {
        const artistsRes = results[1].value;
        if (artistsRes.ok) {
          const artistsData = await artistsRes.json();
          setArtists(artistsData.items || []);
        } else {
          setArtistError(`Error fetching artists: ${artistsRes.status}`);
          setArtists([]);
        }
      } else {
        setArtistError(
          `Network error fetching artists: ${
            results[1].reason?.message || "Unknown error"
          }`,
        );
        setArtists([]);
      }

      // Process Users
      if (results[2].status === "fulfilled") {
        const usersRes = results[2].value;
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData || []);
        } else {
          setUserError(`Error fetching users: ${usersRes.status}`);
          setUsers([]);
        }
      } else {
        setUserError(
          `Network error fetching users: ${
            results[2].reason?.message || "Unknown error"
          }`,
        );
        setUsers([]);
      }

      setLoading(false);
    };

    fetchAllResults();
  }, [query]);

  const renderContent = () => {
    if (loading)
      return <p className="text-white">Loading results for "{query}"...</p>;
    if (!query)
      return (
        <p className="text-white">
          Start typing to search for tracks, artists, or users.
        </p>
      );

    // Display specific errors if they exist, otherwise render content
    switch (activeTab) {
      case "tracks":
        return trackError ? (
          <p className="text-red-400">Error fetching tracks: {trackError}</p>
        ) : (
          <Tracks tracks={tracks} query={query} />
        );
      case "artists":
        return artistError ? (
          <p className="text-red-400">Error fetching artists: {artistError}</p>
        ) : (
          <Artists artists={artists} query={query} />
        );
      case "users":
        return userError ? (
          <p className="text-red-400">Error fetching users: {userError}</p>
        ) : (
          <Users users={users} query={query} />
        );
      default:
        return null;
    }
  };

  const tabs: {
    name: string;
    type: "tracks" | "artists" | "users";
    count: number;
  }[] = [
    { name: "Tracks", type: "tracks", count: tracks.length },
    { name: "Artists", type: "artists", count: artists.length },
    { name: "Users", type: "users", count: users.length },
  ];

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex gap-4 mb-2 overflow-x-auto pb-1 flex-shrink-0">
        {" "}
        {tabs.map((tab) => (
          <button
            key={tab.type}
            onClick={() => setActiveTab(tab.type)}
            className={`
              px-4 py-2 rounded-full text-sm font-semibold
              ${
                activeTab === tab.type
                  ? "bg-[#8a2be2] text-white"
                  : "bg-neutral-800 text-white/70 hover:bg-neutral-700"
              }
              whitespace-nowrap
            `}
          >
            {tab.name} ({tab.count})
          </button>
        ))}
      </div>
      <div className="flex-grow overflow-y-auto mt-1 pr-2 min-h-0">
        {renderContent()}
      </div>
    </div>
  );
}
