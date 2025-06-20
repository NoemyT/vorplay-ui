import { useState, useEffect } from "react";
import { Card } from "../ui/Card";

export type SearchType = "tracks" | "artists" | "users";

type TrackResult = {
  id: string;
  title: string;
  artistNames: string[];
  albumName: string;
  imageUrl: string;
};

type ArtistResult = {
  id: string;
  name: string;
  externalUrl: string;
  imageUrl: string;
};

type UserResult = {
  id: number;
  name: string;
  profilePicture: string;
};

type ResultsProps = {
  type: SearchType;
  query: string;
};

export default function Results({ type, query }: ResultsProps) {
  const [tracks, setTracks] = useState<TrackResult[]>([]);
  const [artists, setArtists] = useState<ArtistResult[]>([]);
  const [users, setUsers] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) return;

    setLoading(true);
    setError(null);

    const endpoint =
      type === "tracks"
        ? `/api/v1/tracks/search?query=${encodeURIComponent(query)}`
        : type === "artists"
        ? `/api/v1/artists/search?query=${encodeURIComponent(query)}`
        : `/api/v1/users/search?query=${encodeURIComponent(query)}`;

    fetch(endpoint)
      .then((r) => {
        if (!r.ok) throw new Error(`Error ${r.status}`);
        return r.json();
      })
      .then((data) => {
        const resultItems = Array.isArray(data) ? data : data.items || [];

        if (type === "tracks") setTracks(resultItems as TrackResult[]);
        else if (type === "artists") setArtists(resultItems as ArtistResult[]);
        else if (type === "users") setUsers(resultItems as UserResult[]);
      })
      .catch((err) => {
        if (err instanceof Error) setError(err.message);
        else setError("Unknown error");
      })
      .finally(() => setLoading(false));
  }, [query, type]);

  if (loading) return <p className="text-white">Loading...</p>;
  if (error) return <p className="text-red-400">Error: {error}</p>;

  if (type === "tracks") {
    if (!tracks.length)
      return <p className="text-white">No results for "{query}"</p>;

    return (
      <div className="flex flex-col gap-4">
        {tracks.map((tr) => (
          <Card key={tr.id} className="bg-white/5 p-4 flex items-center gap-4">
            <img src={tr.imageUrl} alt="" className="w-12 h-12 rounded-md" />
            <div>
              <p className="text-white font-semibold">{tr.title}</p>
              <p className="text-white/70">{tr.artistNames.join(", ")}</p>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const artistOrUserItems = type === "artists" ? artists : users;

  if (!artistOrUserItems.length)
    return <p className="text-white">No results for "{query}"</p>;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {artistOrUserItems.map((it) => (
        <Card key={`${type}-${it.id}`} className="bg-white/5 p-4 text-center">
          <img
            src={"profilePicture" in it ? it.profilePicture : it.imageUrl}
            alt=""
            className="w-24 h-24 rounded-full mx-auto mb-2 object-cover"
          />
          <p className="text-white font-medium">{it.name}</p>
        </Card>
      ))}
    </div>
  );
}
