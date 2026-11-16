import React, { useState } from "react";
import { BadgeInfo, Plus, X } from "lucide-react";

export interface ProfileAboutCardProps {
  bio: string;
  skills: string[];
  onAddSkill: (skill: string) => void;
  onRemoveSkill: (skill: string) => void;
  className?: string;
}

export function ProfileAboutCard({
  bio,
  skills,
  onAddSkill,
  onRemoveSkill,
  className = "",
}: ProfileAboutCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    onAddSkill(trimmed);
    setNewSkill("");
    setIsAdding(false);
  };

  return (
    <div
      className={`rounded-2xl border border-[#1f2937] bg-[#111827] p-6 shadow-xl ${className}`}
    >
      <div className="mb-4 flex items-center gap-2">
        <BadgeInfo size={18} className="text-blue-400" />
        <h2 className="font-semibold text-sm text-white">About</h2>
      </div>

      <p className="text-xs leading-6 text-slate-300">{bio}</p>

      <div className="mt-5 flex flex-wrap items-center gap-1.5">
        {skills.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center gap-1 rounded-full bg-[#1f2937] pl-3 pr-2 py-1 text-[10px] font-semibold text-slate-300 border border-slate-700/50 group"
          >
            <span>{skill}</span>
            <button
              type="button"
              onClick={() => onRemoveSkill(skill)}
              className="text-slate-500 hover:text-rose-400 transition cursor-pointer p-0.5"
              title="Remove skill"
            >
              <X size={10} />
            </button>
          </span>
        ))}

        {isAdding ? (
          <form onSubmit={handleSubmit} className="inline-flex items-center gap-1">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Skill..."
              className="h-6 w-20 rounded-full bg-[#111827] border border-blue-500 px-2 text-[10px] text-white outline-none"
              autoFocus
            />
            <button
              type="submit"
              className="h-6 w-6 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-white text-xs cursor-pointer"
            >
              <Plus size={12} />
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="h-6 w-6 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-300 text-xs cursor-pointer"
            >
              <X size={12} />
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-1 rounded-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-2.5 py-1 text-[10px] font-semibold border border-blue-500/30 transition cursor-pointer"
          >
            <Plus size={11} />
            <span>Add</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default ProfileAboutCard;
