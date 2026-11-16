import React from "react";
import { Users2 } from "lucide-react";

export interface GuildItem {
  id?: string;
  name: string;
}

export interface GuildsCommunitiesCardProps {
  title?: string;
  guilds?: GuildItem[];
  className?: string;
}

const DEFAULT_GUILDS: GuildItem[] = [
  { id: "g1", name: "UI Brutalists & Architects" },
  { id: "g2", name: "Next.js & React 19 Core Guild" },
];

export function GuildsCommunitiesCard({
  title = "Guilds & Communities",
  guilds = DEFAULT_GUILDS,
  className = "",
}: GuildsCommunitiesCardProps) {
  const list = guilds.length > 0 ? guilds : DEFAULT_GUILDS;

  return (
    <div
      className={`rounded-2xl border border-[#1f2937] bg-[#111827] p-6 shadow-xl ${className}`}
    >
      <div className="mb-4 flex items-center gap-2">
        <Users2 size={16} className="text-purple-400" />
        <h2 className="font-semibold text-sm text-white">{title}</h2>
      </div>
      <div className="space-y-3 text-xs">
        {list.map((guild, idx) => (
          <div
            key={guild.id || idx}
            className="rounded-xl bg-[#1f2937] p-3 font-semibold text-slate-300 hover:bg-[#253245] transition cursor-pointer"
          >
            {guild.name}
          </div>
        ))}
      </div>
    </div>
  );
}

export default GuildsCommunitiesCard;
