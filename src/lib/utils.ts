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
  setUserFavorites: React.Dispatch<React.SetStateAction<Favorite[]>>,
) {
  // console.log(`=== FAVORITE TOGGLE START ===`);
  // console.log(`Track: ${track.title} (ID: ${track.id})`);
  // console.log("Current userFavorites state:", userFavorites);

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
    (fav) => fav.externalId === track.id,
  );
  const isCurrentlyFavorited = !!existingFavorite;

  // console.log(`Existing favorite found:`, existingFavorite);
  // console.log(`Is currently favorited: ${isCurrentlyFavorited}`);

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
      /* console.log(
        "Removing from favorites, passing trackId:",
        existingFavorite.trackId,
      ); */
      await removeFavorite(token, existingFavorite.trackId); // MODIFIED: Pass the 'trackId'

      setUserFavorites((prev) => {
        const updated = prev.filter((fav) => fav.id !== existingFavorite.id);
        // console.log("Updated userFavorites state after removal:", updated);
        return updated;
      });
      alert("Song removed from favorites!");
      // console.log(`=== FAVORITE TOGGLE END (SUCCESS - REMOVED) ===`);
    } catch (err) {
      console.error("Favorite remove error:", err);
      alert((err as Error).message || "Failed to remove from favorites.");
      // console.log(`=== FAVORITE TOGGLE END (ERROR - REMOVE) ===`);
    }
  } else {
    try {
      // console.log("Adding to favorites...");
      const newFavorite = await addFavorite(token, {
        trackId: track.id,
        title: track.title,
        artistNames: track.artistNames || [],
        albumName: track.albumName,
        imageUrl: track.imageUrl,
      });

      // console.log("New favorite created:", newFavorite);

      setUserFavorites((prev) => {
        const updated = [...prev, newFavorite];
        // console.log("Updated userFavorites state after addition:", updated);
        return updated;
      });

      alert("Song added to favorites!");
      // console.log(`=== FAVORITE TOGGLE END (SUCCESS - ADDED) ===`);
    } catch (err) {
      console.error("Favorite add error:", err);
      alert((err as Error).message || "Failed to add to favorites.");
      // console.log(`=== FAVORITE TOGGLE END (ERROR - ADD) ===`);
    }
  }
}
