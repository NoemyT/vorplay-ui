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

// MODIFIED: Follow type definition to correctly include nested 'user' or 'artist' objects
export type Follow = {
  id: number;
  followerId: number; // Added followerId based on Swagger
  targetType: "usuario" | "artista";
  targetId: number;
  createdAt: string;
  // These fields are now optional as they might be nested
  targetName?: string;
  targetProfilePicture?: string;
  // MODIFIED: Use 'user' and 'artist' directly as per Swagger
  user?: {
    id: number;
    name: string;
    email: string;
    profilePicture?: string | null;
    createdAt: string;
  };
  artist?: {
    id: string;
    name: string;
    externalUrl: string;
    imageUrl?: string;
  };
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

// ADDED: Function to upload profile picture
export async function uploadProfilePicture(
  token: string,
  file: File,
): Promise<{ url: string }> {
  console.log("API: Uploading profile picture...");
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/users/me/profile-picture`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  console.log("API: Upload profile picture response status:", res.status);

  if (!res.ok) {
    const errorData = await res.json();
    console.error("API: Upload profile picture error:", errorData);
    throw new Error(errorData.message || "Failed to upload profile picture.");
  }

  const result = await res.json();
  console.log("API: Upload profile picture success:", result);
  return result;
}

// ADDED: Function to fetch profile picture by user ID
export async function fetchProfilePictureByUserId(
  userId: number,
): Promise<string> {
  console.log(`API: Fetching profile picture for user ID: ${userId}`);
  const res = await fetch(`${API_BASE}/users/profile-picture/user/${userId}`);

  console.log(`API: Fetch profile picture response status: ${res.status}`);

  if (!res.ok) {
    // Assuming 404 means no custom picture, return placeholder
    if (res.status === 404) {
      console.log(
        `Profile picture not found for user ${userId}, returning placeholder.`,
      );
      return "/placeholder.svg?height=96&width=96";
    }
    const errorData = await res.json();
    console.error("API: Fetch profile picture error:", errorData);
    throw new Error(errorData.message || "Failed to fetch profile picture.");
  }

  // Assuming the API returns a JSON object with a 'url' field, or the image directly
  // If it returns the image directly, this needs adjustment.
  // Based on the PATCH example, it's likely a URL.
  const data = await res.json();
  if (data && data.url) {
    return data.url;
  } else {
    // If the response is just the image data, or an unexpected format,
    // we might need to handle it differently (e.g., res.blob() and createObjectURL)
    // For now, assuming a URL is returned.
    console.warn(
      `API: Unexpected response for profile picture for user ${userId}:`,
      data,
    );
    return "/placeholder.svg?height=96&width=96"; // Fallback
  }
}

// MODIFIED: fetchUserFollows to use the new API endpoint and return full Follow objects
export async function fetchUserFollows(
  token: string,
  userId: number,
): Promise<Follow[]> {
  console.log(`API: Fetching follows for user ID: ${userId}`);
  const res = await fetch(`${API_BASE}/follows/user/${userId}`, {
    // Assuming this endpoint exists for other users' follows
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json();
    console.error("API: Fetch user follows error:", errorData);
    throw new Error(errorData.message || "Failed to fetch user follows.");
  }

  const data = await res.json();
  console.log(`API: Fetched ${data.length} follows for user ${userId}:`, data);
  return data;
}

// MODIFIED: fetchMyFollows to use the new API endpoint and return full Follow objects
export async function fetchMyFollows(token: string): Promise<Follow[]> {
  console.log(`API: Fetching my follows...`);
  const res = await fetch(`${API_BASE}/follows`, {
    // This is the "listMine" endpoint
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json();
    console.error("API: Fetch my follows error:", errorData);
    throw new Error(errorData.message || "Failed to fetch my follows.");
  }

  const data = await res.json();
  console.log(`API: Fetched ${data.length} my follows:`, data);
  return data;
}
