import { useState } from "react";
import { FaSearch } from "react-icons/fa";

type SearchBarProps = {
  onSearch: (query: string) => void;
};

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
      setOpen(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSearch}
        className="hidden md:flex items-center bg-neutral-800 rounded-full px-3 py-1 w-full max-w-[300px] text-sm text-white focus-within:ring-2 ring-purple-500"
      >
        <FaSearch className="mr-2 text-gray-400" />
        <input
          type="text"
          placeholder="What do you want to play?"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent outline-none w-full text-sm placeholder-gray-400"
        />
      </form>

      <div className="md:hidden relative">
        <button
          onClick={() => setOpen(true)}
          className="p-2 bg-neutral-800 rounded-full text-white hover:bg-neutral-700"
        >
          <FaSearch />
        </button>

        {open && (
          <div className="fixed inset-0 z-50 flex items-start justify-center mt-20 px-4">
            <div className="w-full max-w-sm bg-black border border-white/20 rounded-xl shadow-lg p-4">
              <form
                onSubmit={handleSearch}
                className="flex items-center bg-neutral-800 rounded-full px-4 py-2 text-white"
              >
                <FaSearch className="mr-2 text-gray-400" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent outline-none w-full text-sm placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="ml-2 text-gray-300 hover:text-white text-xs"
                >
                  ✕
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
