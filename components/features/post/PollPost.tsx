"use client";

import React, { useState } from "react";
import { CheckCircle2, BarChart2, Eye, EyeOff, RotateCcw, Trophy, Clock, Plus } from "lucide-react";
import { Badge } from "@/components/ui";

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface Props {
  question: string;
  options: PollOption[];
  userVotedOptionId?: string;
  onVote: (optionId: string) => void;
  onRetractVote?: () => void;
  expiresIn?: string;
  allowAddOption?: boolean;
  onAddOption?: (newOptionText: string) => void;
}

export default function PollPost({
  question,
  options = [],
  userVotedOptionId,
  onVote,
  onRetractVote,
  expiresIn = "3 days left",
  allowAddOption = true,
  onAddOption,
}: Props) {
  const [showResultsAnyway, setShowResultsAnyway] = useState(false);
  const [localOptions, setLocalOptions] = useState<PollOption[]>(options);
  const [showAddInput, setShowAddInput] = useState(false);
  const [newOptionText, setNewOptionText] = useState("");

  // Sync if prop options change
  React.useEffect(() => {
    setLocalOptions(options);
  }, [options]);

  const totalVotes = localOptions.reduce((sum, option) => sum + option.votes, 0);
  const hasVoted = !!userVotedOptionId;
  const isDisplayingResults = hasVoted || showResultsAnyway;

  const maxVotes = Math.max(...localOptions.map((o) => o.votes), 0);

  const handleAddNewOption = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOptionText.trim()) return;
    const text = newOptionText.trim();
    if (onAddOption) {
      onAddOption(text);
    } else {
      const created: PollOption = {
        id: `opt_${Date.now()}`,
        text,
        votes: 1,
      };
      setLocalOptions((prev) => [...prev, created]);
      onVote(created.id);
    }
    setNewOptionText("");
    setShowAddInput(false);
  };

  return (
    <div className="rounded-2xl border border-[#1f2937] bg-[#111827]/60 p-5 mt-4 space-y-4 shadow-lg select-none">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <BarChart2 size={16} className="text-blue-400" />
          <h4 className="text-sm font-bold text-white leading-tight">{question}</h4>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[11px] font-medium text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
            <Clock size={11} />
            <span>{expiresIn}</span>
          </div>
          <Badge variant="secondary" size="sm">
            {totalVotes} {totalVotes === 1 ? "Vote" : "Votes"}
          </Badge>
        </div>
      </div>

      <div className="space-y-3">
        {localOptions.map((option) => {
          const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
          const isUserVote = userVotedOptionId === option.id;
          const isLeading = isDisplayingResults && maxVotes > 0 && option.votes === maxVotes && totalVotes > 1;

          return (
            <button
              key={option.id}
              onClick={() => onVote(option.id)}
              className={`relative w-full overflow-hidden rounded-xl border p-3.5 text-left transition cursor-pointer ${
                isUserVote
                  ? "border-blue-500 bg-blue-600/10 shadow-md shadow-blue-600/5"
                  : isLeading
                  ? "border-amber-500/40 bg-[#141b2d] hover:border-amber-500/60"
                  : "border-[#1f2937] bg-[#111827] hover:border-slate-600"
              }`}
            >
              {/* Progress bar overlay */}
              {isDisplayingResults && (
                <div
                  className={`absolute top-0 left-0 bottom-0 transition-all duration-500 ease-out ${
                    isUserVote
                      ? "bg-blue-600/30"
                      : isLeading
                      ? "bg-amber-500/20"
                      : "bg-slate-700/30"
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              )}

              <div className="relative z-10 flex justify-between items-center text-xs">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2
                    size={16}
                    className={isUserVote ? "text-blue-400 fill-blue-500/20" : "text-slate-500"}
                  />
                  <span className={`font-semibold ${isUserVote ? "text-white font-bold" : "text-slate-200"}`}>
                    {option.text}
                  </span>
                  {isLeading && (
                    <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded-full">
                      <Trophy size={10} />
                      <span>Leading</span>
                    </span>
                  )}
                </div>

                {isDisplayingResults && (
                  <span className="text-[11px] font-bold text-slate-300">
                    {percentage}% <span className="font-normal text-slate-400">({option.votes})</span>
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Add Custom Option form */}
      {allowAddOption && !hasVoted && (
        <div>
          {showAddInput ? (
            <form onSubmit={handleAddNewOption} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Enter new poll option..."
                value={newOptionText}
                onChange={(e) => setNewOptionText(e.target.value)}
                autoFocus
                className="flex-1 text-xs bg-[#0f172a] border border-[#1f2937] rounded-lg px-3 py-1.5 text-white outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!newOptionText.trim()}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition"
              >
                Add & Vote
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddInput(false);
                  setNewOptionText("");
                }}
                className="px-2.5 py-1.5 text-slate-400 hover:text-white text-xs transition"
              >
                Cancel
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddInput(true)}
              className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition font-medium cursor-pointer"
            >
              <Plus size={13} />
              <span>Add another option</span>
            </button>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-[#1f2937]/50">
        <div className="flex items-center gap-2">
          <span>{hasVoted ? "You voted in this poll" : "Click an option to cast your vote"}</span>
          {hasVoted && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onRetractVote) {
                  onRetractVote();
                } else {
                  onVote("");
                }
              }}
              className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition cursor-pointer underline"
              title="Change your vote"
            >
              <RotateCcw size={11} />
              <span>Change vote</span>
            </button>
          )}
        </div>
        {!hasVoted && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowResultsAnyway((prev) => !prev);
            }}
            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition font-medium cursor-pointer"
          >
            {showResultsAnyway ? <EyeOff size={13} /> : <Eye size={13} />}
            <span>{showResultsAnyway ? "Hide Results" : "View Results"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
