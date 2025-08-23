"use client";

import { Card } from "../components/ui/Card";
import {
  TiStarFullOutline,
  TiHeartFullOutline,
  TiNotes,
  TiArchive,
  TiGroup,
} from "react-icons/ti";
import { TbLayoutSidebarLeftCollapse } from "react-icons/tb";
import { RiMenuFill, RiMenuUnfold4Line } from "react-icons/ri";
import { useState, useEffect } from "react";

type SidebarProps = {
  onSelectSection: (section: string) => void;
  collapsed: boolean;
  onToggle: () => void;
};

export default function Sidebar({
  onSelectSection,
  collapsed,
  onToggle,
}: SidebarProps) {
  const [activeSection, setActiveSection] = useState("reviews");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        mobileMenuOpen &&
        !target.closest(".mobile-sidebar-modal") &&
        !target.closest(".mobile-library-trigger")
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileMenuOpen]);

  return (
    <>
      {/* PC Sidebar */}
      <div
        className={`
        hidden md:block
        w-full px-4 mt-4 transition-all duration-300 ease-in-out
        md:fixed md:top-[82px] md:bottom-[10px]
        md:mt-0 overflow-y-auto
        ${collapsed ? "md:w-[95px]" : "md:w-[284px] md:left-[5px]"}
      `}
      >
        <Card
          className={`
          bg-slate-800/95 backdrop-blur-sm rounded-[20px]
          flex flex-col justify-between
          md:min-h-[calc(100vh-92px)]
          border border-white/10
          transition-all duration-300 ease-in-out
          ${collapsed ? "px-2 py-4" : "px-6 py-4"}
        `}
        >
          <div>
            {/* Header */}
            <div
              className={`flex items-center mb-6 ${
                collapsed ? "justify-center" : "justify-between"
              }`}
            >
              {!collapsed && (
                <h2 className="text-white font-semibold text-[24px]">
                  Your Library
                </h2>
              )}
              <div
                onClick={onToggle}
                className="hidden md:flex items-center justify-center cursor-pointer text-white/70 hover:text-white transition-colors"
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? (
                  <RiMenuFill size={24} />
                ) : (
                  <TbLayoutSidebarLeftCollapse size={24} />
                )}
              </div>
            </div>

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
                      flex items-center
                      cursor-pointer transition-all duration-200
                      ${
                        collapsed
                          ? "justify-center p-3 w-full rounded-full"
                          : "gap-4 p-3 rounded-xl"
                      }
                      ${
                        isActive
                          ? "bg-[#8a2be2]/20 text-[#8a2be2] border border-[#8a2be2]/30"
                          : "text-white/80 hover:bg-white/10 hover:text-white"
                      }
                    `}
                      title={collapsed ? link.label : undefined}
                    >
                      <Icon
                        size={20}
                        className={`
                        ${isActive ? "text-[#8a2be2]" : "text-white/70"}
                        transition-colors duration-200
                        ${collapsed ? "mx-auto" : ""}
                      `}
                      />
                      {!collapsed && (
                        <span className="text-[16px] font-medium capitalize">
                          {link.label}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {!collapsed && (
            <div className="pt-4 mt-4 border-t border-white/10">
              <p className="text-white/50 text-sm text-center">
                © 2025 Vorplay
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Mobile Sidebar */}
      <div className="md:hidden fixed bottom-4 left-4 z-40">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="mobile-library-trigger bg-slate-800/95 backdrop-blur-sm border border-white/10 p-3 cursor-pointer hover:bg-slate-700/95 transition-colors"
        >
          <RiMenuFill size={24} className="text-white/70" />
        </button>
      </div>

      {/* Mobile Sidebar Modal Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="mobile-sidebar-modal bg-slate-800/95 backdrop-blur-sm border border-white/10 w-full max-w-sm max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              {/* Mobile Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-semibold text-[24px]">
                  Your Library
                </h2>
                <RiMenuUnfold4Line
                  size={24}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white/70 hover:text-white transition-colors cursor-pointer"
                ></RiMenuUnfold4Line>
              </div>

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
                          ${
                            isActive
                              ? "bg-[#8a2be2]/20 text-[#8a2be2] border border-[#8a2be2]/30"
                              : "text-white/80 hover:bg-white/10 hover:text-white"
                          }
                        `}
                      >
                        <Icon
                          size={20}
                          className={`
                            ${isActive ? "text-[#8a2be2]" : "text-white/70"}
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

              <div className="pt-4 mt-4 border-t border-white/10">
                <p className="text-white/50 text-sm text-center">
                  © 2025 Vorplay
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
