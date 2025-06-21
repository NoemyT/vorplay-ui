import { FaCompactDisc } from "react-icons/fa";

type AlbumsProps = {
  query: string;
};

export default function Albums({ query }: AlbumsProps) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 text-white text-center opacity-70 py-10">
      <FaCompactDisc size={48} className="mb-4 text-[#8a2be2]" />
      <p className="text-lg mb-2">
        No direct album search available for "{query}".
      </p>
      <p className="text-sm">
        Albums can typically be found by searching for an artist and then
        viewing their discography.
      </p>
    </div>
  );
}
