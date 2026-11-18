import React from "react";
import { Search, X, ArrowUpDown } from "lucide-react";

export type ConnectionSortOption = "recent" | "name" | "mutual";
export type RoleCategoryOption = "all" | "engineering" | "design" | "product";

export interface RolePill {
  id: RoleCategoryOption;
  label: string;
}

const DEFAULT_ROLE_PILLS: RolePill[] = [
  { id: "all", label: "All Roles" },
  { id: "engineering", label: "💻 Engineering" },
  { id: "design", label: "🎨 Design & UX" },
  { id: "product", label: "🚀 Product & Mgmt" },
];

export interface ConnectionFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: ConnectionSortOption;
  onSortChange: (sort: ConnectionSortOption) => void;
  roleCategory: RoleCategoryOption;
  onRoleCategoryChange: (category: RoleCategoryOption) => void;
  mutualFilter?: "all" | "has_mutual";
  onMutualFilterToggle?: () => void;
  searchPlaceholder?: string;
  rolePills?: RolePill[];
}

export default function ConnectionFilterBar({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  roleCategory,
  onRoleCategoryChange,
  mutualFilter,
  onMutualFilterToggle,
  searchPlaceholder = "Search by name, role, skill...",
  rolePills = DEFAULT_ROLE_PILLS,
}: ConnectionFilterBarProps) {
  return (
    <div className="space-y-3">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#111827] p-3 rounded-2xl border border-[#1f2937]">
        {/* Search Box */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#0f172a] border border-[#1f2937] text-xs text-white placeholder:text-slate-500 outline-none focus:border-blue-500 transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Sort and Mutual Pills */}
        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto text-xs flex-wrap">
          {onMutualFilterToggle && (
            <button
              type="button"
              onClick={onMutualFilterToggle}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                mutualFilter === "has_mutual"
                  ? "bg-purple-600 text-white"
                  : "bg-[#0f172a] text-slate-400 hover:text-white border border-[#1f2937]"
              }`}
              title="Filter contacts with mutual connections"
            >
              With Mutual
            </button>
          )}

          <span className="text-slate-400 text-[11px] font-medium mr-1 flex items-center gap-1">
            <ArrowUpDown size={11} /> Sort:
          </span>
          <button
            type="button"
            onClick={() => onSortChange("recent")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              sortBy === "recent"
                ? "bg-blue-600 text-white"
                : "bg-[#0f172a] text-slate-400 hover:text-white border border-[#1f2937]"
            }`}
          >
            Recent
          </button>
          <button
            type="button"
            onClick={() => onSortChange("name")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              sortBy === "name"
                ? "bg-blue-600 text-white"
                : "bg-[#0f172a] text-slate-400 hover:text-white border border-[#1f2937]"
            }`}
          >
            Name (A-Z)
          </button>
          <button
            type="button"
            onClick={() => onSortChange("mutual")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              sortBy === "mutual"
                ? "bg-blue-600 text-white"
                : "bg-[#0f172a] text-slate-400 hover:text-white border border-[#1f2937]"
            }`}
          >
            Mutual
          </button>
        </div>
      </div>

      {/* Role Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 text-[11px] shrink-0 font-medium">Role:</span>
        {rolePills.map((pill) => (
          <button
            key={pill.id}
            type="button"
            onClick={() => onRoleCategoryChange(pill.id)}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              roleCategory === pill.id
                ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                : "bg-[#111827] text-slate-400 hover:text-white border border-[#1f2937]"
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>
    </div>
  );
}
