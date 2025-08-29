"use client";

import { Card } from "../../ui/Card";
import { FaUsers } from "react-icons/fa";
import type { User } from "../../../context/auth-context";
import { useNavigate, createSearchParams } from "react-router-dom";
import placeholder from "../../../assets/placeholder.svg";

type UsersProps = {
  users: User[];
  query: string;
};

export default function Users({ users, query }: UsersProps) {
  const navigate = useNavigate();

  const handleUserClick = (userId: number) => {
    navigate({
      pathname: "/",
      search: createSearchParams({
        section: "user",
        userId: userId.toString(),
      }).toString(),
    });
  };

  if (!users.length) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-white text-center opacity-70 py-10">
        <FaUsers size={48} className="mb-4 text-[#8a2be2]" />
        <p className="text-lg">No users found for "{query}".</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {users.map((user) => (
        <Card
          key={user.id}
          className="bg-slate-800/60 border border-white/10 p-4 rounded-xl text-white text-center flex flex-col items-center justify-center hover:bg-slate-600/40 transition-colors cursor-pointer"
          onClick={() => handleUserClick(user.id)}
        >
          <img
            src={user.profilePicture || placeholder}
            alt={user.name}
            className="w-24 h-24 rounded-full object-cover mb-3"
          />
          <h3 className="font-semibold text-base truncate w-full px-1">
            {user.name}
          </h3>
          <p className="text-sm opacity-70">User</p>
        </Card>
      ))}
    </div>
  );
}
