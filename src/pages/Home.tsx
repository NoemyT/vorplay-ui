"use client";

import { useSearchParams } from "react-router-dom";
import { useState } from "react";

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import MainContent from "../components/MainContent";

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");

  const section = searchParams.get("section") || "default";
  const userId = searchParams.get("userId"); // Get userId from search params

  const handleSectionChange = (newSection: string) => {
    setSearchParams({ section: newSection.toLowerCase() });
  };

  return (
    <>
      <Header
        onSelectSection={handleSectionChange}
        onSearch={(query) => {
          setSearchQuery(query);
          setSearchParams({ section: "results", query: query }); // Update search params for results
        }}
      />
      <div>
        <Sidebar onSelectSection={handleSectionChange} />
        <MainContent
          selectedSection={section}
          searchQuery={searchQuery}
          userId={userId ?? undefined}
        />
      </div>
    </>
  );
}
