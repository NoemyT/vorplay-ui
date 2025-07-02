"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { AuthContext, type User } from "./auth-context";
import { fetchUserProfile } from "../lib/auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loadingInitialAuth, setLoadingInitialAuth] = useState(true);

  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const token = localStorage.getItem("token");
        const storedUserString = localStorage.getItem("user");

        if (token && storedUserString) {
          const freshUser = await fetchUserProfile(token);
          setUser(freshUser);
        }
      } catch (error) {
        console.error(
          "Failed to load user from storage or refresh token:",
          error,
        );
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoadingInitialAuth(false);
      }
    };

    loadUserFromStorage();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loadingInitialAuth }}>
      {children}
    </AuthContext.Provider>
  );
}
