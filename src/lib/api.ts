const API_BASE = import.meta.env.VITE_API_URL;

export type Review = {
  id: number; // Database ID (number)
  trackId: string; // Spotify track ID (string) - this is the external ID
  externalId: string; // ADDED: This should be the Spotify track ID from the backend response
  title: string; // Review title (user-provided)
  artist: { name?: string } | string; // Can be an object with name, or just a string
  album: { name?: string } | string; // Can be an object with name, or just a string
  coverUrl: string;
  rating: number;
  comment: string;
  userId: number;
  userName: string;
  createdAt: string;
};

export type ReviewPayload = {
  id: string; // Spotify track ID (string) - Backend expects 'id' for the external track ID
  title: string; // Re-added title to payload type
  rating: number;
  comment: string;
};

export type Favorite = {
  id: number; // ID of the favorite entry in your DB (this is the primary key for deletion)
  trackId: number; // MODIFIED: This is the backend's internal track ID (number)
  externalId: string; // MODIFIED: This is the Spotify track ID (string)
  title: string;
  artist: { name?: string } | string; // MODIFIED: Can be object or string
  album: { name?: string } | string; // MODIFIED: Can be object or string
  coverUrl: string;
  createdAt: string;
};

export async function createReview(
  token: string,
  payload: ReviewPayload,
): Promise<Review> {
  console.log("API: Creating review with payload:", payload);

  const res = await fetch(`${API_BASE}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  console.log("API: Create review response status:", res.status);

  if (!res.ok) {
    const errorData = await res.json();
    console.log("API: Create review error:", errorData);
    throw new Error(errorData.message || "Failed to create review.");
  }

  const result = await res.json();
  console.log("API: Created review:", result);
  return result;
}

export async function deleteReviewApi(
  token: string,
  reviewId: number,
): Promise<void> {
  console.log("API: Deleting review with ID:", reviewId);

  const res = await fetch(`${API_BASE}/reviews/${reviewId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log("API: Delete review response status:", res.status);

  if (!res.ok) {
    let errorData;
    try {
      errorData = await res.json();
    } catch {
      errorData = { message: `HTTP ${res.status}: ${res.statusText}` };
    }
    console.log("API: Remove favorite error data:", errorData);
    throw new Error(errorData.message || "Failed to delete review.");
  }

  console.log("API: Successfully deleted review");
  return;
}

export async function fetchUserReviews(
  token: string,
  userId: number,
): Promise<Review[]> {
  const res = await fetch(`${API_BASE}/reviews/user/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to fetch user reviews.");
  }
  return res.json();
}

export async function addFavorite(
  token: string,
  trackData: {
    trackId: string;
    title: string;
    artistNames: string[];
    albumName: string;
    imageUrl?: string;
  },
): Promise<Favorite> {
  const res = await fetch(`${API_BASE}/favorites`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      trackId: trackData.trackId, // This is the externalId for the backend
      externalId: trackData.trackId, // Redundant but kept for safety if backend uses this
      title: trackData.title,
      artistName: trackData.artistNames.join(", "), // Backend might expect a single string
      albumName: trackData.albumName,
      coverUrl: trackData.imageUrl,
      externalProvider: "Spotify", // Added this field
    }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to add favorite.");
  }
  const data = await res.json();
  console.log("API: addFavorite response data:", data); // Log the full response
  return data;
}

// MODIFIED: removeFavorite now accepts trackId (number)
export async function removeFavorite(
  token: string,
  trackId: number,
): Promise<void> {
  console.log(`API: Attempting to remove favorite with trackId: ${trackId}`);

  // MODIFIED: Changed endpoint to use trackId
  const res = await fetch(`${API_BASE}/favorites/${trackId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log(`API: Remove favorite response status: ${res.status}`);

  if (!res.ok) {
    let errorData;
    try {
      errorData = await res.json();
    } catch {
      errorData = { message: `HTTP ${res.status}: ${res.statusText}` };
    }
    console.log("API: Remove favorite error data:", errorData);
    throw new Error(errorData.message || "Failed to remove favorite.");
  }

  console.log("API: Successfully removed favorite");
  return;
}

export async function fetchUserFavorites(
  token: string,
  userId: number,
): Promise<Favorite[]> {
  console.log(`API: Fetching favorites for user ${userId}`);

  const res = await fetch(`${API_BASE}/favorites/user/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json();
    console.log("API: Fetch favorites error:", errorData);
    throw new Error(errorData.message || "Failed to fetch user favorites.");
  }

  const data = await res.json();
  console.log(
    `API: Fetched ${data.length} favorites for user ${userId}:`,
    data,
  );
  // MODIFIED: Add a check for the 'id' and 'externalId' consistency
  data.forEach((fav: Favorite) => {
    if (typeof fav.id === "undefined" || fav.id === null) {
      console.warn(`Favorite item missing 'id' field:`, fav);
    }
    if (typeof fav.externalId === "undefined" || fav.externalId === null) {
      console.warn(`Favorite item missing 'externalId' field:`, fav);
    }
  });
  return data;
}
