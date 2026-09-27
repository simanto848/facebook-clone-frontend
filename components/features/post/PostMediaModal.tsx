"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, Heart, Share2, ZoomIn, ZoomOut, RotateCw, RotateCcw, Download, Check } from "lucide-react";
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
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [copiedShare, setCopiedShare] = useState(false);

  // Reset zoom and rotation when current image changes
  useEffect(() => {
    setZoom(1);
    setRotation(0);
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1);
      } else if (e.key === "ArrowRight" && currentIndex < images.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, images.length, onClose]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom((prev) => Math.max(prev - 0.25, 0.75));
  };

  const handleRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleResetTransform = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom(1);
    setRotation(0);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const a = document.createElement("a");
    a.href = currentImage;
    a.download = `photo_${author.name.toLowerCase().replace(/\s+/g, "_")}_${currentIndex + 1}.jpg`;
    a.target = "_blank";
    a.click();
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(currentImage);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    } catch {
      // fallback
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="xl" showHeader={false}>
      <div className="relative h-[620px] w-full bg-black rounded-2xl overflow-hidden flex flex-col md:flex-row select-none">
        {/* Media Viewing Column */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
          {/* Top Controls Overlay */}
          <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2 pointer-events-auto">
              <Badge variant="glass">
                {currentIndex + 1} / {images.length}
              </Badge>
              {zoom !== 1 && (
                <span className="px-2 py-0.5 rounded-full bg-black/60 text-[10px] text-blue-400 font-mono border border-blue-500/30">
                  {Math.round(zoom * 100)}%
                </span>
              )}
            </div>

            {/* Quick action toolbar */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 pointer-events-auto">
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoom >= 3}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-40 transition cursor-pointer"
                title="Zoom in"
              >
                <ZoomIn size={14} />
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoom <= 0.75}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-40 transition cursor-pointer"
                title="Zoom out"
              >
                <ZoomOut size={14} />
              </button>
              <button
                type="button"
                onClick={handleRotate}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                title="Rotate clockwise"
              >
                <RotateCw size={14} />
              </button>
              {(zoom !== 1 || rotation !== 0) && (
                <button
                  type="button"
                  onClick={handleResetTransform}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  title="Reset zoom & rotation"
                >
                  <RotateCcw size={14} />
                </button>
              )}
              <button
                type="button"
                onClick={handleDownload}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                title="Download image"
              >
                <Download size={14} />
              </button>
            </div>
          </div>

          {/* Close button on mobile/desktop */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-40 md:hidden p-2 rounded-full bg-black/70 text-white hover:bg-black/90 transition cursor-pointer"
          >
            <X size={16} />
          </button>

          {/* Scaled / Rotated Image Container */}
          <div
            className="relative w-full h-full flex items-center justify-center transition-transform duration-200 ease-out"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
            }}
          >
            <Image
              src={currentImage}
              alt="Media preview"
              fill
              sizes="(max-width: 768px) 100vw, 70vw"
              className="object-contain"
              priority
            />
          </div>

          {images.length > 1 && currentIndex > 0 && (
            <button
              onClick={() => setCurrentIndex(currentIndex - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition cursor-pointer"
              title="Previous image"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {images.length > 1 && currentIndex < images.length - 1 && (
            <button
              onClick={() => setCurrentIndex(currentIndex + 1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition cursor-pointer"
              title="Next image"
            >
              <ChevronRight size={20} />
            </button>
          )}
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
              <button
                type="button"
                onClick={onClose}
                className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="Close"
              >
                <X size={16} />
              </button>
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
              leftIcon={copiedShare ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
              onClick={handleShare}
            >
              {copiedShare ? "Copied!" : "Share Link"}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

