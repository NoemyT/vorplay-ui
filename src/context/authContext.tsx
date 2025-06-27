"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { fetchUserProfile } from "../lib/auth";

export type User = {
  id: number;
  email: string;
  name: string;
  profilePicture?: string;
  createdAt?: string;
};

type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  loadingInitialAuth: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
