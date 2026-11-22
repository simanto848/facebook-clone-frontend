import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Play, Pause, X, ChevronLeft, ChevronRight, Share2 } from "lucide-react";
import { Dialog, Badge, Button } from "@/components/ui";
import { MemoryData } from "./ShareMemoryModal";

export interface MemorySlideshowModalProps {
  isOpen: boolean;
  onClose: () => void;
  memories: MemoryData[];
  onShare: (memory: MemoryData) => void;
}

export default function MemorySlideshowModal({
  isOpen,
  onClose,
  memories,
  onShare,
}: MemorySlideshowModalProps) {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIndex(0);
      setIsPlaying(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !isPlaying || memories.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((curr) => (curr + 1) % memories.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isOpen, isPlaying, memories.length]);

  const activeMemory = memories[index] || memories[0];

  if (!activeMemory) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      showHeader={false}
    >
      <div className="relative h-[480px] w-full bg-[#0a0f1d] rounded-2xl overflow-hidden flex flex-col justify-between p-5 select-none">
        {/* Top progress bars */}
        <div className="flex gap-1.5 z-20">
          {memories.map((m, idx) => (
            <div key={m.id} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
              <div
                className={`h-full bg-purple-400 transition-all duration-300 ${
                  idx < index ? "w-full" : idx === index ? "w-full" : "w-0"
                }`}
              />
            </div>
          ))}
        </div>

        {/* Header with year and controls */}
        <div className="flex items-center justify-between z-20 pt-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-bold">
              {activeMemory.yearsAgo} Year{activeMemory.yearsAgo > 1 ? "s" : ""} Ago
            </span>
            <span className="text-xs text-slate-400">• {activeMemory.dateStr}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPlaying((prev) => !prev)}
              className="p-1.5 rounded-full bg-black/40 hover:bg-white/10 text-white transition cursor-pointer"
              title={isPlaying ? "Pause autoplay" : "Play autoplay"}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} className="fill-current" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-black/40 hover:bg-white/10 text-white transition cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Slide Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-4 space-y-4">
          {activeMemory.mediaUrl ? (
            <div className="relative h-44 w-full max-w-md rounded-2xl overflow-hidden border border-purple-500/30 shadow-2xl">
              <Image
                src={activeMemory.mediaUrl}
                alt="Memory"
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover"
              />
            </div>
          ) : activeMemory.type === "friendship" ? (
            <div className="flex flex-col items-center gap-2">
              <div className="h-16 w-16 rounded-full bg-purple-600/20 border-2 border-purple-400 flex items-center justify-center text-2xl">
                🎉
              </div>
              <Badge variant="success">Friendship Anniversary</Badge>
            </div>
          ) : null}

          <p className="text-base sm:text-lg font-semibold text-white max-w-lg leading-relaxed drop-shadow-md">
            &ldquo;{activeMemory.content}&rdquo;
          </p>
        </div>

        {/* Bottom Navigation & Share Bar */}
        <div className="flex items-center justify-between z-20 pt-2 border-t border-white/10">
          <span className="text-xs text-slate-400 font-mono">
            {index + 1} of {memories.length}
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={index === 0}
              onClick={() => setIndex((curr) => Math.max(0, curr - 1))}
              className="text-white hover:bg-white/10 h-8 px-2"
            >
              <ChevronLeft size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={index === memories.length - 1}
              onClick={() => setIndex((curr) => Math.min(memories.length - 1, curr + 1))}
              className="text-white hover:bg-white/10 h-8 px-2"
            >
              <ChevronRight size={16} />
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Share2 size={13} />}
              onClick={() => {
                onClose();
                onShare(activeMemory);
              }}
              className="bg-purple-600 hover:bg-purple-700 h-8 text-xs ml-2"
            >
              Share
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
