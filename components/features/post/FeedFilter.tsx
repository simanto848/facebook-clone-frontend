import React from "react";
import { Clock, Flame, TrendingUp, Users } from "lucide-react";

interface Props {
  value: "latest" | "popular" | "trending" | "following";
  onChange: (value: "latest" | "popular" | "trending" | "following") => void;
}

export default function FeedFilter({ value, onChange }: Props) {
  const filters = [
    { id: "latest", label: "Latest", icon: Clock },
    { id: "popular", label: "Popular", icon: Flame },
    { id: "trending", label: "Trending", icon: TrendingUp },
    { id: "following", label: "Following", icon: Users },
  ] as const;

  return (
    <div className="flex items-center gap-2 rounded-2xl border border-[#1f2937] bg-[#111827] p-1">
      {filters.map((filter) => {
        const Icon = filter.icon;
        const isActive = value === filter.id;

        return (
          <button
            key={filter.id}
            onClick={() => onChange(filter.id)}
            className={`
              flex flex-1 items-center justify-center gap-2
              rounded-xl px-4 py-2.5 text-xs font-semibold
              transition-all duration-200
              ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "text-slate-400 hover:bg-[#1f2937] hover:text-white"
              }
            `}
          >
            <Icon size={14} />
            <span>{filter.label}</span>
          </button>
        );
      })}
    </div>
  );
}
