import React from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Loader } from "@/components/ui";

export interface ClearBookmarksBannerProps {
  count: number;
  isClearing?: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}

export default function ClearBookmarksBanner({
  count,
  isClearing = false,
  onCancel,
  onConfirm,
}: ClearBookmarksBannerProps) {
  return (
    <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
          <AlertTriangle size={18} />
        </div>
        <div>
          <h4 className="text-xs font-semibold text-rose-300">
            Clear all {count} saved bookmarks?
          </h4>
          <p className="text-[11px] text-slate-400">
            This action will remove all saved posts from your bookmarks.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 self-end sm:self-center">
        <button
          type="button"
          onClick={onCancel}
          disabled={isClearing}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isClearing}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition cursor-pointer shadow-sm shadow-rose-600/30 flex items-center gap-1.5"
        >
          {isClearing ? <Loader size="sm" /> : <Trash2 size={13} />}
          <span>{isClearing ? "Clearing..." : "Yes, Clear All"}</span>
        </button>
      </div>
    </div>
  );
}
