"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Heart, Eye, Trash2, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Dialog, Avatar, Button, Badge } from "@/components/ui";

export interface StoryItem {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  type: "text" | "image" | "video";
  content: string;
  views?: number;
  likes?: number;
  hasLiked?: boolean;
}

interface StoryViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  stories: StoryItem[];
  currentIndex: number;
  onNavigate: (newIndex: number) => void;
  onLike?: (storyId: string) => void;
  onDelete?: (storyId: string) => void;
}

export function StoryViewerModal({
  isOpen,
  onClose,
  stories = [],
  currentIndex,
  onNavigate,
  onLike,
  onDelete,
}: StoryViewerModalProps) {
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [floatingReactions, setFloatingReactions] = useState<{ id: number; emoji: string }[]>([]);
  const [reactionToast, setReactionToast] = useState<string | null>(null);
  const currentStory = stories[currentIndex];

  const handleQuickReaction = (emoji: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const id = Date.now();
    setFloatingReactions((prev) => [...prev, { id, emoji }]);
    setReactionToast(`Sent ${emoji} to ${currentStory.author.name}`);
    if (emoji === "❤️" && onLike) {
      onLike(currentStory.id);
    }
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
    }, 1400);
    setTimeout(() => {
      setReactionToast(null);
    }, 2200);
  };

  useEffect(() => {
    if (!isOpen || !currentStory) return;
    setProgress(0);
    setIsPaused(false);
  }, [currentIndex, isOpen, currentStory]);

  useEffect(() => {
    if (!isOpen || !currentStory || isPaused) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentIndex < stories.length - 1) {
            onNavigate(currentIndex + 1);
          } else {
            onClose();
          }
          return 0;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen, currentIndex, currentStory, isPaused, stories.length, onNavigate, onClose]);

  // Keyboard controls
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setIsPaused((prev) => !prev);
      } else if (e.code === "ArrowLeft" && currentIndex > 0) {
        onNavigate(currentIndex - 1);
      } else if (e.code === "ArrowRight" && currentIndex < stories.length - 1) {
        onNavigate(currentIndex + 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, stories.length, onNavigate]);

  if (!currentStory) return null;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="lg" showHeader={false}>
      <div
        className="relative h-[540px] w-full bg-black rounded-2xl overflow-hidden flex flex-col justify-between p-4 select-none cursor-pointer"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Paused Indicator Floating Pill */}
        {isPaused && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white text-xs font-semibold shadow-lg pointer-events-none animate-pulse">
            <Pause size={12} className="text-amber-400" />
            <span>Paused</span>
          </div>
        )}

        {/* Top Progress bar */}
        <div className="flex gap-1 z-20" onMouseDown={(e) => e.stopPropagation()}>
          {stories.map((s, idx) => (
            <div key={s.id} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-100"
                style={{
                  width:
                    idx < currentIndex ? "100%" : idx === currentIndex ? `${progress}%` : "0%",
                }}
              />
            </div>
          ))}
        </div>

        {/* Author Header */}
        <div
          className="flex items-center justify-between z-20 pt-2"
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2.5">
            <Avatar src={currentStory.author.avatar} name={currentStory.author.name} size="sm" />
            <div>
              <p className="text-xs font-bold text-white leading-tight">{currentStory.author.name}</p>
              <span className="text-[10px] text-slate-300">Just now</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsPaused((prev) => !prev);
              }}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition"
              title={isPaused ? "Play Story (Space)" : "Pause Story (Space)"}
            >
              {isPaused ? <Play size={15} /> : <Pause size={15} />}
            </button>

            {currentStory.type === "video" && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMuted((prev) => !prev);
                }}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>
            )}

            <Badge variant="glass">{currentStory.type.toUpperCase()}</Badge>
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(currentStory.id);
                }}
                className="p-1 text-white/70 hover:text-rose-400 hover:bg-white/10 rounded-full transition"
                title="Delete Story"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        {currentIndex > 0 && (
          <button
            onClick={() => onNavigate(currentIndex - 1)}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center text-white transition"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {currentIndex < stories.length - 1 && (
          <button
            onClick={() => onNavigate(currentIndex + 1)}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center text-white transition"
          >
            <ChevronRight size={20} />
          </button>
        )}

        {/* Media Content */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {currentStory.type === "text" ? (
            <div className="h-full w-full bg-linear-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center p-8 text-center">
              <p className="text-xl font-bold text-white drop-shadow-md leading-relaxed">
                {currentStory.content}
              </p>
            </div>
          ) : currentStory.type === "video" ? (
            <video
              src={currentStory.content}
              autoPlay
              muted={isMuted}
              loop
              playsInline
              className="h-full w-full object-cover"
            />
          ) : (
            <Image
              src={currentStory.content}
              alt="Story"
              fill
              sizes="(max-width: 768px) 100vw, 600px"
              className="object-cover"
            />
          )}
        </div>

        {/* Floating animated reactions */}
        {floatingReactions.map((r) => (
          <div
            key={r.id}
            className="absolute bottom-28 right-8 z-40 text-4xl pointer-events-none animate-bounce"
          >
            {r.emoji}
          </div>
        ))}

        {reactionToast && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-medium shadow-xl pointer-events-none animate-in fade-in duration-200">
            {reactionToast}
          </div>
        )}

        {/* Footer Quick Reactions & Actions */}
        <div
          className="z-20 border-t border-white/10 pt-2 space-y-2"
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          {/* Quick Reaction Emoji Bar */}
          <div className="flex items-center justify-center gap-2">
            {["❤️", "🔥", "😂", "😮", "😢", "👏"].map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={(e) => handleQuickReaction(emoji, e)}
                className="text-lg p-1.5 rounded-full bg-black/40 hover:bg-white/25 hover:scale-125 active:scale-95 transition-all cursor-pointer shadow-md"
                title={`React with ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Eye size={14} />
              <span>{currentStory.views || 12} views</span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Heart size={16} className={currentStory.hasLiked ? "fill-red-500 text-red-500" : "text-white"} />}
              onClick={() => onLike?.(currentStory.id)}
            >
              {currentStory.likes || 0}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
