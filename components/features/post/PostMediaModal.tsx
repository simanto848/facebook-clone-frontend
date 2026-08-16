"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, Heart, MessageSquare, Share2 } from "lucide-react";
import { Dialog, Avatar, Button, Badge } from "@/components/ui";

export interface PostMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
  author: {
    name: string;
    avatar: string;
  };
  caption?: string;
}

export function PostMediaModal({
  isOpen,
  onClose,
  images = [],
  initialIndex = 0,
  author,
  caption,
}: PostMediaModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [liked, setLiked] = useState(false);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="xl" showHeader={false}>
      <div className="relative h-[600px] w-full bg-black rounded-2xl overflow-hidden flex flex-col md:flex-row select-none">
        {/* Media Viewing Column */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
          <Image
            src={currentImage}
            alt="Media preview"
            fill
            sizes="(max-width: 768px) 100vw, 70vw"
            className="object-contain"
          />

          {images.length > 1 && currentIndex > 0 && (
            <button
              onClick={() => setCurrentIndex(currentIndex - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {images.length > 1 && currentIndex < images.length - 1 && (
            <button
              onClick={() => setCurrentIndex(currentIndex + 1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition"
            >
              <ChevronRight size={20} />
            </button>
          )}

          <div className="absolute top-4 left-4 z-20">
            <Badge variant="glass">
              {currentIndex + 1} / {images.length}
            </Badge>
          </div>
        </div>

        {/* Info Sidebar Column */}
        <div className="w-full md:w-80 bg-[#111827] p-5 flex flex-col justify-between border-t md:border-t-0 md:border-l border-[#1f2937] text-white">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#1f2937] pb-3">
              <div className="flex items-center gap-3">
                <Avatar src={author.avatar} name={author.name} size="md" />
                <div>
                  <h4 className="text-xs font-bold text-white">{author.name}</h4>
                  <span className="text-[10px] text-slate-400">Timeline Post</span>
                </div>
              </div>
            </div>

            {caption && <p className="text-xs text-slate-300 leading-relaxed">{caption}</p>}
          </div>

          <div className="pt-4 border-t border-[#1f2937] flex gap-2">
            <Button
              variant={liked ? "danger" : "secondary"}
              fullWidth
              size="sm"
              leftIcon={<Heart size={14} className={liked ? "fill-white" : ""} />}
              onClick={() => setLiked(!liked)}
            >
              {liked ? "Liked" : "Like"}
            </Button>

            <Button
              variant="secondary"
              fullWidth
              size="sm"
              leftIcon={<Share2 size={14} />}
              onClick={() => alert("Media link copied!")}
            >
              Share
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
