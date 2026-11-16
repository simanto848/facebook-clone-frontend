import React from "react";
import Image from "next/image";
import { Plus, X } from "lucide-react";

export interface FeaturedHighlightItem {
  id: string;
  title: string;
  image: string;
}

export interface FeaturedHighlightsCardProps {
  items: FeaturedHighlightItem[];
  onAddClick: () => void;
  onRemoveItem: (id: string, e: React.MouseEvent) => void;
  className?: string;
}

export function FeaturedHighlightsCard({
  items,
  onAddClick,
  onRemoveItem,
  className = "",
}: FeaturedHighlightsCardProps) {
  return (
    <div
      className={`rounded-2xl border border-[#1f2937] bg-[#111827] p-6 shadow-xl space-y-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-sm text-white">Featured Highlights</h2>
          <p className="text-[11px] text-slate-400">Pinned showcases & collections</p>
        </div>
        <button
          type="button"
          onClick={onAddClick}
          className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition cursor-pointer flex items-center gap-1"
        >
          <Plus size={13} />
          <span>Add</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="aspect-square rounded-xl bg-[#1f2937] relative overflow-hidden group border border-[#1f2937] hover:border-blue-500/50 transition cursor-pointer"
          >
            <Image
              src={item.image}
              fill
              sizes="150px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              alt={item.title}
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
              <span className="text-xs font-bold text-white truncate drop-shadow-md">
                {item.title}
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => onRemoveItem(item.id, e)}
              className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 hover:bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition cursor-pointer"
              title="Remove highlight"
            >
              <X size={11} />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={onAddClick}
          className="aspect-square rounded-xl bg-[#1f2937]/50 hover:bg-[#1f2937] border border-dashed border-slate-700 hover:border-blue-500 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-blue-400 transition cursor-pointer"
          title="Add new featured highlight"
        >
          <Plus size={18} />
          <span className="text-[10px] font-semibold">New</span>
        </button>
      </div>
    </div>
  );
}

export default FeaturedHighlightsCard;
