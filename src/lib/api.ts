const API_BASE = import.meta.env.VITE_API_URL;

export type Review = {
  id: number;
  trackId: string;
  externalId: string;
  title: string;
  artist: { name?: string } | string;
  album: { name?: string } | string;
  coverUrl: string;
  rating: number;
  comment: string;
  userId: number;
  userName: string;
  profilePicture?: string;
  createdAt: string;
};

export type ReviewPayload = {
  id: string;
  rating: number;
  comment: string;
};

export type Favorite = {
  id: number;
  trackId: number;
  externalId: string;
  title: string;
  artist: { name?: string } | string;
  album: { name?: string } | string;
  coverUrl: string;
  createdAt: string;
};

export type Follow = {
  id: number;
  followerId: number;
  targetType: "usuario";
  targetId: number;
  createdAt: string;
  targetName?: string;
  targetProfilePicture?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    profilePicture?: string | null;
    createdAt: string;
  };
};

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
  externalId: string;
  title: string;
  artistNames?: string[];
  artist?: string;
  albumName: string;
  imageUrl?: string;
  coverUrl?: string;
  durationMs: number;
  popularity?: number;
  previewUrl?: string;
  href?: string;
};

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

export type AlbumDetails = {
  id: string;
  name: string;
  imageUrl?: string;
  releaseDate: string;
};

export type PlaylistTrack = {
  playlistId: number;
  trackId: number;
  position: number;
  track: {
    id: number;
    externalId: string;
    title: string;
    artist: string;
    album: string;
    coverUrl?: string;
  };
};

export type Playlist = {
  id: number;
  userId: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  playlistTracks: PlaylistTrack[];
};

export type CreatePlaylistPayload = {
  name: string;
  description?: string;
};

export type UpdatePlaylistPayload = {
  name?: string;
  description?: string;
};

export type AddTrackToPlaylistPayload = {
  externalId: string;
  externalProvider: "Spotify";
  position?: number;
};

export type UserSummaryDto = {
  id: number;
  name: string;
  profilePicture?: string | null;
};

export type PlaylistSummaryDto = {
  id: number;
  name: string;
  description?: string;
  trackCount: number;
};

export type PublicFeedDto = {
  id: string;
  type: "review" | "favorite" | "playlist";
  action: string;
  user: UserSummaryDto;
  track?: TrackSummaryDto;
  playlist?: PlaylistSummaryDto;
  rating?: number;
  comment?: string;
  createdAt: string;
};

export type PlatformStatsDto = {
  totalUsers: number;
  totalReviews: number;
  totalFavorites: number;
  totalPlaylists: number;
  mostActiveUsers: number;
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

  const result = await res.json();
  return result;
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
    let errorData;
    try {
      errorData = await res.json();
    } catch {
      errorData = { message: `HTTP ${res.status}: ${res.statusText}` };
    }
    throw new Error(errorData.message || "Failed to delete review.");
  }
  return;
}

export async function fetchUserReviews(
  token: string,
  userId?: number,
  trackId?: string
): Promise<Review[]> {
  let url = `${API_BASE}/reviews`;
  if (userId) {
    url = `${API_BASE}/reviews/user/${userId}`;
  } else if (trackId) {
    url = `${API_BASE}/reviews/track/${trackId}`;
  }

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json();
    if (
      errorData.message &&
      (errorData.message.includes("Nenhum review encontrado para a faixa") ||
        errorData.message.includes("Faixa não encontrada"))
    ) {
      return [];
    }
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
      trackId: trackData.trackId,
      externalId: trackData.trackId,
      title: trackData.title,
      artistName: trackData.artistNames.join(", "),
      albumName: trackData.albumName,
      coverUrl: trackData.imageUrl,
      externalProvider: "Spotify",
    }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to add favorite.");
  }
  const data = await res.json();
  return data;
}

export async function removeFavorite(
  token: string,
  trackId: number
): Promise<void> {
  const res = await fetch(`${API_BASE}/favorites/${trackId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    let errorData;
    try {
      errorData = await res.json();
    } catch {
      errorData = { message: `HTTP ${res.status}: ${res.statusText}` };
    }
    throw new Error(errorData.message || "Failed to remove favorite.");
  }
  return;
}

export async function fetchUserFavorites(
  token: string,
  userId: number
): Promise<Favorite[]> {
  const res = await fetch(`${API_BASE}/favorites/user/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to fetch user favorites.");
  }

  const data = await res.json();
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

export async function uploadProfilePicture(
  token: string,
  file: File
): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/users/me/profile-picture`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json();
    console.error("API: Upload profile picture error:", errorData);
    throw new Error(errorData.message || "Failed to upload profile picture.");
  }

  const result = await res.json();
  return result;
}

export async function fetchProfilePictureByUserId(
  userId: number
): Promise<string> {
  const res = await fetch(`${API_BASE}/users/profile-picture/user/${userId}`);

  if (!res.ok) {
    if (res.status === 404) {
      return "/placeholder.svg?height=96&width=96";
    }
    const errorData = await res.json();
    console.error("API: Fetch profile picture error:", errorData);
    throw new Error(errorData.message || "Failed to fetch profile picture.");
  }

  const data = await res.json();
  if (data && data.url) {
    return data.url;
  } else {
    console.warn(
      `API: Unexpected response for profile picture for user ${userId}:`,
      data
    );
    return "/placeholder.svg?height=96&width=96";
  }
}

export async function fetchUserFollows(
  token: string,
  userId: number
): Promise<Follow[]> {
  const res = await fetch(`${API_BASE}/follows/user/${userId}`, {
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
  return data;
}

export async function fetchMyFollows(token: string): Promise<Follow[]> {
  const res = await fetch(`${API_BASE}/follows`, {
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
  return data;
}

export async function fetchArtistAllTracks(
  artistId: string,
  limit: number,
  offset: number
): Promise<{ items: TrackSummaryDto[]; total: number }> {
  const res = await fetch(
    `${API_BASE}/artists/${artistId}/tracks?limit=${limit}&offset=${offset}`
  );
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to fetch all artist tracks.");
  }
  const data = await res.json();
  return { items: data.items || [], total: data.total || 0 };
}

export async function fetchArtistDetails(artistId: string): Promise<Artist> {
  const res = await fetch(`${API_BASE}/artists/${artistId}`);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to fetch artist details.");
  }
  return res.json();
}

export async function fetchArtistTopTracks(
  artistId: string
): Promise<TrackSummaryDto[]> {
  const res = await fetch(`${API_BASE}/artists/${artistId}/top-tracks`);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to fetch artist top tracks.");
  }
  return res.json();
}

export async function fetchArtistAlbums(
  artistId: string,
  limit = 20
): Promise<AlbumSummaryDto[]> {
  const res = await fetch(
    `${API_BASE}/artists/${artistId}/albums?limit=${limit}`
  );
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to fetch artist albums.");
  }
  return res.json();
}

export async function fetchTracksForAlbum(
  albumId: string,
  token?: string
): Promise<AlbumTrackItemDto[]> {
  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}/tracks/${albumId}/tracks`, { headers });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to fetch album tracks.");
  }
  const data = await res.json();
  return data;
}

export async function fetchTrackDetails(
  trackId: string
): Promise<TrackSummaryDto> {
  const res = await fetch(`${API_BASE}/tracks/${trackId}`);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to fetch track details.");
  }
  return res.json();
}

export async function saveSearchQuery(
  token: string,
  query: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/search-history`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to save search query.");
  }
}

export async function fetchUserPlaylists(token: string): Promise<Playlist[]> {
  const res = await fetch(`${API_BASE}/playlists`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to fetch playlists.");
  }

  return res.json();
}

export async function fetchPlaylistDetails(
  token: string,
  playlistId: number
): Promise<Playlist> {
  const res = await fetch(`${API_BASE}/playlists/${playlistId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to fetch playlist details.");
  }

  return res.json();
}

export async function createPlaylist(
  token: string,
  payload: CreatePlaylistPayload
): Promise<Playlist> {
  const res = await fetch(`${API_BASE}/playlists`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to create playlist.");
  }

  return res.json();
}

export async function updatePlaylist(
  token: string,
  playlistId: number,
  payload: UpdatePlaylistPayload
): Promise<Playlist> {
  const res = await fetch(`${API_BASE}/playlists/${playlistId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to update playlist.");
  }

  return res.json();
}

export async function deletePlaylist(
  token: string,
  playlistId: number
): Promise<void> {
  const res = await fetch(`${API_BASE}/playlists/${playlistId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to delete playlist.");
  }
}

export async function addTrackToPlaylist(
  token: string,
  playlistId: number,
  payload: AddTrackToPlaylistPayload
): Promise<void> {
  const res = await fetch(`${API_BASE}/playlists/${playlistId}/tracks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to add track to playlist.");
  }
}

export async function removeTrackFromPlaylist(
  token: string,
  playlistId: number,
  trackId: number
): Promise<void> {
  const res = await fetch(
    `${API_BASE}/playlists/${playlistId}/tracks/${trackId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(
      errorData.message || "Failed to remove track from playlist."
    );
  }
}

export async function fetchPlatformStats(): Promise<PlatformStatsDto> {
  const res = await fetch(`${API_BASE}/feed/stats`);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to fetch platform stats.");
  }
  return res.json();
}

export async function fetchPublicFeed(limit = 10): Promise<PublicFeedDto[]> {
  const res = await fetch(`${API_BASE}/feed/public?limit=${limit}`);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to fetch public feed.");
  }
  return res.json();
}
