"use client";

import type React from "react";

import { useState } from "react";
import { FaSearch } from "react-icons/fa";

type SearchBarProps = {
  onSearch: (query: string, setOpen: (open: boolean) => void) => void;
};

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim(), () => {});
      setOpen(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSearch}
        className="hidden md:flex items-center bg-slate-800/80 backdrop-blur-sm rounded-full px-4 py-2 w-full max-w-[400px] text-sm text-white focus-within:ring-2 ring-[#8a2be2] border border-white/10 transition-all duration-200"
      >
        <FaSearch className="mr-3 text-[#8a2be2]" />
        <input
          type="text"
          placeholder="What do you want to play?"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent outline-none w-full text-sm placeholder-white/50 text-white"
        />
      </form>

      <div className="md:hidden relative">
        <button
          onClick={() => setOpen(true)}
          className="p-2 bg-slate-800/80 backdrop-blur-sm rounded-full text-[#8a2be2] hover:bg-slate-700/80 transition-colors border border-white/10"
        >
          <FaSearch />
        </button>

        {open && (
          <div className="fixed inset-0 z-50 flex items-start justify-center mt-12 px-3">
            <div className="w-full max-w-[300px] bg-slate-800/95 backdrop-blur-sm border border-white/20 rounded-xl shadow-2xl p-3">
              <form
                onSubmit={handleSearch}
                className="flex items-center bg-slate-700/80 rounded-full px-3 py-2 text-white border border-white/10"
              >
                <FaSearch className="mr-3 text-[#8a2be2]" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent outline-none w-full text-sm placeholder-white/50"
                />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="ml-1 text-white/70 hover:text-white text-base transition-colors bg-transparent appearance-none"
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
