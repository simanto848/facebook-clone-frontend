import React from "react";
import { CheckSquare, Square, Trash2 } from "lucide-react";
import { Loader } from "@/components/ui";

export interface BatchSelectionBarProps {
  selectedCount: number;
  totalCount: number;
  isDeleting?: boolean;
  onSelectAll: () => void;
  onCancel: () => void;
  onDeleteSelected: () => void | Promise<void>;
}

export default function BatchSelectionBar({
  selectedCount,
  totalCount,
  isDeleting = false,
  onSelectAll,
  onCancel,
  onDeleteSelected,
}: BatchSelectionBarProps) {
  const isAllSelected = selectedCount > 0 && selectedCount === totalCount;

  return (
    <div className="p-3 px-4 rounded-xl bg-slate-900 border border-blue-500/40 flex items-center justify-between gap-3 sticky top-4 z-20 shadow-lg backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onSelectAll}
          className="flex items-center gap-2 text-xs font-semibold text-slate-200 hover:text-white cursor-pointer"
        >
          {isAllSelected ? (
            <CheckSquare size={16} className="text-blue-400" />
          ) : (
            <Square size={16} className="text-slate-400" />
          )}
          <span>Select All ({totalCount})</span>
        </button>
        <span className="text-xs text-slate-400">
          • <strong className="text-white">{selectedCount}</strong> selected
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isDeleting}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={selectedCount === 0 || isDeleting}
          onClick={onDeleteSelected}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer shadow-sm shadow-rose-600/30 flex items-center gap-1.5"
        >
          {isDeleting ? <Loader size="sm" /> : <Trash2 size={13} />}
          <span>Delete Selected ({selectedCount})</span>
        </button>
      </div>
    </div>
  );
}
