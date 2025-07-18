"use client";

import { useEffect, useState } from "react";
import { TiArchive } from "react-icons/ti";
import { FaTrashAlt, FaTimesCircle } from "react-icons/fa";
import { Card } from "../ui/Card";
import { useAuth } from "../../hooks/use-auth";

type SearchHistoryItem = {
  id: number;
  query: string;
  createdAt: string;
};

type HistoryProps = {
  onSearch: (query: string) => void;
};

export default function History({ onSearch }: HistoryProps) {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    console.log("History component: useEffect triggered.");
    if (!user) {
      console.log("History component: User not logged in.");
      setError("You must be logged in to view search history.");
      setLoading(false);
      return;
    }
    console.log(
      "History component: User is logged in, attempting to fetch history.",
    );
    fetchHistory();
  }, [user]);

  async function fetchHistory() {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("History component: Authentication token missing.");
        setError("Authentication token missing. Please log in again.");
        setLoading(false);
        return;
      }

      console.log(
        `History component: Fetching from ${import.meta.env.VITE_API_URL}/search-history`,
      );
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/search-history`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("History component: API response status:", res.status);

      if (!res.ok) {
        let errorData = {
          message: `HTTP Error: ${res.status} ${res.statusText}`,
        };
        try {
          errorData = await res.json();
          console.error(
            "History component: Failed to fetch history, error data:",
            errorData,
          );
        } catch (jsonError) {
          console.error(
            "History component: Failed to parse error JSON:",
            jsonError,
          );
        }
        setError(
          errorData.message ||
            "Failed to fetch search history. Please try again.",
        );
        setHistory([]);
      } else {
        const data = await res.json();
        console.log("History component: Fetched history data:", data);
        setHistory(data);
      }
    } catch (err) {
      console.error(
        "History component: An unexpected network error occurred during fetch:",
        err,
      );
      setError(
        "An unexpected network error occurred while fetching search history. Please check your connection.",
      );
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteItem(id: number) {
    if (!window.confirm("Are you sure you want to delete this search item?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token missing.");

      console.log(
        `History component: Deleting item ${id} from ${import.meta.env.VITE_API_URL}/search-history/${id}`,
      );
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/search-history/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log(
        "History component: Delete item response status:",
        res.status,
      );

      if (res.ok) {
        setHistory((prev) => prev.filter((item) => item.id !== id));
        alert("Search item deleted successfully!");
      } else {
        const errorData = await res.json();
        console.error(
          "History component: Failed to delete item, error data:",
          errorData,
        );
        alert(
          errorData.message ||
            "Failed to delete search item. Please try again.",
        );
      }
    } catch (err) {
      console.error(
        "History component: An unexpected error occurred during delete item:",
        err,
      );
      alert("An unexpected error occurred during the operation.");
    }
  }

  async function handleClearAllHistory() {
    if (
      !window.confirm(
        "Are you sure you want to clear all your search history? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token missing.");

      console.log(
        `History component: Clearing all history from ${import.meta.env.VITE_API_URL}/search-history`,
      );
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/search-history`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log(
        "History component: Clear all history response status:",
        res.status,
      );

      if (res.ok) {
        setHistory([]);
        alert("All search history cleared successfully!");
      } else {
        const errorData = await res.json();
        console.error(
          "History component: Failed to clear all history, error data:",
          errorData,
        );
        alert(
          errorData.message ||
            "Failed to clear all search history. Please try again.",
        );
      }
    } catch (err) {
      console.error(
        "History component: An unexpected error occurred during clear all history:",
        err,
      );
      alert("An unexpected error occurred during the operation.");
    }
  }

  const handleHistoryItemClick = (query: string) => {
    onSearch(query);
  };

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
            onClick={handleClearAllHistory}
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
              className="bg-white/5 border border-white/10 p-4 rounded-xl text-white relative flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer"
              onClick={() => handleHistoryItemClick(item.query)}
            >
              <div>
                <p className="text-lg font-semibold">{item.query}</p>
                <p className="text-sm opacity-70">
                  Searched on {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteItem(item.id);
                }}
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
