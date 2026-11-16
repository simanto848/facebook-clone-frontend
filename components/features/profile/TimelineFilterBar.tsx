import React from "react";
import { FileText, Image as ImageIcon } from "lucide-react";

export type PostFormatFilterType = "all" | "text" | "media";

export interface TimelineFilterBarProps {
  activeFilter: PostFormatFilterType;
  onChange: (filter: PostFormatFilterType) => void;
  totalCount: number;
  mediaCount: number;
  className?: string;
}

export function TimelineFilterBar({
  activeFilter,
  onChange,
  totalCount,
  mediaCount,
  className = "",
}: TimelineFilterBarProps) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#111827]/60 border border-[#1f2937] p-2 rounded-xl ${className}`}
    >
      <span className="text-[11px] font-semibold text-slate-400 pl-2">
        Filter Timeline:
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange("all")}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeFilter === "all"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-400 hover:text-white"
          }`}
        >
          All ({totalCount})
        </button>
        <button
          type="button"
          onClick={() => onChange("text")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeFilter === "text"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <FileText size={12} />
          <span>Discussions</span>
        </button>
        <button
          type="button"
          onClick={() => onChange("media")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeFilter === "media"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <ImageIcon size={12} />
          <span>Media ({mediaCount})</span>
        </button>
      </div>
    </div>
  );
}

export default TimelineFilterBar;
