"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { AuthContext, type User } from "./auth-context";
import { fetchUserProfile } from "../lib/auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loadingInitialAuth, setLoadingInitialAuth] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem("token");

        if (token) {
          const freshUser = await fetchUserProfile(token);
          setUser(freshUser);
        }
      } catch (error) {
        console.error("Failed to load user or refresh token:", error);
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoadingInitialAuth(false);
      }
    };

    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loadingInitialAuth }}>
      {children}
    </AuthContext.Provider>
  );
}
