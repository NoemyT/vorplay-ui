"use client";

import { createContext } from "react";

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

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);
