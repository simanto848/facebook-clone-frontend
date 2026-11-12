import React from "react";

export interface ProfileStatItem {
  label: string;
  value: number | string;
}

export interface ProfileStatsBarProps {
  stats?: ProfileStatItem[];
  postsCount?: number;
  followersCount?: number;
  followingCount?: number;
  className?: string;
}

export function ProfileStatsBar({
  stats,
  postsCount,
  followersCount,
  followingCount,
  className = "",
}: ProfileStatsBarProps) {
  const items: ProfileStatItem[] = stats || [
    { label: "Posts", value: postsCount ?? 0 },
    { label: "Followers", value: followersCount ?? 0 },
    { label: "Following", value: followingCount ?? 0 },
  ];

  return (
    <div
      className={`grid grid-cols-${items.length} border-t border-[#1f2937]/80 bg-[#111827]/60 py-3 text-center text-xs ${className}`}
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      {items.map((stat, idx) => (
        <div key={idx}>
          <p className="font-extrabold text-base text-white">{stat.value}</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

export default ProfileStatsBar;
