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
    setOpen?: (open: boolean) => void,
  ) => {
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());

      // Save search query to history if user is logged in
      if (user) {
        const token = localStorage.getItem("token");
        if (token) {
          import("../lib/api").then(({ saveSearchQuery }) => {
            saveSearchQuery(token, searchTerm.trim()).catch((err) => {
              console.error("Failed to save search query:", err);
              // Don't show error to user as this is not critical functionality
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
    <header className="w-full bg-black text-[#8a2be2] relative z-50">
      <div className="w-full px-6 py-4 flex items-center relative h-[60px]">
        {" "}
        {/* Left Section */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link to="/">
            <img
              src={logo || placeholder}
              alt="Logo"
              className="h-10 w-auto rounded-[20px]"
            />
          </Link>
          <span className="font-semibold">Vorplay</span>
        </div>
        {/* Search Bar */}
        <div className="flex-grow flex justify-center mx-4">
          {" "}
          <SearchBar
            onSearch={(query, setOpen) => {
              onSelectSection("results");
              handleSearch(query, setOpen);
            }}
          />
        </div>
        {/* Right Section */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {" "}
          {!user ? (
            <>
              <Link
                to="/signup"
                className="text-[#8a2be2] hover:text-white/80 transition"
              >
                Sign Up
              </Link>
              <Link
                to="/login"
                className="rounded-full px-4 py-1 bg-[#8a2be2] text-white hover:text-black/80 transition"
              >
                Log In
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-2 relative" ref={dropdownRef}>
              <img
                src={user?.profilePicture ?? logo}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="relative">
                <span
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="cursor-pointer font-semibold text-white hover:opacity-80"
                >
                  {user?.name ?? "Account"}
                </span>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 bg-white text-black rounded-md shadow-lg w-36 text-sm">
                    <ul className="flex flex-col py-2">
                      <li
                        onClick={() => onSelectSection("account")}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        Account
                      </li>
                      <li
                        onClick={handleLogout}
                        className="px-4 py-2 hover:bg-gray-100 text-red-600 cursor-pointer"
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
