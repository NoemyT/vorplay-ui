"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Card } from "../ui/Card";
import logo from "../../assets/vorp.png";
import {
  FaStar,
  FaUsers,
  FaMusic,
  FaHeart,
  FaList,
  FaUserCircle,
} from "react-icons/fa";
import {
  fetchPlatformStats,
  fetchPublicFeed,
  type PlatformStatsDto,
  type PublicFeedDto,
} from "../../lib/api";
import placeholder from "../../assets/placeholder.svg";

export default function Welcome() {
  const [stats, setStats] = useState<PlatformStatsDto | null>(null);
  const [feed, setFeed] = useState<PublicFeedDto[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [errorStats, setErrorStats] = useState<string | null>(null);
  const [errorFeed, setErrorFeed] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      setLoadingStats(true);
      setErrorStats(null);
      try {
        const data = await fetchPlatformStats();
        setStats(data);
      } catch (err) {
        setErrorStats(
          (err as Error).message || "Failed to load platform stats.",
        );
        console.error("Error fetching platform stats:", err);
      } finally {
        setLoadingStats(false);
      }
    }

    async function loadFeed() {
      setLoadingFeed(true);
      setErrorFeed(null);
      try {
        const data = await fetchPublicFeed(10);
        setFeed(data);
      } catch (err) {
        setErrorFeed((err as Error).message || "Failed to load public feed.");
        console.error("Error fetching public feed:", err);
      } finally {
        setLoadingFeed(false);
      }
    }

    loadStats();
    loadFeed();
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num;
  };

  const renderFeedItem = (item: PublicFeedDto) => {
    const timeAgo = new Date(item.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const getArtistName = (track: PublicFeedDto["track"]) => {
      if (!track) return "Unknown artist";
      return (
        track.artist ||
        (track.artistNames && track.artistNames.join(", ")) ||
        "Unknown artist"
      );
    };

    return (
      <Card
        key={item.id}
        className="bg-slate-800/60 border border-white/10 p-4 rounded-xl text-white flex items-start gap-4 hover:shadow-md hover:shadow-[#8a2be2]/20"
      >
        <img
          src={item.user.profilePicture || placeholder}
          alt={item.user.name}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-[#8a2be2]"
        />
        {/* Album art for reviews and favorites */}
        {(item.type === "review" || item.type === "favorite") &&
          (item.track?.imageUrl || item.track?.coverUrl) && (
            <img
              src={item.track.coverUrl || item.track.imageUrl || placeholder}
              alt={item.track.title}
              className="w-10 h-10 rounded-md object-cover flex-shrink-0"
            />
          )}
        <div className="flex flex-col flex-grow min-w-0">
          <p className="text-sm text-white/70 mb-1 flex flex-wrap items-baseline gap-x-1">
            <span className="font-semibold text-[#8a2be2]">
              {item.user.name}
            </span>{" "}
            {item.action}{" "}
            {item.type === "review" && item.track && (
              <>
                <span className="font-semibold truncate">
                  {item.track.title}
                </span>{" "}
                by <span className="truncate">{getArtistName(item.track)}</span>
              </>
            )}
            {item.type === "favorite" && item.track && (
              <>
                <span className="font-semibold truncate">
                  {item.track.title}
                </span>{" "}
                by <span className="truncate">{getArtistName(item.track)}</span>
              </>
            )}
            {item.type === "playlist" && item.playlist && (
              <>
                playlist{" "}
                <span className="font-semibold truncate">
                  {item.playlist.name.replace(/^playlist\s*/i, "")}
                </span>
                {item.playlist.description && (
                  <span className="text-white/50 truncate">
                    {" "}
                    - {item.playlist.description}
                  </span>
                )}
              </>
            )}
          </p>
          {item.type === "review" && item.rating && (
            <div className="flex gap-[2px] mb-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <FaStar
                  key={i}
                  size={14}
                  className={
                    i < item.rating! ? "text-[#8a2be2]" : "text-white/30"
                  }
                />
              ))}
            </div>
          )}
          {item.type === "review" && item.comment && (
            <p className="text-sm opacity-90 line-clamp-2 break-words">
              {item.comment}
            </p>
          )}
          <p className="text-xs text-white/50 mt-2">{timeAgo}</p>
        </div>
      </Card>
    );
  };

  return (
    <div className="h-full w-full flex flex-col items-center p-4">
      <Card
        className="
        flex flex-col items-center
        justify-center
        gap-1
        w-full max-w-[900px]
        min-h-[250px]
        bg-slate-800/60 backdrop-blur-sm px-6 py-6
        shadow-xl border border-white/10 text-center rounded-[20px] mb-7
        group hover:shadow-xl hover:shadow-[#8a2be2]/20 transition-all duration-300
      "
      >
        <img
          src={logo || placeholder}
          alt="Vorplay Logo"
          className="w-24 h-24 rounded-full mb-2"
        />
        <h1 className="text-[#8a2be2] text-4xl sm:text-5xl font-bold leading-tight">
          Welcome to Vorplay!
        </h1>
        <p className="text-white/80 text-lg sm:text-xl max-w-xl">
          Your ultimate platform for music reviews, personalized playlists, and
          connecting with fellow music lovers.
        </p>
      </Card>

      {/* Platform Statistics Section */}
      <div className="w-full max-w-[900px] mb-8">
        {loadingStats ? (
          <div className="text-center text-white/70">Loading stats...</div>
        ) : errorStats ? (
          <div className="text-center text-red-400">Error: {errorStats}</div>
        ) : stats ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard
              icon={<FaUsers size={24} className="text-[#8a2be2]" />}
              label="Total Users"
              value={formatNumber(stats.totalUsers)}
            />
            <StatCard
              icon={<FaStar size={24} className="text-[#8a2be2]" />}
              label="Total Reviews"
              value={formatNumber(stats.totalReviews)}
            />
            <StatCard
              icon={<FaHeart size={24} className="text-[#8a2be2]" />}
              label="Total Favorites"
              value={formatNumber(stats.totalFavorites)}
            />
            <StatCard
              icon={<FaList size={24} className="text-[#8a2be2]" />}
              label="Total Playlists"
              value={formatNumber(stats.totalPlaylists)}
            />
            <StatCard
              icon={<FaMusic size={24} className="text-[#8a2be2]" />}
              label="Top Tracks"
              value={formatNumber(stats.topRatedTracks)}
            />
            <StatCard
              icon={<FaUserCircle size={24} className="text-[#8a2be2]" />}
              label="Active Users"
              value={formatNumber(stats.mostActiveUsers)}
            />
          </div>
        ) : (
          <div className="text-center text-white/70">No stats available.</div>
        )}
      </div>

      {/* Recent Activity Feed Section */}
      <div className="w-full max-w-[900px] mb-8">
        <div className="flex items-center justify-center gap-4 mb-4 w-full">
          <div className="flex-grow border-t border-white/10"></div>
          <h2 className="text-white font-semibold text-2xl whitespace-nowrap">
            Recent Activity
          </h2>
          <div className="flex-grow border-t border-white/10"></div>
        </div>
        {loadingFeed ? (
          <div className="text-center text-white/70">Loading feed...</div>
        ) : errorFeed ? (
          <div className="text-center text-red-400">Error: {errorFeed}</div>
        ) : feed.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {feed.map(renderFeedItem)}
          </div>
        ) : (
          <div className="text-center text-white/70">No recent activity.</div>
        )}
      </div>
    </div>
  );
}

type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string | number;
};

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <Card
      className="
      bg-slate-800/60 backdrop-blur-sm rounded-[16px] p-4
      text-white shadow-lg border border-white/10
      flex flex-col items-center text-center gap-2 h-full
      justify-center
      transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#8a2be2]/20
    "
    >
      <div className="mb-1">{icon}</div>
      <p className="text-2xl font-bold text-[#8a2be2]">{value}</p>
      <p className="text-sm text-white/70">{label}</p>
    </Card>
  );
}
