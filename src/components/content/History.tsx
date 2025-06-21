"use client";

import { useEffect, useState } from "react";
import { TiArchive } from "react-icons/ti";
import { FaTrashAlt, FaTimesCircle } from "react-icons/fa";
import { Card } from "../ui/Card";
import { useAuth } from "../../context/authContext";

type SearchHistoryItem = {
  id: number;
  query: string;
  createdAt: string;
};

export default function History() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchHistory() {
      if (!user) {
        setError("You must be logged in to view search history.");
        setLoading(false);
        return;
      }
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/search-history`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.ok) {
          const data = await res.json();
          setHistory(data);
        } else {
          setError("Failed to fetch search history. Please try again.");
        }
      } catch (err) {
        setError("An unexpected error occurred while fetching search history.");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [user]);

  async function deleteHistoryItem(id: number) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this search item?"
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/search-history/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        setHistory((prev) => prev.filter((item) => item.id !== id));
      } else {
        alert("Failed to delete search item. Please try again.");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("An unexpected error occurred while deleting the search item.");
    }
  }

  async function clearAllHistory() {
    const confirmClear = window.confirm(
      "Are you sure you want to clear all search history?"
    );
    if (!confirmClear) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/search-history`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        setHistory([]);
      } else {
        alert("Failed to clear all search history. Please try again.");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("An unexpected error occurred while clearing all search history.");
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-white text-center opacity-70">
        <TiArchive size={48} className="mb-4 text-[#8a2be2]" />
        <p className="text-lg">Loading your search history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-white text-center opacity-70">
        <TiArchive size={48} className="mb-4 text-red-400" />
        <p className="text-lg">Oops! Something went wrong.</p>
        <p className="text-sm text-red-300">{error}</p>
        <p className="text-sm mt-2">
          Please try refreshing the page or logging in again.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 text-2xl font-bold text-white">
        <TiArchive className="text-[#8a2be2]" size={28} />
        <span>Search History</span>
        {history.length > 0 && (
          <button
            onClick={clearAllHistory}
            className="ml-auto bg-red-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1 hover:bg-red-500"
          >
            <FaTimesCircle size={12} /> Clear All
          </button>
        )}
      </div>

      {/* History list or empty state */}
      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-white text-center opacity-70">
          <TiArchive size={48} className="mb-4 text-[#8a2be2]" />
          <p className="text-lg">Your search history is empty.</p>
          <p className="text-sm">
            Start searching for tracks, artists, or users!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 overflow-y-auto pr-2 max-h-[calc(100%-64px)]">
          {history.map((item) => (
            <Card
              key={item.id}
              className="bg-white/5 border border-white/10 p-4 rounded-xl text-white relative flex items-center justify-between hover:bg-white/10 transition-colors"
            >
              <div>
                <p className="text-lg font-semibold">{item.query}</p>
                <p className="text-sm opacity-70">
                  Searched on {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => deleteHistoryItem(item.id)}
                className="text-red-400 hover:text-red-300 bg-transparent p-1 rounded-full"
              >
                <FaTrashAlt size={16} />
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
