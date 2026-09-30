import React from "react";

interface Props {
  onSelect: (reaction: string) => void;
  onClose?: () => void;
}

export const reactionsList = [
  { type: "like", label: "Like", emoji: "👍", color: "text-blue-400" },
  { type: "love", label: "Love", emoji: "❤️", color: "text-red-500" },
  { type: "haha", label: "Haha", emoji: "😂", color: "text-yellow-400" },
  { type: "wow", label: "Wow", emoji: "😮", color: "text-yellow-400" },
  { type: "sad", label: "Sad", emoji: "😢", color: "text-yellow-400" },
  { type: "angry", label: "Angry", emoji: "😡", color: "text-orange-500" },
];

const playReactionSound = (type: string) => {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    let baseFreq = 440;
    if (type === "like") baseFreq = 523.25;
    else if (type === "love") baseFreq = 659.25;
    else if (type === "haha") baseFreq = 587.33;
    else if (type === "wow") baseFreq = 783.99;
    else if (type === "sad") baseFreq = 392.00;
    else if (type === "angry") baseFreq = 329.63;

    osc.type = "sine";
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.3, now + 0.12);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.start(now);
    osc.stop(now + 0.15);
  } catch {
    // ignore audio failure
  }

  try {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(20);
    }
  } catch {
    // ignore
  }
};

export default function ReactionPicker({ onSelect, onClose }: Props) {
  return (
    <div
      className="
        absolute -top-14 left-0 z-50
        flex gap-2.5 rounded-full border border-[#1f2937]
        bg-[#111827] px-4 py-2.5 shadow-2xl
        animate-in fade-in slide-in-from-bottom-2 duration-200
      "
      onMouseLeave={onClose}
    >
      {reactionsList.map((reaction) => (
        <button
          key={reaction.type}
          onClick={(e) => {
            e.stopPropagation();
            playReactionSound(reaction.type);
            onSelect(reaction.type);
            if (onClose) onClose();
          }}
          className="
            relative text-2xl transition duration-200
            hover:scale-135 hover:-translate-y-1.5
            group/btn cursor-pointer
          "
          title={reaction.label}
        >
          <span>{reaction.emoji}</span>
          <span
            className="
              absolute -top-7 left-1/2 -translate-x-1/2
              hidden rounded-md bg-black px-2 py-0.5 text-[10px]
              font-bold text-white group-hover/btn:block
            "
          >
            {reaction.label}
          </span>
        </button>
      ))}
    </div>
  );
}
