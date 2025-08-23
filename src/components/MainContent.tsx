"use client";

import { Card } from "../components/ui/Card";
import Reviews from "./content/Reviews";
import Favorites from "./content/Favorites";
import History from "./content/History";
import Playlists from "./content/Playlists";
import Follows from "./content/Follows";
import MyAccount from "./content/MyAccount";
import UserAccount from "./content/UserAccount";
import Results from "./content/Results";
import AlbumDetails from "./content/AlbumDetails";
import ArtistPage from "./content/ArtistPage";
import PlaylistDetails from "./content/PlaylistDetails";
import TrackDetailsPage from "./content/TrackDetailsPage";
import Welcome from "./content/Welcome";

type MainContentProps = {
  selectedSection: string;
  searchQuery?: string;
  userId?: string;
  artistId?: string;
  albumId?: string;
  playlistId?: string;
  trackId?: string;
  onSearch: (query: string) => void;
  sidebarCollapsed: boolean;
};

export default function MainContent({
  selectedSection,
  searchQuery,
  userId,
  artistId,
  albumId,
  playlistId,
  trackId,
  onSearch,
  sidebarCollapsed,
}: MainContentProps) {
  const renderContent = () => {
    switch (selectedSection.toLowerCase()) {
      case "reviews":
        return <Reviews />;
      case "favorites":
        return <Favorites />;
      case "history":
        return <History onSearch={onSearch} />;
      case "playlists":
        return <Playlists />;
      case "follows":
        return <Follows />;
      case "account":
        return <MyAccount />;
      case "user":
        return userId ? (
          <UserAccount userId={userId} />
        ) : (
          <p className="text-white">User ID not provided.</p>
        );
      case "artist":
        return artistId ? (
          <ArtistPage artistId={artistId} />
        ) : (
          <p className="text-white">Artist ID not provided.</p>
        );
      case "album":
        return albumId && artistId ? (
          <AlbumDetails albumId={albumId} artistId={artistId} />
        ) : (
          <p className="text-white">Album or Artist ID not provided.</p>
        );
      case "playlist":
        return playlistId ? (
          <PlaylistDetails playlistId={playlistId} />
        ) : (
          <p className="text-white">Playlist ID not provided.</p>
        );
      case "track":
        return trackId ? (
          <TrackDetailsPage trackId={trackId} />
        ) : (
          <p className="text-white">Track ID not provided.</p>
        );
      case "results":
        return <Results query={searchQuery ?? ""} />;
      default:
        return <Welcome />;
    }
  };

  return (
    <div
      className={`
        w-full px-4 mt-4 mb-4 md:mb-0 flex-1 transition-all duration-300
        md:fixed md:top-[82px] md:bottom-[10px]
        md:flex md:flex-col md:mt-0
        ${
          sidebarCollapsed
            ? "md:left-[80px] md:w-[calc(100%-83px)]"
            : "md:left-[280px] md:w-[calc(100%-288px)]"
        }
      `}
    >
      <Card
        className="
      bg-[#696969]/40 rounded-[20px]
      flex flex-col flex-grow
      px-6 py-4 h-full
      min-h-[364px]
    "
      >
        <div className="flex flex-col items-center justify-center overflow-y-auto flex-grow">
          {renderContent()}
        </div>
      </Card>
    </div>
  );
}
