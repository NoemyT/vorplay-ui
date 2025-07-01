"use client";

import type React from "react";

import { Card, CardHeader, CardContent } from "../ui/Card";
import logo from "../../assets/vorp.png";
import { FaStar, FaPlus, FaUsers, FaMusic } from "react-icons/fa";
import placeholder from "../../assets/placeholder.svg";

export default function Welcome() {
  return (
    <div className="overflow-y-auto">
      <div className="h-full w-full flex flex-col items-center justify-center p-4">
        <Card
          className="
          flex flex-col items-center
          justify-center
          gap-1
          w-full max-w-[900px]
          min-h-[250px]
          bg-white/5 px-6 py-6 shadow-none text-center rounded-[20px] mb-4
        "
        >
          <img
            src={logo || placeholder}
            alt="Vorplay Logo"
            className="w-24 h-24 rounded-full mb-2"
          />
          <h1 className="text-[#8a2be2] text-4xl sm:text-5xl font-bold leading-tight">
            Welcome to Vorplay!
          </h1>
          <p className="text-white/80 text-lg sm:text-xl max-w-xl">
            Your ultimate platform for music reviews, personalized playlists,
            and connecting with fellow music lovers.
          </p>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-[900px]">
          <FeatureCard
            icon={<FaStar size={32} className="text-[#8a2be2]" />}
            title="Review Tracks"
            description="Share your thoughts and ratings on your favorite songs."
          />
          <FeatureCard
            icon={<FaPlus size={32} className="text-[#8a2be2]" />}
            title="Create Playlists"
            description="Curate and organize your perfect music collections."
          />
          <FeatureCard
            icon={<FaUsers size={32} className="text-[#8a2be2]" />}
            title="Follow Others"
            description="Connect with friends and discover new tastes."
          />
          <FeatureCard
            icon={<FaMusic size={32} className="text-[#8a2be2]" />}
            title="Discover Music"
            description="Explore a vast library of tracks and artists."
          />
        </div>
      </div>
    </div>
  );
}

type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className="bg-white/5 rounded-[16px] p-6 text-white shadow-none flex flex-col items-center text-center gap-4 h-full">
      <div className="mb-2">{icon}</div>
      <CardHeader className="text-xl text-white p-0">{title}</CardHeader>
      <CardContent className="text-white/70 text-sm p-0">
        {description}
      </CardContent>
    </Card>
  );
}
