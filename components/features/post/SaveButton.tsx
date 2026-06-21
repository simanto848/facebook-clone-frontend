import React from "react";
import { Bookmark } from "lucide-react";

interface Props {
  isSaved: boolean;
  onClick: () => void;
  showText?: boolean;
}

export default function SaveButton({ isSaved, onClick, showText = false }: Props) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`
        flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition
        ${
          isSaved
            ? "text-yellow-500 hover:bg-yellow-500/10"
            : "text-slate-400 hover:bg-[#1f2937] hover:text-white"
        }
      `}
    >
      <Bookmark size={20} className={isSaved ? "fill-yellow-500" : ""} />
      {showText && <span>{isSaved ? "Saved" : "Save"}</span>}
    </button>
  );
}
