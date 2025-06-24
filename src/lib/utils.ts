import type React from "react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { addFavorite, removeFavorite, type Favorite } from "./api"; // Import API functions and types
import type { User } from "../context/authContext"; // Import User type

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Define types for track and state setters
type TrackSummaryDto = {
  id: string;
  title: string;
  artistNames: string[];
  albumName: string;
  imageUrl?: string;
  durationMs: number;
};

export async function handleFavoriteToggle(
  track: TrackSummaryDto,
  user: User | null, // Pass the user object
  userFavorites: Favorite[],
  setUserFavorites: React.Dispatch<React.SetStateAction<Favorite[]>>,
) {
  console.log(`=== FAVORITE TOGGLE START ===`);
  console.log(`Track: ${track.title} (ID: ${track.id})`);
  console.log("Current userFavorites state:", userFavorites);

  if (!user) {
    alert("You must be logged in to favorite tracks.");
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Authentication token missing. Please log in again.");
    return;
  }

  // MODIFIED: Use externalId for finding existing favorite
  const existingFavorite = userFavorites.find(
    (fav) => fav.externalId === track.id,
  );
  const isCurrentlyFavorited = !!existingFavorite;

  console.log(`Existing favorite found:`, existingFavorite);
  console.log(`Is currently favorited: ${isCurrentlyFavorited}`);

  if (isCurrentlyFavorited) {
    // If already favorited, remove it
    if (
      typeof existingFavorite?.trackId === "undefined" ||
      existingFavorite?.trackId === null
    ) {
      // MODIFIED: Check for the 'trackId' of the favorite entry
      console.error("Favorite trackId missing for removal.");
      alert("Cannot remove favorite: Track ID not found.");
      return;
    }
    try {
      console.log(
        "Removing from favorites, passing trackId:",
        existingFavorite.trackId,
      ); // Log the trackId
      await removeFavorite(token, existingFavorite.trackId); // MODIFIED: Pass the 'trackId'

      setUserFavorites((prev) => {
        const updated = prev.filter((fav) => fav.id !== existingFavorite.id); // Filter by DB ID for state
        console.log("Updated userFavorites state after removal:", updated);
        return updated;
      });
      alert("Song removed from favorites!");
      console.log(`=== FAVORITE TOGGLE END (SUCCESS - REMOVED) ===`);
    } catch (err) {
      console.error("Favorite remove error:", err);
      alert((err as Error).message || "Failed to remove from favorites.");
      console.log(`=== FAVORITE TOGGLE END (ERROR - REMOVE) ===`);
    }
  } else {
    // If not favorited, add it
    try {
      console.log("Adding to favorites...");
      const newFavorite = await addFavorite(token, {
        trackId: track.id, // This is the externalId for the backend
        title: track.title,
        artistNames: track.artistNames,
        albumName: track.albumName,
        imageUrl: track.imageUrl,
      });

      console.log("New favorite created:", newFavorite);

      setUserFavorites((prev) => {
        const updated = [...prev, newFavorite];
        console.log("Updated userFavorites state after addition:", updated);
        return updated;
      });

      alert("Song added to favorites!");
      console.log(`=== FAVORITE TOGGLE END (SUCCESS - ADDED) ===`);
    } catch (err) {
      console.error("Favorite add error:", err);
      alert((err as Error).message || "Failed to add to favorites.");
      console.log(`=== FAVORITE TOGGLE END (ERROR - ADD) ===`);
    }
  }
}
