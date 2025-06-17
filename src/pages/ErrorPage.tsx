import { Link } from "react-router-dom";

import logo from "../assets/vorp.png";

export default function ErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white px-4">
      <div className="flex items-center justify-center text-[250px] font-extrabold mb-6">
        <span className="text-[#8a2be2]">4</span>
        <img
          src={logo}
          alt="Logo"
          className="h-[250px] w-[250px] rounded-full mx-2"
        />
        <span className="text-[#8a2be2]">4</span>
      </div>

      <div className="text-center text-lg sm:text-xl mb-6">
        Page not found. Return to home?
      </div>

      <Link
        to="/"
        className="bg-[#8a2be2] hover:bg-[#7a1fd1] text-white font-semibold py-2 px-6 rounded-md transition"
      >
        Home
      </Link>
    </div>
  );
}
