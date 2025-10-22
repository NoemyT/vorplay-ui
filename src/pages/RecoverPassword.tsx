"use client";

import { Link } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { useState } from "react";
import { recover } from "../lib/auth";

import logo from "../assets/vorp.png";

export default function Recovery() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    try {
      setSending(true);
      await recover(email.trim());

      setSuccess(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
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
                src={logo}
                alt="Logo"
                className="h-[60px] w-auto rounded-full ring-2 ring-[#8a2be2]/30"
              />
            </Link>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 font-extrabold text-2xl sm:text-3xl mb-2">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Recover your
              </span>
              <span className="bg-gradient-to-r from-[#8a2be2] to-[#a855f7] bg-clip-text text-transparent">
                password
              </span>
            </div>
            <p
              className={`${
                success ? "text-green-400" : "text-white/60"
              } text-sm`}
            >
              {success
                ? "Check your email for reset instructions"
                : "Enter your email to receive a password reset link"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
          <div className="space-y-4">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="text"
              placeholder="Email"
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
            disabled={sending}
            className="auth-button-modern text-white py-3.5 px-8 rounded-2xl font-semibold w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? "Sending email..." : "Send Email"}
          </button>
        </form>

        <div className="text-center mt-6 text-white/70 text-sm">
          Remembered your password?{" "}
          <Link
            to="/login"
            className="text-[#8a2be2] hover:text-[#a855f7] font-medium"
          >
            Log in
          </Link>
        </div>
      </Card>
    </div>
  );
}
