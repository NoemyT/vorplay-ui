import { Card } from "../components/ui/Card";
import {
  TiStarFullOutline,
  TiHeartFullOutline,
  TiNotes,
  TiArchive,
  TiGroup,
} from "react-icons/ti";
import { useState } from "react";

type SidebarProps = {
  onSelectSection: (section: string) => void;
};

export default function Sidebar({ onSelectSection }: SidebarProps) {
  const [activeSection, setActiveSection] = useState("reviews");
  
  const navLinks = [
    { name: "reviews", icon: TiStarFullOutline, label: "Reviews" },
    { name: "favorites", icon: TiHeartFullOutline, label: "Favorites" },
    { name: "playlists", icon: TiNotes, label: "Playlists" },
    { name: "history", icon: TiArchive, label: "History" },
    { name: "follows", icon: TiGroup, label: "Follows" },
  ];

  const handleSectionClick = (section: string) => {
    setActiveSection(section);
    onSelectSection(section);
  };

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
          bg-slate-800/95 backdrop-blur-sm rounded-[20px]
          flex flex-col justify-between
          px-6 py-4
          md:min-h-[calc(100vh-92px)]
          border border-white/10
        "
      >
        <div>
          <h2 className="text-white font-semibold text-[24px] mb-6">
            Your Library
          </h2>

          <nav>
            <ul className="flex flex-col gap-2">
              {navLinks.map((link, index) => {
                const Icon = link.icon;
                const isActive = activeSection === link.name;
                return (
                  <li
                    key={index}
                    onClick={() => handleSectionClick(link.name)}
                    className={`
                      flex items-center gap-4 p-3 rounded-xl
                      cursor-pointer transition-all duration-200
                      ${isActive 
                        ? 'bg-[#8a2be2]/20 text-[#8a2be2] border border-[#8a2be2]/30' 
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }
                    `}
                  >
                    <Icon
                      size={20}
                      className={`
                        ${isActive ? 'text-[#8a2be2]' : 'text-white/70'}
                        transition-colors duration-200
                      `}
                    />
                    <span className="text-[16px] font-medium capitalize">
                      {link.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div className="pt-4 mt-4 border-t border-white/10">
          <p className="text-white/50 text-sm text-center">
            © 2025 Vorplay
          </p>
        </div>
      </Card>
    </div>
  );
}
