"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import { Card } from "../ui/Card";
import { useAuth } from "../../context/authContext";
import { updateUserProfile } from "../../lib/auth";

export default function MyAccount() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(
    null
  );

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setMessageType(null);
    setLoading(true);

    if (password && password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setMessageType("error");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Authentication token missing. Please log in again.");
      setMessageType("error");
      setLoading(false);
      return;
    }

    const updateData: { name: string; email: string; password?: string } = {
      name,
      email,
    };
    if (password) {
      updateData.password = password;
    }

    try {
      const updatedUser = await updateUserProfile(token, updateData);
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setMessage("Profile updated successfully!");
      setMessageType("success");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setMessage((err as Error).message || "Failed to update profile.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-white text-center opacity-70">
        <FaUserCircle size={48} className="mb-4 text-[#8a2be2]" />
        <p className="text-lg">Please log in to view your account details.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full items-center">
      <Card className="flex flex-col w-full max-w-[600px] bg-white/5 rounded-[20px] p-6">
        <div className="flex flex-col items-center gap-2 mb-6">
          <FaUserCircle className="text-[#8a2be2]" size={64} />
          <h2 className="font-extrabold text-3xl text-white">My Account</h2>
          <p className="text-white/70">Manage your profile information.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
          <div>
            <label
              htmlFor="name"
              className="block text-white text-sm font-medium mb-1"
            >
              Username
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="Username"
              className="p-3 rounded-md bg-white/80 text-black placeholder-gray-500 focus:outline-none w-full"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-white text-sm font-medium mb-1"
            >
              Email
            </label>
            <input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Email"
              className="p-3 rounded-md bg-white/80 text-black placeholder-gray-500 focus:outline-none w-full"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-white text-sm font-medium mb-1"
            >
              New Password (leave blank to keep current)
            </label>
            <input
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="New Password"
              className="p-3 rounded-md bg-white/80 text-black placeholder-gray-500 focus:outline-none w-full"
            />
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-white text-sm font-medium mb-1"
            >
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type="password"
              placeholder="Confirm New Password"
              className="p-3 rounded-md bg-white/80 text-black placeholder-gray-500 focus:outline-none w-full"
            />
          </div>

          {message && (
            <p
              className={`text-center ${
                messageType === "error" ? "text-red-400" : "text-green-400"
              }`}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            className="bg-[#8a2be2] text-white py-2.5 px-10 rounded-full font-semibold hover:bg-[#7a1fd1] transition w-fit self-center"
            disabled={loading}
          >
            {loading ? "Updating…" : "Update Profile"}
          </button>
        </form>
      </Card>
    </div>
  );
}
