import React from "react";

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

export default function PollPost({ question, options, userVotedOptionId, onVote }: Props) {
  const totalVotes = options.reduce((sum, option) => sum + option.votes, 0);
  const hasVoted = !!userVotedOptionId;

  return (
    <div className="rounded-2xl border border-[#1f2937] bg-[#111827]/40 p-5 mt-4 space-y-4">
      <h4 className="text-md font-semibold text-white">{question}</h4>

      <div className="space-y-3">
        {options.map((option) => {
          const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
          const isUserVote = userVotedOptionId === option.id;

          return (
            <button
              key={option.id}
              onClick={() => onVote(option.id)}
              className="relative w-full overflow-hidden rounded-xl border border-[#1f2937] bg-[#111827] p-4 text-left transition hover:border-slate-700"
            >
              {/* Progress bar overlay */}
              {hasVoted && (
                <div
                  className={`absolute top-0 left-0 bottom-0 transition-all duration-500 ease-out ${
                    isUserVote ? "bg-blue-500/25" : "bg-slate-700/20"
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              )}

              <div className="relative z-10 flex justify-between items-center text-sm">
                <div className="flex items-center gap-3">
                  {/* Option circle indicator */}
                  <div
                    className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                      isUserVote ? "border-blue-500 bg-blue-500" : "border-slate-500"
                    }`}
                  >
                    {isUserVote && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                  <span className={`font-medium ${isUserVote ? "text-blue-400 font-semibold" : "text-slate-200"}`}>
                    {option.text}
                  </span>
                </div>

                {hasVoted && (
                  <span className="text-xs font-semibold text-slate-400">
                    {percentage}% ({option.votes})
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {hasVoted && (
        <p className="text-xs text-slate-500 text-right">
          Total Votes: {totalVotes}
        </p>
      )}
    </div>
  );
}
