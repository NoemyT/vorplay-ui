import { Link } from "react-router-dom";
import { Card } from "../components/ui/Card";

import logo from "../assets/vorp.png";

export default function LogIn() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <Card className="flex flex-col w-full max-w-[500px] bg-[#696969]/40 rounded-[20px] p-6">
        <div className="flex flex-col items-center gap-2 mb-6">
          <Link to="/">
            <img
              src={logo}
              alt="Logo"
              className="h-[50px] w-auto rounded-full"
            />
          </Link>
          <div className="flex items-center gap-1 font-extrabold text-xl sm:text-2xl text-center">
            <span>Log in to</span>
            <span className="text-[#8a2be2]">Vorplay</span>
          </div>
        </div>

        <form className="flex flex-col gap-5 w-full">
          <input
            type="text"
            placeholder="Email or Username"
            className="p-3 rounded-md bg-white/80 text-black placeholder-gray-500 focus:outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            className="p-3 rounded-md bg-white/80 text-black placeholder-gray-500 focus:outline-none"
          />
          <button
            type="submit"
            className="bg-[#8a2be2] text-white py-2.5 px-10 rounded-full font-semibold hover:bg-[#7a1fd1] transition w-fit self-center"
          >
            Log In
          </button>
        </form>

        <div className="text-center mt-4 text-sm text-white/70">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-[#8a2be2] hover:underline">
            Sign up
          </Link>
        </div>
      </Card>
    </div>
  );
}
