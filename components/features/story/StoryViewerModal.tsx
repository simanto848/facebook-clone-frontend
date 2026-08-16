"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Heart, Eye } from "lucide-react";
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
}

export function StoryViewerModal({
  isOpen,
  onClose,
  stories = [],
  currentIndex,
  onNavigate,
  onLike,
}: StoryViewerModalProps) {
  const [progress, setProgress] = useState(0);
  const currentStory = stories[currentIndex];

  useEffect(() => {
    if (!isOpen || !currentStory) return;
    setProgress(0);
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
  }, [isOpen, currentIndex, currentStory, stories.length, onNavigate, onClose]);

  if (!currentStory) return null;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="lg" showHeader={false}>
      <div className="relative h-[540px] w-full bg-black rounded-2xl overflow-hidden flex flex-col justify-between p-4">
        {/* Top Progress bar */}
        <div className="flex gap-1 z-20">
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
        <div className="flex items-center justify-between z-20 pt-2">
          <div className="flex items-center gap-2.5">
            <Avatar src={currentStory.author.avatar} name={currentStory.author.name} size="sm" />
            <div>
              <p className="text-xs font-bold text-white leading-tight">{currentStory.author.name}</p>
              <span className="text-[10px] text-slate-300">Just now</span>
            </div>
          </div>
          <Badge variant="glass">{currentStory.type.toUpperCase()}</Badge>
        </div>

        {/* Navigation Buttons */}
        {currentIndex > 0 && (
          <button
            onClick={() => onNavigate(currentIndex - 1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center text-white transition"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {currentIndex < stories.length - 1 && (
          <button
            onClick={() => onNavigate(currentIndex + 1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center text-white transition"
          >
            <ChevronRight size={20} />
          </button>
        )}

        {/* Media Content */}
        <div className="absolute inset-0 flex items-center justify-center">
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
              muted
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

        {/* Footer Actions */}
        <div className="flex items-center justify-between z-20 border-t border-white/10 pt-3">
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
    </Dialog>
  );
}
