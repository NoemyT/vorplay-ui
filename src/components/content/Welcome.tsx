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
          bg-slate-800/60 backdrop-blur-sm px-6 py-6 
          shadow-xl border border-white/10 text-center rounded-[20px] mb-6
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
    <Card className="
      bg-slate-800/60 backdrop-blur-sm rounded-[16px] p-6 
      text-white shadow-lg border border-white/10
      flex flex-col items-center text-center gap-4 h-full
      hover:bg-slate-800/80 hover:border-[#8a2be2]/50 
      hover:shadow-xl hover:shadow-[#8a2be2]/20
      transition-all duration-300 cursor-pointer
      group
    ">
      <div className="mb-2 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <CardHeader className="text-xl text-white p-0 group-hover:text-[#8a2be2] transition-colors duration-300">
        {title}
      </CardHeader>
      <CardContent className="text-white/80 text-sm p-0 group-hover:text-white/90 transition-colors duration-300">
        {description}
      </CardContent>
    </Card>
  );
}
