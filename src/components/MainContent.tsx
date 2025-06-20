import { Card } from "../components/ui/Card";
import Reviews from "./content/Reviews";
import Welcome from "./content/Welcome";
import Favorites from "./content/Favorites";
import History from "./content/History";
import Playlists from "./content/Playlists";
import Follows from "./content/Follows";
import MyAccount from "./content/MyAccount";
import UserAccount from "./content/UserAccount";
import Results from "./content/Result";

type MainContentProps = {
  selectedSection: string;
  searchQuery?: string;
};

export default function MainContent({
  selectedSection,
  searchQuery,
}: MainContentProps) {
  const renderContent = () => {
    switch (selectedSection.toLowerCase()) {
      case "reviews":
        return <Reviews />;
      case "favorites":
        return <Favorites />;
      case "history":
        return <History />;
      case "playlists":
        return <Playlists />;
      case "follows":
        return <Follows />;
      case "account":
        return <MyAccount />;
      case "follower":
        return <UserAccount />;
      case "results":
        return <Results type="tracks" query={searchQuery ?? ""} />;
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
        <div className="overflow-y-auto flex-grow">{renderContent()}</div>
      </Card>
    </div>
  );
}
