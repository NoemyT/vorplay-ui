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
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"tracks" | "artists" | "users">(
    "tracks"
  );

  useEffect(() => {
    if (!query) {
      setTracks([]);
      setArtists([]);
      setUsers([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const fetchAllResults = async () => {
      try {
        const [tracksRes, artistsRes, usersRes] = await Promise.all([
          fetch(
            `${
              import.meta.env.VITE_API_URL
            }/tracks/search?query=${encodeURIComponent(query)}`
          ),
          fetch(
            `${
              import.meta.env.VITE_API_URL
            }/artists/search?query=${encodeURIComponent(query)}`
          ),
          fetch(
            `${
              import.meta.env.VITE_API_URL
            }/users/search?query=${encodeURIComponent(query)}`
          ),
        ]);

        if (!tracksRes.ok)
          throw new Error(`Error fetching tracks: ${tracksRes.status}`);
        if (!artistsRes.ok)
          throw new Error(`Error fetching artists: ${artistsRes.status}`);
        if (!usersRes.ok)
          throw new Error(`Error fetching users: ${usersRes.status}`);

        const tracksData = await tracksRes.json();
        const artistsData = await artistsRes.json();
        const usersData = await usersRes.json();

        setTracks(tracksData.items || []);
        setArtists(artistsData.items || []);
        setUsers(usersData || []); // Users endpoint returns array directly
      } catch (err) {
        if (err instanceof Error) setError(err.message);
        else setError("Unknown error during search");
      } finally {
        setLoading(false);
      }
    };

    fetchAllResults();
  }, [query]);

  const renderContent = () => {
    if (loading)
      return <p className="text-white">Loading results for "{query}"...</p>;
    if (error) return <p className="text-red-400">Error: {error}</p>;
    if (!query)
      return (
        <p className="text-white">
          Start typing to search for tracks, artists, or users.
        </p>
      );

    switch (activeTab) {
      case "tracks":
        return <Tracks tracks={tracks} query={query} />;
      case "artists":
        return <Artists artists={artists} query={query} />;
      case "users":
        return <Users users={users} query={query} />;
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
      <div className="flex gap-4 mb-4 overflow-x-auto pb-2">
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
      {/* Added min-h-0 to ensure flex-grow behaves correctly within a flex column */}
      <div className="flex-grow overflow-y-auto pr-2 min-h-0">
        {renderContent()}
      </div>
    </div>
  );
}
