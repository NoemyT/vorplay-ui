import { type User } from "../context/authContext";

const API_BASE = import.meta.env.VITE_API_URL;

export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (res.status === 401) {
    throw new Error("Invalid credentials");
  }

  if (!res.ok) {
    throw new Error("Something went wrong");
  }

  return res.json() as Promise<{
    access_token: string;
    expires_in: number;
    user: User;
  }>;
}

export async function register(name: string, email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  if (res.status === 409) {
    throw new Error("E‑mail already registered");
  }
  if (!res.ok) {
    throw new Error("Could not sign up – try again later");
  }

  return res.json() as Promise<{
    access_token: string;
    expires_in: number;
    user: User;
  }>;
}

export async function fetchUserProfile(token: string) {
  const res = await fetch(`${API_BASE}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch user profile");
  }

  return res.json();
}
