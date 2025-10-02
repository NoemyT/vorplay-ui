"use client";

import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/use-auth";
import logo from "../assets/vorp.png";
import SearchBar from "../components/SearchBar";
import placeholder from "../assets/placeholder.svg";

type HeaderProps = {
  onSelectSection: (section: string) => void;
  onSearch: (query: string) => void;
};

export default function Header({ onSelectSection, onSearch }: HeaderProps) {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("token");
    navigate("/");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDropdownOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSearch = (
    searchTerm: string,
    setOpen?: (open: boolean) => void
  ) => {
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());

      if (user) {
        const token = localStorage.getItem("token");
        if (token) {
          import("../lib/api").then(({ saveSearchQuery }) => {
            saveSearchQuery(token, searchTerm.trim()).catch((err) => {
              console.error("Failed to save search query:", err);
            });
          });
        }
      }

      if (setOpen) {
        setOpen(false);
      }
    }
  };

  return (
    <header className="w-full bg-slate-900/95 backdrop-blur-sm text-white relative z-50 border-b border-white/10">
      <div className="w-full px-6 py-4 flex items-center relative h-[60px]">
        {/* Left Section */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            to="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img
              src={logo || placeholder}
              alt="Logo"
              className="h-10 w-auto rounded-[20px]"
            />
            <span className="font-bold text-[#8a2be2] text-xl">Vorplay</span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="flex-grow flex justify-center mx-4">
          <SearchBar
            onSearch={(query, setOpen) => {
              onSelectSection("results");
              handleSearch(query, setOpen);
            }}
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {!user ? (
            <>
              <Link
                to="/signup"
                className="hidden sm:block text-white/80 hover:text-[#8a2be2] transition-colors font-medium"
              >
                Sign Up
              </Link>
              <Link
                to="/login"
                className="rounded-full px-6 py-2 bg-[#8a2be2] text-white hover:bg-[#7c25cc] transition-all duration-200 font-medium shadow-lg"
              >
                Log In
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3 relative" ref={dropdownRef}>
              <img
                src={user?.profilePicture ?? logo}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover border-2 border-[#8a2be2]"
              />
              <div className="relative">
                <span
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="cursor-pointer font-medium text-white hover:text-[#8a2be2] transition-colors"
                >
                  {user?.name ?? "Account"}
                </span>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 bg-slate-800 text-white rounded shadow-xl w-40 text-sm border border-white/10">
                    <ul className="flex flex-col py-2">
                      <li
                        onClick={() => onSelectSection("account")}
                        className="px-4 py-2 hover:bg-white/10 cursor-pointer transition-colors"
                      >
                        Account
                      </li>
                      <li
                        onClick={handleLogout}
                        className="px-4 py-2 hover:bg-red-500/20 text-red-400 cursor-pointer transition-colors"
                      >
                        Exit
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
