import React, { useState, useEffect } from "react";
import { Bookmark, FolderPlus, Check, X } from "lucide-react";

interface Props {
  isSaved: boolean;
  onClick: () => void;
  showText?: boolean;
  postId?: string;
}

const DEFAULT_COLLECTIONS = [
  { id: "favorites", label: "Favorites", emoji: "⭐" },
  { id: "reading", label: "Read Later", emoji: "📖" },
  { id: "inspiration", label: "Inspiration", emoji: "💡" },
  { id: "work", label: "Work & Code", emoji: "💻" },
];

export default function SaveButton({ isSaved, onClick, showText = false, postId }: Props) {
  const [showCollections, setShowCollections] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<string>("favorites");
  const [savedToast, setSavedToast] = useState<string | null>(null);

  useEffect(() => {
    if (!postId || typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(`saved_cat_${postId}`);
      if (stored) setSelectedCollection(stored);
    } catch {
      // ignore
    }
  }, [postId]);

  const handleSelectCollection = (colId: string, colLabel: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCollection(colId);
    if (postId && typeof window !== "undefined") {
      try {
        localStorage.setItem(`saved_cat_${postId}`, colId);
      } catch {
        // ignore
      }
    }
    if (!isSaved) {
      onClick();
    }
    setSavedToast(`Saved to ${colLabel}`);
    setShowCollections(false);
    setTimeout(() => setSavedToast(null), 2500);
  };

  const handleMainClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
    if (!isSaved) {
      setShowCollections(true);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleMainClick}
        onContextMenu={(e) => {
          e.preventDefault();
          setShowCollections(!showCollections);
        }}
        className={`
          flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition cursor-pointer
          ${
            isSaved
              ? "text-yellow-500 hover:bg-yellow-500/10"
              : "text-slate-400 hover:bg-[#1f2937] hover:text-white"
          }
        `}
        title="Save post or right-click to choose collection"
      >
        <Bookmark size={20} className={isSaved ? "fill-yellow-500" : ""} />
        {showText && <span>{isSaved ? "Saved" : "Save"}</span>}
      </button>

      {/* Collection Picker Popover */}
      {showCollections && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 rounded-2xl bg-[#111827] border border-[#1f2937] shadow-2xl p-2.5 z-40 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#1f2937] px-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <FolderPlus size={11} className="text-yellow-500" /> Save to Collection
            </span>
            <button
              onClick={() => setShowCollections(false)}
              className="text-slate-500 hover:text-white transition cursor-pointer"
            >
              <X size={11} />
            </button>
          </div>

          <div className="space-y-1">
            {DEFAULT_COLLECTIONS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={(e) => handleSelectCollection(c.id, c.label, e)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                  selectedCollection === c.id && isSaved
                    ? "bg-yellow-500/20 text-yellow-300 font-semibold"
                    : "text-slate-300 hover:bg-[#1f2937] hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{c.emoji}</span>
                  <span>{c.label}</span>
                </span>
                {selectedCollection === c.id && isSaved && <Check size={12} className="text-yellow-400" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {savedToast && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 rounded-full bg-slate-900 border border-yellow-500/30 text-yellow-400 text-[10px] font-semibold shadow-xl whitespace-nowrap z-50 pointer-events-none animate-in fade-in">
          {savedToast}
        </div>
      )}
    </div>
  );
}
