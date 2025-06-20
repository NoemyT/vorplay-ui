import { Card } from "../components/ui/Card";
import {
  TiStarFullOutline,
  TiHeartFullOutline,
  TiNotes,
  TiArchive,
  TiGroup,
} from "react-icons/ti";

type SidebarProps = {
  onSelectSection: (section: string) => void;
};

export default function Sidebar({ onSelectSection }: SidebarProps) {
  const navLinks = [
    { name: "reviews", icon: TiStarFullOutline },
    { name: "favorites", icon: TiHeartFullOutline },
    { name: "playlists", icon: TiNotes },
    { name: "history", icon: TiArchive },
    { name: "follows", icon: TiGroup },
  ];

  return (
    <div
      className="
        w-full px-4 mt-4
        md:fixed md:top-[82px] md:bottom-[10px] md:left-[5px]
        md:w-[284px] md:mt-0
        overflow-y-auto
      "
    >
      <Card
        className="
          bg-[#696969]/40 rounded-[20px]
          flex flex-col justify-between
          px-6 py-4
          md:min-h-[calc(100vh-92px)]
        "
      >
        <div>
          <h2 className="text-[#292928] font-semibold text-[24px] mb-6">
            Your Library
          </h2>

          <nav>
            <ul className="flex flex-col gap-4">
              {navLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <li
                    key={index}
                    onClick={() => onSelectSection(link.name.toLowerCase())}
                    className="cursor-pointer text-[#8a2be2] hover:text-[#6548D5] group"
                  >
                    <div className="flex items-center space-x-2 py-1">
                      <span className="text-base group-hover:scale-110">
                        <Icon />
                      </span>
                      <span className="group-hover:translate-x-1">
                        <span>
                          {link.name.charAt(0).toUpperCase() +
                            link.name.slice(1)}
                        </span>
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
        <div className="text-center text-base text-[#292928] mt-6 shrink-0">
          &copy; {new Date().getFullYear()} Vorplay
        </div>
      </Card>
    </div>
  );
}
