import React from "react";

export interface ReactionBreakdownItem {
  key: string;
  label: string;
  emoji: string;
  count: number;
  color: string;
}

export interface ReactionBreakdownProps {
  reactions?: Record<string, number | undefined> | null;
  className?: string;
}

const DEFAULT_REACTION_CONFIG: {
  key: string;
  label: string;
  emoji: string;
  color: string;
}[] = [
  { key: "like", label: "Like", emoji: "👍", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  { key: "love", label: "Love", emoji: "❤️", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
  { key: "haha", label: "Haha", emoji: "😆", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  { key: "wow", label: "Wow", emoji: "😮", color: "text-amber-300 bg-amber-500/10 border-amber-500/20" },
  { key: "sad", label: "Sad", emoji: "😢", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
  { key: "angry", label: "Angry", emoji: "😡", color: "text-red-400 bg-red-500/10 border-red-500/20" },
];

export function ReactionBreakdown({ reactions, className = "" }: ReactionBreakdownProps) {
  if (!reactions) return null;

  const total = Object.values(reactions).reduce<number>(
    (sum, val) => sum + (typeof val === "number" ? val : 0),
    0
  );

  const reactionItems = DEFAULT_REACTION_CONFIG.map((config) => ({
    ...config,
    count: reactions[config.key] || 0,
  })).filter((r) => r.count > 0);

  if (reactionItems.length === 0) return null;

  return (
    <div
      className={`p-4 rounded-2xl border border-[#1f2937] bg-[#111827]/60 backdrop-blur-sm space-y-2.5 ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-300 tracking-wide uppercase">
          Reaction Breakdown ({total})
        </span>
        <span className="text-[11px] text-slate-500">
          {reactionItems.length} reaction type{reactionItems.length > 1 ? "s" : ""}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {reactionItems.map((r) => (
          <div
            key={r.key}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${r.color}`}
          >
            <span className="text-sm">{r.emoji}</span>
            <span>{r.label}</span>
            <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-[10px]">
              {r.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReactionBreakdown;
