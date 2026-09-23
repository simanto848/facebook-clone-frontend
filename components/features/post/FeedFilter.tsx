import React from "react";
import { Clock, Flame, TrendingUp, Users, Image as ImageIcon, MessageSquare, BarChart3, Sparkles } from "lucide-react";

export type FeedSortOption = "latest" | "popular" | "trending" | "following";
export type FeedFormatOption = "all" | "media" | "text" | "poll";

interface Props {
  value: FeedSortOption;
  onChange: (value: FeedSortOption) => void;
  formatFilter?: FeedFormatOption;
  onFormatChange?: (format: FeedFormatOption) => void;
}

export default function FeedFilter({ value, onChange, formatFilter = "all", onFormatChange }: Props) {
  const filters = [
    { id: "latest", label: "Latest", icon: Clock },
    { id: "popular", label: "Popular", icon: Flame },
    { id: "trending", label: "Trending", icon: TrendingUp },
    { id: "following", label: "Following", icon: Users },
  ] as const;

  const formatPills = [
    { id: "all", label: "All Posts", icon: Sparkles },
    { id: "media", label: "Media & Photos", icon: ImageIcon },
    { id: "text", label: "Discussions", icon: MessageSquare },
    { id: "poll", label: "Polls", icon: BarChart3 },
  ] as const;

  return (
    <div className="space-y-2">
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
                transition-all duration-200 cursor-pointer
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

      {onFormatChange && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {formatPills.map((pill) => {
            const Icon = pill.icon;
            const isSelected = formatFilter === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => onFormatChange(pill.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-xs"
                    : "bg-[#111827] text-slate-400 border border-[#1f2937] hover:border-slate-600 hover:text-slate-200"
                }`}
              >
                <Icon size={12} className={isSelected ? "text-blue-400" : "text-slate-500"} />
                <span>{pill.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
