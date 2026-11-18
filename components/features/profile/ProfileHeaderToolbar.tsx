import React from "react";
import { Search, Image as ImageIcon, Film, LucideIcon } from "lucide-react";
import { ViewModeToggle } from "@/components/ui";

export interface ProfileTabItem {
  id: string;
  label: string;
  icon: LucideIcon;
  count: number;
}

export interface ProfileHeaderToolbarProps<T extends string = string> {
  tabs: ProfileTabItem[];
  activeTab: T;
  onTabChange: (tabId: T) => void;
  photosCount?: number;
  videosCount?: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  layoutMode: "feed" | "grid";
  onLayoutChange: (mode: "feed" | "grid") => void;
  searchPlaceholder?: string;
}

export default function ProfileHeaderToolbar<T extends string = string>({
  tabs,
  activeTab,
  onTabChange,
  photosCount,
  videosCount,
  searchQuery,
  onSearchChange,
  layoutMode,
  onLayoutChange,
  searchPlaceholder = "Search user posts...",
}: ProfileHeaderToolbarProps<T>) {
  return (
    <div className="px-4 md:px-12 border-b border-[#1f2937]/80 bg-[#111827]/30 sticky top-0 z-30 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-3">
      {/* Tabs */}
      <div className="flex gap-6 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as T)}
              className={`
                flex items-center gap-2 py-4 px-1.5 border-b-2 text-xs font-bold transition-all relative shrink-0 cursor-pointer
                ${
                  isActive
                    ? "border-blue-500 text-blue-400 font-extrabold"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }
              `}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isActive ? "bg-blue-600/20 text-blue-400" : "bg-slate-800 text-slate-400"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Toolbar actions & filters */}
      <div className="flex items-center gap-3 pb-3 md:pb-0">
        {(photosCount !== undefined || videosCount !== undefined) && (
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
            {photosCount !== undefined && (
              <span className="flex items-center gap-1 bg-[#111827] px-2.5 py-1 rounded-lg border border-[#1f2937]">
                <ImageIcon size={12} className="text-blue-400" /> {photosCount} photos
              </span>
            )}
            {videosCount !== undefined && (
              <span className="flex items-center gap-1 bg-[#111827] px-2.5 py-1 rounded-lg border border-[#1f2937]">
                <Film size={12} className="text-purple-400" /> {videosCount} videos
              </span>
            )}
          </div>
        )}

        <div className="relative w-full sm:w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-full bg-[#111827] border border-[#1f2937] pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        <ViewModeToggle mode={layoutMode} onChange={onLayoutChange} />
      </div>
    </div>
  );
}
