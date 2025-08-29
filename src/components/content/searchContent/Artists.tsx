"use client";

import { Card } from "../../ui/Card";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate, createSearchParams } from "react-router-dom";
import { type Artist } from "../../../lib/api";
import placeholder from "../../../assets/placeholder.svg";

type ArtistsProps = {
  artists: Artist[];
  query: string;
};

export default function Artists({ artists, query }: ArtistsProps) {
  const navigate = useNavigate();

  const handleArtistClick = (artistId: string) => {
    navigate({
      pathname: "/",
      search: createSearchParams({
        section: "artist",
        artistId: artistId,
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
    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {artists.map((artist) => (
        <Card
          key={artist.id}
          className="bg-slate-800/60 border border-white/10 p-4 rounded-xl text-white text-center flex flex-col items-center justify-center hover:bg-slate-600/40 transition-colors cursor-pointer"
          onClick={() => handleArtistClick(artist.id)}
        >
          <img
            src={artist.imageUrl || placeholder}
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
