import { Link } from "react-router-dom";
import logo from "../assets/vorp.png";
import SearchBar from "../components/SearchBar";

export default function Header() {
  return (
    <header className="w-full bg-black text-[#8a2be2] relative">
      <div className="w-full px-6 py-4 flex items-center justify-between relative">
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link to="/">
            <img src={logo} alt="Logo" className="h-10 w-auto rounded-[20px]" />
          </Link>
          <span className="font-semibold">Vorplay</span>
        </div>

        <SearchBar />

        <div className="flex items-center gap-4 flex-shrink-0">
          <Link
            to="/signup"
            className="flex items-center gap-1 text-[#8a2be2] hover:text-white/80"
          >
            <span>Sign Up</span>
          </Link>
          <Link
            to="/login"
            className="flex items-center gap-1 rounded-full px-4 py-1 bg-[#8a2be2] text-white hover:text-black/80"
          >
            <span>Log In</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
