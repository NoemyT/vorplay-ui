"use client";

import { Card } from "../../ui/Card";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate, createSearchParams } from "react-router-dom"; // ADDED: useNavigate, createSearchParams

type ArtistSummaryDto = {
  id: string;
  name: string;
  externalUrl: string;
  imageUrl?: string;
};

type ArtistsProps = {
  artists: ArtistSummaryDto[];
  query: string;
};

export default function Artists({ artists, query }: ArtistsProps) {
  const navigate = useNavigate(); // ADDED: useNavigate hook

  const handleArtistClick = (artistId: string) => {
    navigate({
      pathname: "/",
      search: createSearchParams({
        section: "artist", // Navigate to the new artist page section
        artistId: artistId, // Pass the artist ID
      }).toString(),
    });
  };

  if (!artists.length) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-white text-center opacity-70 py-10">
        <FaUserCircle size={48} className="mb-4 text-[#8a2be2]" />
        <p className="text-lg">No artists found for "{query}".</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {artists.map((artist) => (
        <Card
          key={artist.id}
          className="bg-white/5 border border-white/10 p-4 rounded-xl text-white text-center flex flex-col items-center justify-center hover:bg-white/10 transition-colors cursor-pointer" // ADDED: cursor-pointer
          onClick={() => handleArtistClick(artist.id)} // ADDED: onClick handler
        >
          <img
            src={artist.imageUrl || "/placeholder.svg?height=96&width=96"}
            alt={artist.name}
            className="w-24 h-24 rounded-full object-cover mb-3"
          />
          <h3 className="font-semibold text-base truncate w-full px-1">
            {artist.name}
          </h3>
          <p className="text-sm opacity-70">Artist</p>
        </Card>
      ))}
    </div>
  );
}
