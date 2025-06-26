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
  targetType: "usuario";
  targetId: number; // MODIFIED: Can be number (for user) or string (for artist)
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
};

// ADDED: New types for Artist, Album, and TrackSummaryDto (for artist top tracks)
export type Artist = {
  id: string;
  name: string;
  externalUrl: string;
  imageUrl?: string;
};

export type AlbumSummaryDto = {
  id: string;
  title: string;
  imageUrl?: string;
  releaseDate: string;
  externalUrl: string;
};

export type TrackSummaryDto = {
  id: string;
  title: string;
  artistNames: string[];
  albumName: string;
  imageUrl?: string;
  durationMs: number;
  popularity?: number;
  previewUrl?: string;
  href?: string;
};

// MODIFIED: New type for tracks returned by the album tracks endpoint
export type AlbumTrackItemDto = {
  id: string;
  title: string;
  durationMs: number;
  trackNumber: number;
  artists: {
    id: string;
    name: string;
    externalUrl: string;
  }[];
  album: {
    id: string;
    name: string;
    coverUrl?: string;
    releaseDate: string;
  };
  previewUrl?: string;
};

// MODIFIED: AlbumDetails type to remove tracks, as they will be fetched separately
export type AlbumDetails = {
  id: string;
  name: string;
  imageUrl?: string;
  releaseDate: string;
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

// MODIFIED: fetchArtistAllTracks to accept limit and offset
export async function fetchArtistAllTracks(
  artistId: string,
  limit: number,
  offset: number,
): Promise<{ items: TrackSummaryDto[]; total: number }> {
  console.log(
    `API: Fetching all tracks for artist ID: ${artistId} with limit=${limit}, offset=${offset}`,
  );
  const res = await fetch(
    `${API_BASE}/artists/${artistId}/tracks?limit=${limit}&offset=${offset}`,
  );
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to fetch all artist tracks.");
  }
  const data = await res.json();
  console.log("API: fetchArtistAllTracks raw response:", data);
  // Assuming the backend returns an object with an 'items' array and a 'total' count
  return { items: data.items || [], total: data.total || 0 };
}

export async function fetchArtistDetails(artistId: string): Promise<Artist> {
  console.log(`API: Fetching artist details for ID: ${artistId}`);
  const res = await fetch(`${API_BASE}/artists/${artistId}`);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to fetch artist details.");
  }
  return res.json();
}

export async function fetchArtistTopTracks(
  artistId: string,
): Promise<TrackSummaryDto[]> {
  console.log(`API: Fetching top tracks for artist ID: ${artistId}`);
  const res = await fetch(`${API_BASE}/artists/${artistId}/top-tracks`);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to fetch artist top tracks.");
  }
  return res.json();
}

export async function fetchArtistAlbums(
  artistId: string,
  limit = 20,
): Promise<AlbumSummaryDto[]> {
  console.log(
    `API: Fetching albums for artist ID: ${artistId} with limit=${limit}`,
  );
  const res = await fetch(
    `${API_BASE}/artists/${artistId}/albums?limit=${limit}`,
  );
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to fetch artist albums.");
  }
  return res.json();
}

// REMOVED: followArtist function as per user request
// REMOVED: unfollowArtist function as per user request

// MODIFIED: fetchTracksForAlbum endpoint back to tracks/{albumId}/tracks and return data directly
export async function fetchTracksForAlbum(
  albumId: string,
  token?: string,
): Promise<AlbumTrackItemDto[]> {
  console.log(
    `API: Fetching tracks for album ID: ${albumId} from /tracks/${albumId}/tracks`,
  );
  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}/tracks/${albumId}/tracks`, { headers }); // Reverted endpoint
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to fetch album tracks.");
  }
  const data = await res.json();
  console.log("API: fetchTracksForAlbum raw response:", data);
  // MODIFIED: Return data directly as it's already an array
  return data;
}

// REMOVED: fetchAlbumDetails as per user's feedback that /api/v1/albums/{id} doesn't exist.
// We will derive album details from fetchArtistAlbums response.
