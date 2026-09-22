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
  X,
  Send,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import { postService } from "@/services/postService";
import { reactionService } from "@/services/reactionService";
import { commentService } from "@/services/commentService";
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
  const [isMuted, setIsMuted] = useState(true);
  const [soundBadge, setSoundBadge] = useState<"muted" | "unmuted" | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [heartAnim, setHeartAnim] = useState<{ id: number; x: number; y: number } | null>(null);
  const lastClickTimeRef = useRef<number>(0);

  const toggleSound = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
    }
    setSoundBadge(nextMuted ? "muted" : "unmuted");
    setTimeout(() => {
      setSoundBadge(null);
    }, 1200);
  };

  const handleVideoEnded = () => {
    if (isAutoplay) {
      handleNextReel();
    }
  };

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const currentReel = reels[activeReelIndex] || reels[0];

  const handleVideoClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now();
    if (now - lastClickTimeRef.current < 320) {
      // Double tap detected: spawn heart animation and like reel
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setHeartAnim({ id: now, x, y });
      if (!currentReel.hasLiked) {
        toggleLike(currentReel.id);
      }
      setTimeout(() => setHeartAnim(null), 850);
      lastClickTimeRef.current = 0;
    } else {
      lastClickTimeRef.current = now;
      setTimeout(() => {
        if (Date.now() - lastClickTimeRef.current >= 300 && lastClickTimeRef.current !== 0) {
          togglePlay();
          lastClickTimeRef.current = 0;
        }
      }, 320);
    }
  };

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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const targetId = params.get("id");
      if (targetId) {
        const found = reels.findIndex((r) => r.id === targetId);
        if (found !== -1) {
          setActiveReelIndex(found);
        }
      }
    }
  }, [reels]);

  useEffect(() => {
    if (typeof window !== "undefined" && reels[activeReelIndex]) {
      const newUrl = `${window.location.pathname}?id=${reels[activeReelIndex].id}`;
      window.history.replaceState(null, "", newUrl);
    }
  }, [activeReelIndex, reels]);

  const handlePrevReel = () => {
    setActiveReelIndex((prev) => (prev > 0 ? prev - 1 : reels.length - 1));
  };

  const handleNextReel = () => {
    setActiveReelIndex((prev) => (prev < reels.length - 1 ? prev + 1 : 0));
  };

  const [shareToast, setShareToast] = useState<string | null>(null);
  const [followedAuthors, setFollowedAuthors] = useState<Record<string, boolean>>({});
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [reelComments, setReelComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const handleOpenComments = async () => {
    setShowComments(true);
    setLoadingComments(true);
    try {
      const res = await commentService.getPostComments(currentReel.id, 1, 30);
      const list = res?.data?.comments || res?.data || (Array.isArray(res) ? res : []);
      setReelComments(list);
    } catch (err) {
      console.warn("Failed to load reel comments:", err);
      setReelComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submittingComment) return;
    const text = newComment.trim();
    setSubmittingComment(true);
    try {
      const created = await commentService.createComment({
        postId: currentReel.id,
        content: text,
      });
      const commentObj = created?.data || created || {
        id: `local-${Date.now()}`,
        content: text,
        createdAt: new Date().toISOString(),
        user: { name: "You", avatar: "" },
      };
      setReelComments((prev) => [commentObj, ...prev]);
      setNewComment("");
      setReels((prev) =>
        prev.map((r) =>
          r.id === currentReel.id ? { ...r, comments: r.comments + 1 } : r
        )
      );
    } catch (err) {
      console.warn("Failed to post comment:", err);
    } finally {
      setSubmittingComment(false);
    }
  };

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

    if (typeof window !== "undefined") {
      const shareUrl = `${window.location.origin}/reels?id=${reelId}`;
      if (navigator.share) {
        navigator
          .share({
            title: currentReel.caption || "Watch this reel",
            url: shareUrl,
          })
          .then(() => {
            setShareToast("Reel shared successfully!");
            setTimeout(() => setShareToast(null), 2500);
          })
          .catch(() => {
            navigator.clipboard?.writeText(shareUrl);
            setShareToast("Reel link copied to clipboard!");
            setTimeout(() => setShareToast(null), 2500);
          });
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(shareUrl);
        setShareToast("Reel link copied to clipboard!");
        setTimeout(() => setShareToast(null), 2500);
      }
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
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAutoplay((prev) => !prev);
                  }}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer backdrop-blur-md ${
                    isAutoplay
                      ? "bg-blue-600/70 text-white border border-blue-400/40"
                      : "bg-black/50 text-slate-300 hover:text-white"
                  }`}
                  title={isAutoplay ? "Continuous Autoplay ON" : "Continuous Autoplay OFF"}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isAutoplay ? "bg-emerald-400 animate-pulse" : "bg-slate-400"}`} />
                  <span>{isAutoplay ? "Autoplay" : "Single"}</span>
                </button>
                <span className="text-[11px] font-mono font-bold bg-black/50 px-2.5 py-1 rounded-full text-slate-300">
                  {activeReelIndex + 1} / {reels.length}
                </span>
                <button
                  type="button"
                  onClick={toggleSound}
                  className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition cursor-pointer"
                  title={isMuted ? "Unmute audio" : "Mute audio"}
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
              </div>
            </div>

            {/* Video Player */}
            <div className="absolute inset-0 cursor-pointer" onClick={handleVideoClick}>
              <video
                ref={videoRef}
                src={currentReel.videoUrl}
                autoPlay
                loop={!isAutoplay}
                onEnded={handleVideoEnded}
                muted={isMuted}
                playsInline
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-black/80" />

              {/* Double-tap Floating Heart Animation */}
              {heartAnim && (
                <div
                  className="absolute pointer-events-none z-40 -translate-x-1/2 -translate-y-1/2 animate-in zoom-in-50 fade-in duration-200"
                  style={{ left: heartAnim.x, top: heartAnim.y }}
                >
                  <Heart
                    size={84}
                    className="text-rose-500 fill-rose-500 drop-shadow-[0_0_24px_rgba(244,63,94,0.9)] animate-bounce"
                  />
                </div>
              )}

              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="h-16 w-16 rounded-full bg-black/60 flex items-center justify-center text-white">
                    <Play size={28} className="fill-current ml-1" />
                  </div>
                </div>
              )}

              {/* Sound Status Animated Pill */}
              {soundBadge && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                  <div className="flex items-center gap-2 rounded-full bg-black/80 px-4 py-2 text-xs font-semibold text-white shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-90 duration-200">
                    {soundBadge === "muted" ? (
                      <>
                        <VolumeX size={18} className="text-red-400" />
                        <span>Muted</span>
                      </>
                    ) : (
                      <>
                        <Volume2 size={18} className="text-emerald-400" />
                        <span>Sound On</span>
                      </>
                    )}
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
                <button
                  type="button"
                  onClick={handleOpenComments}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition cursor-pointer shadow-lg"
                  title="View and add comments"
                >
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

            {/* Reel Comments Drawer */}
            {showComments && (
              <div className="absolute inset-x-0 bottom-0 top-1/4 z-30 flex flex-col rounded-t-2xl bg-slate-900/95 backdrop-blur-md border-t border-slate-700 text-white shadow-2xl animate-in slide-in-from-bottom-5">
                <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <MessageCircle size={16} className="text-blue-400" />
                    <span className="text-sm font-semibold">Comments ({currentReel.comments})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowComments(false)}
                    className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {loadingComments ? (
                    <div className="flex flex-col items-center justify-center py-8 text-slate-400 gap-2">
                      <Loader2 size={24} className="animate-spin text-blue-500" />
                      <span className="text-xs">Loading comments...</span>
                    </div>
                  ) : reelComments.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No comments yet. Be the first to comment!
                    </div>
                  ) : (
                    reelComments.map((c, i) => (
                      <div key={c.id || i} className="flex items-start gap-2.5 text-xs">
                        <div className="h-7 w-7 rounded-full overflow-hidden bg-slate-700 shrink-0 mt-0.5">
                          <img
                            src={c.user?.avatar || c.author?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 rounded-xl bg-slate-800/80 px-3 py-2 border border-slate-700/50">
                          <span className="font-semibold text-slate-200 block text-[11px]">
                            {c.user?.name || c.author?.name || "User"}
                          </span>
                          <p className="text-slate-300 mt-0.5 text-xs break-words">{c.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddComment} className="flex items-center gap-2 border-t border-slate-800 p-3 bg-slate-900">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 rounded-full bg-slate-800 px-4 py-2 text-xs text-white placeholder-slate-400 border border-slate-700 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim() || submittingComment}
                    className="rounded-full bg-blue-600 p-2 text-white hover:bg-blue-500 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingComment ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  </button>
                </form>
              </div>
            )}
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
