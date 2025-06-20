import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/authContext";
import logo from "../assets/vorp.png";
import SearchBar from "../components/SearchBar";

type HeaderProps = {
  onSelectSection: (section: string) => void;
};

export default function Header({ onSelectSection }: HeaderProps) {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navLink = { name: "account" };

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

  return (
    <header className="w-full bg-black text-[#8a2be2] relative z-50">
      <div className="w-full px-6 py-4 flex items-center justify-between relative h-[60px]">
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link to="/">
            <img src={logo} alt="Logo" className="h-10 w-auto rounded-[20px]" />
          </Link>
          <span className="font-semibold">Vorplay</span>
        </div>

        <SearchBar />

        <div className="flex items-center gap-4 flex-shrink-0 relative">
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
                        onClick={() =>
                          onSelectSection(navLink.name.toLowerCase())
                        }
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
