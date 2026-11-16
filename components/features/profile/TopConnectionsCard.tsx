import React from "react";
import Link from "next/link";
import { Users } from "lucide-react";
import { Avatar } from "@/components/ui";

export interface TopConnectionItem {
  id?: string;
  name?: string;
  username?: string;
  avatarUrl?: string;
  profilePicture?: string;
  avatar?: string;
  headline?: string;
  bio?: string;
}

export interface TopConnectionsCardProps {
  friends?: TopConnectionItem[];
  title?: string;
  viewAllHref?: string;
  className?: string;
}

const DEFAULT_FRIENDS: TopConnectionItem[] = [
  {
    id: "1",
    name: "Sarah Chen",
    avatarUrl:
      "https://images.unsplash.com/photo-1780570589435-059359e813cc?q=80&w=100&auto=format&fit=crop",
    headline: "Product Designer",
  },
  {
    id: "2",
    name: "David Kim",
    avatarUrl:
      "https://images.unsplash.com/photo-1780764895105-ea3037466236?q=80&w=100&auto=format&fit=crop",
    headline: "Frontend Specialist",
  },
  {
    id: "3",
    name: "Elena Rostova",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    headline: "AI Engineer",
  },
];

export function TopConnectionsCard({
  friends = [],
  title = "Top Connections",
  viewAllHref = "/connections",
  className = "",
}: TopConnectionsCardProps) {
  const displayList = friends.length > 0 ? friends : DEFAULT_FRIENDS;

  return (
    <div
      className={`rounded-2xl border border-[#1f2937] bg-[#111827] p-6 shadow-xl ${className}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-blue-400" />
          <h2 className="font-semibold text-sm">{title}</h2>
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-[11px] font-semibold text-blue-400 hover:underline"
          >
            View All
          </Link>
        )}
      </div>

      <div className="space-y-2">
        {displayList.map((friend) => (
          <Link
            key={friend.id || friend.name || friend.username}
            href={`/profile/${friend.id || friend.username || ""}`}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/60 transition group cursor-pointer"
          >
            <Avatar
              src={friend.avatarUrl || friend.profilePicture || friend.avatar}
              name={friend.name || friend.username || "Friend"}
              size="md"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                {friend.name || friend.username}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                {friend.headline || friend.bio || "Active Contributor"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default TopConnectionsCard;
