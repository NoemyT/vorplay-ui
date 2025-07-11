import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { useAuth } from "../hooks/use-auth";
import { login, fetchUserProfile } from "../lib/auth";

import logo from "../assets/vorp.png";

export default function LogIn() {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      const data = await login(email.trim(), password);
      localStorage.setItem("token", data.access_token);

      // Get full user profile
      const fullUser = await fetchUserProfile(data.access_token);
      setUser(fullUser);
      localStorage.setItem("user", JSON.stringify(fullUser));

      navigate("/");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

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

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="text"
            placeholder="Email"
            className="p-3 rounded-md bg-white/80 text-black placeholder-gray-500 focus:outline-none"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            className="p-3 rounded-md bg-white/80 text-black placeholder-gray-500 focus:outline-none"
          />

          {error && <p className="text-center text-red-400">{error}</p>}

          <button
            type="submit"
            className="bg-[#8a2be2] text-white py-2.5 px-10 rounded-full font-semibold hover:bg-[#7a1fd1] transition w-fit self-center"
          >
            {loading ? "Logging in…" : "Log In"}
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
