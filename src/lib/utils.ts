import type React from "react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  addFavorite,
  removeFavorite,
  type Favorite,
  type TrackSummaryDto,
} from "./api";
import type { User } from "../context/auth-context";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function handleFavoriteToggle(
  track: TrackSummaryDto,
  user: User | null,
  userFavorites: Favorite[],
  setUserFavorites: React.Dispatch<React.SetStateAction<Favorite[]>>
) {
  if (!user) {
    alert("You must be logged in to favorite tracks.");
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Authentication token missing. Please log in again.");
    return;
  }

  const existingFavorite = userFavorites.find(
    (fav) => fav.externalId === track.id
  );
  const isCurrentlyFavorited = !!existingFavorite;

  if (isCurrentlyFavorited) {
    if (
      typeof existingFavorite?.trackId === "undefined" ||
      existingFavorite?.trackId === null
    ) {
      console.error("Favorite trackId missing for removal.");
      alert("Cannot remove favorite: Track ID not found.");
      return;
    }
    try {
      await removeFavorite(token, existingFavorite.trackId); // MODIFIED: Pass the 'trackId'

      setUserFavorites((prev) => {
        const updated = prev.filter((fav) => fav.id !== existingFavorite.id);
        return updated;
      });
      alert("Song removed from favorites!");
    } catch (err) {
      console.error("Favorite remove error:", err);
      alert((err as Error).message || "Failed to remove from favorites.");
    }
  } else {
    try {
      const newFavorite = await addFavorite(token, {
        trackId: track.id,
        title: track.title,
        artistNames: track.artistNames || [],
        albumName: track.albumName,
        imageUrl: track.imageUrl,
      });

      setUserFavorites((prev) => {
        const updated = [...prev, newFavorite];
        return updated;
      });

      alert("Song added to favorites!");
    } catch (err) {
      console.error("Favorite add error:", err);
      alert((err as Error).message || "Failed to add to favorites.");
    }
  }
}
