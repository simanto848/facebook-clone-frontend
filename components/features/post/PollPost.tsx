"use client";

import React, { useState } from "react";
import { CheckCircle2, BarChart2, Eye, EyeOff } from "lucide-react";
import { Badge, Button } from "@/components/ui";

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface Props {
  question: string;
  options: PollOption[];
  userVotedOptionId?: string;
  onVote: (optionId: string) => void;
}

export default function PollPost({ question, options = [], userVotedOptionId, onVote }: Props) {
  const [showResultsAnyway, setShowResultsAnyway] = useState(false);
  const totalVotes = options.reduce((sum, option) => sum + option.votes, 0);
  const hasVoted = !!userVotedOptionId;
  const isDisplayingResults = hasVoted || showResultsAnyway;

  return (
    <div className="rounded-2xl border border-[#1f2937] bg-[#111827]/60 p-5 mt-4 space-y-4 shadow-lg select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart2 size={16} className="text-blue-400" />
          <h4 className="text-sm font-bold text-white leading-tight">{question}</h4>
        </div>
        <Badge variant="secondary" size="sm">
          {totalVotes} {totalVotes === 1 ? "Vote" : "Votes"}
        </Badge>
      </div>

      <div className="space-y-3">
        {options.map((option) => {
          const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
          const isUserVote = userVotedOptionId === option.id;

          return (
            <button
              key={option.id}
              onClick={() => onVote(option.id)}
              className={`relative w-full overflow-hidden rounded-xl border p-3.5 text-left transition ${
                isUserVote
                  ? "border-blue-500 bg-blue-600/10 shadow-md shadow-blue-600/5"
                  : "border-[#1f2937] bg-[#111827] hover:border-slate-600"
              }`}
            >
              {/* Progress bar overlay */}
              {isDisplayingResults && (
                <div
                  className={`absolute top-0 left-0 bottom-0 transition-all duration-500 ease-out ${
                    isUserVote ? "bg-blue-600/30" : "bg-slate-700/30"
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

      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-[#1f2937]/50">
        <span>{hasVoted ? "You voted in this poll" : "Click an option to cast your vote"}</span>
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
