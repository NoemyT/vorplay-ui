const API_BASE = import.meta.env.VITE_API_URL;

export type Review = {
  id: number;
  trackId: string; // This is the external Spotify track ID
  externalId: string; // Redundant, but kept for consistency if backend uses it
  title: string; // Track title (from Spotify)
  artist: { name?: string };
  album: { name?: string };
  coverUrl: string;
  rating: number;
  comment: string;
  userId: number;
  userName: string;
  createdAt: string;
};

export type ReviewPayload = {
  trackId: string; // Changed to trackId to match backend expectation for Spotify ID
  rating: number;
  comment: string;
};

export type ReviewUpdatePayload = {
  rating?: number;
  comment?: string;
};

export type Favorite = {
  id: number; // ID of the favorite entry in your DB
  trackId: string; // Spotify track ID (this is the externalId)
  externalId: string; // Spotify track ID (redundant but kept for consistency with Review)
  title: string;
  artist: { name?: string };
  album: { name?: string };
  coverUrl: string;
  createdAt: string;
};

export async function createReview(
  token: string,
  payload: ReviewPayload
): Promise<Review> {
  const res = await fetch(`${API_BASE}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to create review.");
  }
  return res.json();
}

export async function updateReview(
  token: string,
  reviewId: number,
  payload: ReviewUpdatePayload
): Promise<Review> {
  const res = await fetch(`${API_BASE}/reviews/${reviewId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to update review.");
  }
  return res.json();
}

export async function deleteReviewApi(
  token: string,
  reviewId: number
): Promise<void> {
  const res = await fetch(`${API_BASE}/reviews/${reviewId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to delete review.");
  }
  return;
}

export async function fetchUserReviews(
  token: string,
  userId: number
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
  }
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
  return res.json();
}

export async function removeFavorite(
  token: string,
  favoriteId: number
): Promise<void> {
  console.log(`API: Attempting to remove favorite with ID: ${favoriteId}`);

  const res = await fetch(`${API_BASE}/favorites/${favoriteId}`, {
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
  userId: number
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
    data
  );
  return data;
}
