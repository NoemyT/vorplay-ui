import { Card } from "../components/ui/Card";
import {
  TiStarFullOutline,
  TiHeartFullOutline,
  TiNotes,
  TiArchive,
  TiGroup,
} from "react-icons/ti";

export default function Sidebar() {
  const navLinks = [
    { name: "Reviews", href: "#", icon: TiStarFullOutline },
    { name: "Favorites", href: "#", icon: TiHeartFullOutline },
    { name: "Playlists", href: "#", icon: TiNotes },
    { name: "History", href: "#", icon: TiArchive },
    { name: "Follows", href: "#", icon: TiGroup },
  ];

  return (
    <div
      className="
        w-full px-4 mt-4
        md:fixed md:top-[82px] md:bottom-[10px] md:left-[5px]
        md:w-[284px] md:mt-0
      "
    >
      <Card
        className="
          bg-[#696969]/40 rounded-[20px]
          flex flex-col justify-between
          px-6 py-4
          min-h-[calc(100vh-112px)]
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
                    className="text-[#8a2be2] hover:text-[#6548D5] transition-colors duration-200 cursor-pointer group"
                  >
                    <a
                      href={link.href}
                      className="flex items-center space-x-2 py-1"
                    >
                      <span className="text-base transition-transform duration-200 group-hover:scale-110 motion-reduce:transform-none">
                        <Icon />
                      </span>
                      <span className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transform-none">
                        {link.name}
                      </span>
                    </a>
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
