"use client";

import { useSearchParams } from "react-router-dom";
import { useState } from "react";

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import MainContent from "../components/MainContent";

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const section = searchParams.get("section") || "default";
  const userId = searchParams.get("userId");
  const artistId = searchParams.get("artistId");
  const albumId = searchParams.get("albumId");
  const playlistId = searchParams.get("playlistId");
  const trackId = searchParams.get("trackId");

  const handleSectionChange = (newSection: string) => {
    setSearchParams({ section: newSection.toLowerCase() });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSearchParams({ section: "results", query: query });
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  return (
    <>
      <Header onSelectSection={handleSectionChange} onSearch={handleSearch} />
      <div>
        <Sidebar onSelectSection={handleSectionChange} collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        <MainContent
          selectedSection={section}
          searchQuery={searchQuery}
          userId={userId ?? undefined}
          artistId={artistId ?? undefined}
          albumId={albumId ?? undefined}
          playlistId={playlistId ?? undefined}
          trackId={trackId ?? undefined}
          onSearch={handleSearch}
          sidebarCollapsed={sidebarCollapsed}
        />
      </div>
    </>
  );
}
