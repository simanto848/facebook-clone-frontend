import React from "react";
import { Clock } from "lucide-react";

export interface ReadingTimeBadgeProps {
  content?: string;
  wordsPerMinute?: number;
  className?: string;
}

export function ReadingTimeBadge({
  content = "",
  wordsPerMinute = 200,
  className = "",
}: ReadingTimeBadgeProps) {
  const wordsCount = content ? content.trim().split(/\s+/).filter(Boolean).length : 0;
  const minutes = Math.max(1, Math.ceil(wordsCount / wordsPerMinute));

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-400 border border-slate-700 font-mono ${className}`}
      title={`${wordsCount} words, ~${minutes} min read`}
    >
      <Clock size={10} />
      <span>{minutes} min read</span>
    </span>
  );
}

export default ReadingTimeBadge;
