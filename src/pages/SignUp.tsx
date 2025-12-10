"use client";

import type React from "react";

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { register, fetchUserProfile } from "../lib/auth";
import { useAuth } from "../hooks/use-auth";

import logo from "../assets/vorp.png";

export default function SignUp() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 3 || name.trim().length > 15) {
      setError("Username must be between 3 and 15 characters");
      return;
    }

    if (password.trim().length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const data = await register(name.trim(), email.trim(), password);
      localStorage.setItem("token", data.access_token);

      const fullUser = await fetchUserProfile(data.access_token);
      setUser(fullUser);

      navigate("/");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <Card className="auth-card-modern flex flex-col w-full max-w-[420px] rounded-[24px] p-8">
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-[#8a2be2]/20 rounded-full blur-lg"></div>
            <Link to="/" className="relative block">
              <img
                src={logo || "/placeholder.svg"}
                alt="Logo"
                className="h-[60px] w-auto rounded-full ring-2 ring-[#8a2be2]/30"
              />
            </Link>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 font-extrabold text-2xl sm:text-3xl mb-2">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Sign up to
              </span>
              <span className="bg-gradient-to-r from-[#8a2be2] to-[#a855f7] bg-clip-text text-transparent">
                Vorplay
              </span>
            </div>
            <p className="text-white/60 text-sm">
              Join the ultimate music community
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
          <div className="space-y-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="Username"
              className="auth-input-modern w-full p-4 rounded-2xl text-white placeholder-white/50 focus:outline-none"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="text"
              placeholder="Email"
              className="auth-input-modern w-full p-4 rounded-2xl text-white placeholder-white/50 focus:outline-none"
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Password"
              className="auth-input-modern w-full p-4 rounded-2xl text-white placeholder-white/50 focus:outline-none"
            />
            <input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              type="password"
              placeholder="Confirm Password"
              className="auth-input-modern w-full p-4 rounded-2xl text-white placeholder-white/50 focus:outline-none"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 backdrop-blur-sm">
              <p className="text-center text-red-300 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="auth-button-modern text-white py-3.5 px-8 rounded-2xl font-semibold w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="text-center mt-6 text-white/70 text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#8a2be2] hover:text-[#a855f7] font-medium"
          >
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  );
}
