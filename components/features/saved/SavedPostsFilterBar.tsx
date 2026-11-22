import React from "react";
import { Folder, FolderPlus, X, Users, ArrowUpDown, List, LayoutGrid, LucideIcon } from "lucide-react";

export interface SavedCategoryItem {
  id: string;
  label: string;
  isCustom?: boolean;
}

export interface SavedTypeItem {
  id: string;
  label: string;
  icon?: LucideIcon;
}

export interface SavedPostsFilterBarProps {
  categories: SavedCategoryItem[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  categoryCounts: Record<string, number>;
  onDeleteCollection: (id: string, e: React.MouseEvent) => void;
  onOpenNewCollection: () => void;
  postTypes: SavedTypeItem[];
  selectedType: string;
  onSelectType: (id: string) => void;
  authors: string[];
  selectedAuthor: string;
  onSelectAuthor: (author: string) => void;
  sortBy: "newest" | "oldest" | "popular";
  onSortChange: (sort: "newest" | "oldest" | "popular") => void;
  viewMode: "list" | "grid";
  onViewModeChange: (mode: "list" | "grid") => void;
}

export default function SavedPostsFilterBar({
  categories,
  selectedCategory,
  onSelectCategory,
  categoryCounts,
  onDeleteCollection,
  onOpenNewCollection,
  postTypes,
  selectedType,
  onSelectType,
  authors,
  selectedAuthor,
  onSelectAuthor,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
}: SavedPostsFilterBarProps) {
  return (
    <div className="space-y-3">
      {/* Category Tabs & Collection Creator */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          const count = categoryCounts[cat.id] || 0;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/50"
              }`}
            >
              {cat.isCustom && <Folder size={12} className="text-amber-400" />}
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-700/60 text-slate-400"
                }`}
              >
                {count}
              </span>
              {cat.isCustom && (
                <span
                  onClick={(e) => onDeleteCollection(cat.id, e)}
                  className="ml-1 hover:text-red-400 p-0.5"
                  title="Delete collection"
                >
                  <X size={11} />
                </span>
              )}
            </button>
          );
        })}

        <button
          type="button"
          onClick={onOpenNewCollection}
          className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 bg-slate-800/50 hover:bg-slate-800 text-blue-400 border border-dashed border-blue-500/40 hover:border-blue-500 transition cursor-pointer"
          title="Create new collection folder"
        >
          <FolderPlus size={13} />
          <span>New Collection</span>
        </button>
      </div>

      {/* Format / Type filter pills & Sort selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] text-slate-500 font-medium mr-1 shrink-0">Format:</span>
          {postTypes.map((type) => {
            const isActive = selectedType === type.id;
            const IconComponent = type.icon;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => onSelectType(type.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? "bg-slate-800 text-blue-400 border border-blue-500/40"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                {IconComponent && <IconComponent size={12} />}
                <span>{type.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sort selector, Author filter & View Mode Switcher */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto flex-wrap">
          {authors.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Users size={12} className="text-slate-400" />
              <span className="text-[11px] text-slate-500 font-medium">Author:</span>
              <select
                value={selectedAuthor}
                onChange={(e) => onSelectAuthor(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1 outline-none cursor-pointer focus:border-blue-500 max-w-[130px] truncate"
              >
                <option value="all">All Authors</option>
                {authors.map((author) => (
                  <option key={author} value={author}>
                    {author}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <ArrowUpDown size={12} className="text-slate-400" />
            <span className="text-[11px] text-slate-500 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as any)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1 outline-none cursor-pointer focus:border-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          <div className="flex items-center rounded-lg bg-slate-800 p-0.5 border border-slate-700">
            <button
              type="button"
              onClick={() => onViewModeChange("list")}
              className={`p-1 rounded-md text-xs transition cursor-pointer ${
                viewMode === "list" ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
              }`}
              title="List View"
            >
              <List size={13} />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              className={`p-1 rounded-md text-xs transition cursor-pointer ${
                viewMode === "grid" ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
              }`}
              title="Grid View"
            >
              <LayoutGrid size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
