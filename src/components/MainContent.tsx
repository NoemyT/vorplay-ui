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
import Welcome from "./content/Welcome";

type MainContentProps = {
  selectedSection: string;
  searchQuery?: string;
  userId?: string;
  artistId?: string;
  albumId?: string;
  playlistId?: string;
  onSearch: (query: string) => void;
};

export default function MainContent({
  selectedSection,
  searchQuery,
  userId,
  artistId,
  albumId,
  playlistId,
  onSearch,
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
      case "results":
        return <Results query={searchQuery ?? ""} />;
      default:
        return <Welcome />;
    }
  };

  return (
    <div
      className="
    w-full px-4 mt-4 mb-4 md:mb-0
    flex-1
    md:fixed md:top-[82px] md:bottom-[10px] md:left-[280px]
    md:w-[calc(100%-288px)] md:mt-0
    md:flex md:flex-col
  "
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
