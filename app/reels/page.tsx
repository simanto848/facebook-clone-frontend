"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Heart,
  MessageCircle,
  Share2,
  Music,
  Volume2,
  VolumeX,
  Plus,
  Play,
  Pause,
  ArrowLeft,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import { postService } from "@/services/postService";
import { reactionService } from "@/services/reactionService";
import { friendshipService } from "@/services/friendshipService";

interface ReelItem {
  id: string;
  author: {
    name: string;
    avatar: string;
    handle: string;
  };
  authorId?: string;
  videoUrl: string;
  caption: string;
  musicTitle: string;
  likes: number;
  comments: number;
  shares: number;
  hasLiked?: boolean;
  userReaction?: string;
}

const DEFAULT_REELS: ReelItem[] = [
  {
    id: "reel-1",
    author: {
      name: "Sophia Martinez",
      handle: "sophiamartinez",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
    },
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-tree-branches-in-the-breeze-1188-large.mp4",
    caption: "Sunset breeze through the trees 🌅✨ #nature #peaceful #vibes",
    musicTitle: "Chill Beats • Lofi Chillout",
    likes: 1420,
    comments: 89,
    shares: 34,
  },
  {
    id: "reel-2",
    author: {
      name: "David Chen",
      handle: "davidchen_dev",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    },
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-vertical-shot-of-a-waterfall-in-a-forest-42898-large.mp4",
    caption: "Hidden waterfalls in the mountains 🏔️💧 #hiking #explore",
    musicTitle: "Original Sound • Nature Waves",
    likes: 2890,
    comments: 156,
    shares: 112,
  },
];

export default function ReelsPage() {
  const router = useRouter();
  const [reels, setReels] = useState<ReelItem[]>(DEFAULT_REELS);
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const currentReel = reels[activeReelIndex] || reels[0];

  useEffect(() => {
    const loadVideoPosts = async () => {
      try {
        const res = await postService.getFeed(1, 30);
        const dataObj = res?.data || res || {};
        const items = Array.isArray(dataObj)
          ? dataObj
          : Array.isArray(dataObj.posts)
          ? dataObj.posts
          : Array.isArray(res?.posts)
          ? res.posts
          : [];

        const videoPosts: ReelItem[] = items
          .filter((p: any) => {
            const hasVideoMedia = p.mediaUrls?.some((url: string) => url.match(/\.(mp4|webm|mov|mkv)$/i));
            return p.video || hasVideoMedia || p.type === "video";
          })
          .map((p: any) => {
            const videoUrl =
              p.video ||
              p.mediaUrls?.find((url: string) => url.match(/\.(mp4|webm|mov|mkv)$/i)) ||
              (p.mediaUrls && p.mediaUrls[0]) ||
              "";

            const authorName =
              p.author?.displayName ||
              `${p.author?.firstName || ""} ${p.author?.lastName || ""}`.trim() ||
              p.author?.username ||
              "Creator";

            return {
              id: p.id,
              author: {
                name: authorName,
                handle: p.author?.username || "user",
                avatar:
                  p.author?.avatarUrl ||
                  p.author?.profilePicture ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
              },
              authorId: p.author?.id,
              videoUrl,
              caption: p.content || "Awesome reel!",
              musicTitle: "Original Audio",
              likes: p._count?.reactions || (Array.isArray(p.reactions) ? p.reactions.length : 0),
              comments: p._count?.comments || (Array.isArray(p.comments) ? p.comments.length : 0),
              shares: p._count?.shares || 0,
              hasLiked: p.userReaction != null,
            };
          });

        if (videoPosts.length > 0) {
          setReels([...videoPosts, ...DEFAULT_REELS]);
        }
      } catch (err) {
        console.error("Failed to load feed video reels:", err);
      }
    };

    loadVideoPosts();
  }, []);

  const handlePrevReel = () => {
    setActiveReelIndex((prev) => (prev > 0 ? prev - 1 : reels.length - 1));
  };

  const handleNextReel = () => {
    setActiveReelIndex((prev) => (prev < reels.length - 1 ? prev + 1 : 0));
  };

  const [shareToast, setShareToast] = useState<string | null>(null);
  const [followedAuthors, setFollowedAuthors] = useState<Record<string, boolean>>({});
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const selectReaction = async (reelId: string, reactionType: "LIKE" | "LOVE" | "HAHA" | "WOW") => {
    const target = reels.find((r) => r.id === reelId);
    if (!target) return;

    setReels((prev) =>
      prev.map((r) => {
        if (r.id !== reelId) return r;
        const wasLiked = r.hasLiked;
        return {
          ...r,
          hasLiked: true,
          userReaction: reactionType,
          likes: wasLiked ? r.likes : r.likes + 1,
        };
      })
    );
    setShowReactionPicker(false);

    try {
      await reactionService.addReaction({
        targetId: reelId,
        targetType: "POST",
        type: reactionType,
      });
    } catch (err) {
      console.warn("Backend reaction failed:", err);
    }
  };

  const toggleLike = async (reelId: string) => {
    const target = reels.find((r) => r.id === reelId);
    if (!target) return;
    const isLiking = !target.hasLiked;

    setReels((prev) =>
      prev.map((r) => {
        if (r.id !== reelId) return r;
        return {
          ...r,
          hasLiked: isLiking,
          userReaction: isLiking ? (r.userReaction || "LIKE") : undefined,
          likes: isLiking ? r.likes + 1 : Math.max(0, r.likes - 1),
        };
      })
    );

    try {
      if (isLiking) {
        await reactionService.addReaction({
          targetId: reelId,
          targetType: "POST",
          type: "LIKE",
        });
      } else {
        await reactionService.removeReaction(reelId, "POST");
      }
    } catch (err) {
      console.warn("Backend reaction failed:", err);
    }
  };

  const handleShare = async (reelId: string) => {
    setReels((prev) =>
      prev.map((r) => (r.id === reelId ? { ...r, shares: r.shares + 1 } : r))
    );

    try {
      await postService.sharePost(reelId);
    } catch {
      // ignore
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      const shareUrl = `${window.location.origin}/reels`;
      navigator.clipboard.writeText(shareUrl).catch(() => {});
      setShareToast("Link copied to clipboard!");
      setTimeout(() => setShareToast(null), 2500);
    }
  };

  const handleFollowAuthor = async (authorId?: string) => {
    if (!authorId) return;
    const isCurrentlyFollowing = !!followedAuthors[authorId];
    setFollowedAuthors((prev) => ({ ...prev, [authorId]: !isCurrentlyFollowing }));
    try {
      if (isCurrentlyFollowing) {
        await friendshipService.unfollowUser(authorId);
      } else {
        await friendshipService.followUser(authorId);
      }
    } catch (err) {
      console.warn("Failed to toggle follow author:", err);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <div className="flex">
        {/* LEFT SIDEBAR */}
        <aside className="hidden lg:block w-72 shrink-0">
          <LeftSidebar />
        </aside>

        {/* MAIN REELS CONTAINER */}
        <main className="flex-1 flex justify-center py-6 px-4">
          <div className="relative h-[85vh] w-full max-w-sm rounded-3xl overflow-hidden bg-black border border-white/10 shadow-2xl flex flex-col justify-between select-none">
            {/* Top Bar */}
            <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
              <button
                onClick={() => router.push("/")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 text-xs font-bold text-white hover:bg-black/70 transition cursor-pointer"
              >
                <ArrowLeft size={16} />
                <span>Feed</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold bg-black/50 px-2.5 py-1 rounded-full text-slate-300">
                  {activeReelIndex + 1} / {reels.length}
                </span>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition cursor-pointer"
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
              </div>
            </div>

            {/* Video Player */}
            <div className="absolute inset-0 cursor-pointer" onClick={togglePlay}>
              <video
                ref={videoRef}
                src={currentReel.videoUrl}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-black/80" />

              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="h-16 w-16 rounded-full bg-black/60 flex items-center justify-center text-white">
                    <Play size={28} className="fill-current ml-1" />
                  </div>
                </div>
              )}
            </div>

            {/* Prev / Next Navigation Controls */}
            <div className="absolute right-4 top-16 z-20 flex flex-col gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevReel();
                }}
                className="p-2 rounded-full bg-black/50 text-white/80 hover:text-white hover:bg-black/80 transition shadow-lg cursor-pointer"
                title="Previous Reel"
              >
                <ChevronUp size={18} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextReel();
                }}
                className="p-2 rounded-full bg-black/50 text-white/80 hover:text-white hover:bg-black/80 transition shadow-lg cursor-pointer"
                title="Next Reel"
              >
                <ChevronDown size={18} />
              </button>
            </div>

            {/* Share Toast */}
            {shareToast && (
              <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 px-3 py-1.5 rounded-full bg-emerald-600/90 text-white text-xs font-bold shadow-lg animate-in fade-in">
                {shareToast}
              </div>
            )}

            {/* Right Action Icons Sidebar */}
            <div className="absolute right-4 bottom-16 z-20 flex flex-col items-center gap-5">
              {/* Like / Reaction Button */}
              <div className="relative flex flex-col items-center gap-1">
                {showReactionPicker && (
                  <div className="absolute right-0 bottom-full mb-3 flex items-center gap-1.5 p-2 rounded-full bg-black/85 backdrop-blur-md border border-white/20 shadow-2xl z-30 animate-in fade-in zoom-in-95">
                    {[
                      { type: "LIKE" as const, emoji: "👍" },
                      { type: "LOVE" as const, emoji: "❤️" },
                      { type: "HAHA" as const, emoji: "😂" },
                      { type: "WOW" as const, emoji: "🔥" },
                    ].map((r) => (
                      <button
                        key={r.type}
                        type="button"
                        onClick={() => selectReaction(currentReel.id, r.type)}
                        className="text-lg hover:scale-130 transition-transform cursor-pointer p-1"
                      >
                        {r.emoji}
                      </button>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => toggleLike(currentReel.id)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setShowReactionPicker(!showReactionPicker);
                  }}
                  className={`flex h-12 w-12 items-center justify-center rounded-full transition cursor-pointer shadow-lg ${
                    currentReel.hasLiked
                      ? "bg-red-600/30 text-red-500 border border-red-500/50 scale-110"
                      : "bg-black/50 text-white hover:bg-black/70"
                  }`}
                  title="Like or long-press for reactions"
                >
                  {currentReel.userReaction === "LOVE" ? (
                    <span className="text-xl">❤️</span>
                  ) : currentReel.userReaction === "HAHA" ? (
                    <span className="text-xl">😂</span>
                  ) : currentReel.userReaction === "WOW" ? (
                    <span className="text-xl">🔥</span>
                  ) : (
                    <Heart size={22} className={currentReel.hasLiked ? "fill-current" : ""} />
                  )}
                </button>
                <span className="text-[11px] font-bold drop-shadow-md">{currentReel.likes}</span>
              </div>

              {/* Comments Button */}
              <div className="flex flex-col items-center gap-1">
                <button className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition cursor-pointer shadow-lg">
                  <MessageCircle size={22} />
                </button>
                <span className="text-[11px] font-bold drop-shadow-md">{currentReel.comments}</span>
              </div>

              {/* Share Button */}
              <div className="flex flex-col items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleShare(currentReel.id)}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition cursor-pointer shadow-lg"
                  title="Share reel"
                >
                  <Share2 size={22} />
                </button>
                <span className="text-[11px] font-bold drop-shadow-md">{currentReel.shares}</span>
              </div>

              {/* Audio Spinner */}
              <div className="h-10 w-10 rounded-full border-2 border-white/60 overflow-hidden animate-spin [animation-duration:6s] shadow-lg">
                <img src={currentReel.author.avatar} alt="" className="h-full w-full object-cover" />
              </div>
            </div>

            {/* Bottom Caption Overlay */}
            <div className="absolute bottom-4 left-4 right-16 z-20 space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="relative h-9 w-9 overflow-hidden rounded-full border border-white/30">
                  <img src={currentReel.author.avatar} alt="" className="h-full w-full object-cover" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white leading-tight">{currentReel.author.name}</p>
                  <p className="text-[10px] text-slate-300">@{currentReel.author.handle}</p>
                </div>
                {currentReel.authorId && (
                  <button
                    type="button"
                    onClick={() => handleFollowAuthor(currentReel.authorId)}
                    className={`ml-2 px-3 py-1 rounded-full text-[10px] font-bold transition cursor-pointer ${
                      followedAuthors[currentReel.authorId]
                        ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                        : "bg-blue-600 text-white hover:bg-blue-500"
                    }`}
                  >
                    {followedAuthors[currentReel.authorId] ? "Following" : "Follow"}
                  </button>
                )}
              </div>

              <p className="text-xs text-white leading-snug line-clamp-2 drop-shadow-md">{currentReel.caption}</p>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
                <Music size={12} className="animate-bounce" />
                <span className="truncate">{currentReel.musicTitle}</span>
              </div>
            </div>
          </div>
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="hidden xl:block w-80 shrink-0">
          <RightSidebar />
        </aside>
      </div>
    </div>
  );
}
