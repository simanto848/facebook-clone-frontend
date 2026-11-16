import React from "react";
import { List, LayoutGrid } from "lucide-react";

export type ViewMode = "feed" | "grid";

export interface ViewModeToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
}

export function ViewModeToggle({
  mode,
  onChange,
  className = "",
}: ViewModeToggleProps) {
  return (
    <div
      className={`flex items-center bg-[#111827] p-0.5 rounded-xl border border-[#1f2937] ${className}`}
      role="group"
      aria-label="View mode toggle"
    >
      <button
        type="button"
        onClick={() => onChange("feed")}
        className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
          mode === "feed"
            ? "bg-blue-600 text-white shadow-sm"
            : "text-slate-400 hover:text-white"
        }`}
        title="Feed layout"
        aria-pressed={mode === "feed"}
      >
        <List size={14} />
      </button>
      <button
        type="button"
        onClick={() => onChange("grid")}
        className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
          mode === "grid"
            ? "bg-blue-600 text-white shadow-sm"
            : "text-slate-400 hover:text-white"
        }`}
        title="Compact grid layout"
        aria-pressed={mode === "grid"}
      >
        <LayoutGrid size={14} />
      </button>
    </div>
  );
}

export default ViewModeToggle;
