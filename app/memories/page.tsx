"use client";

import React, { useState, useEffect } from "react";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import { Sparkles, Calendar, Share2, Check, Users, Heart } from "lucide-react";
import Image from "next/image";
import { memoryService } from "@/services/memoryService";
import { postService } from "@/services/postService";
import { usePostStore } from "@/store/postStore";
import {
  PageHeader,
  Card,
  CardContent,
  Button,
  Badge,
  EmptyState,
  Loader,
  Avatar,
  Dialog,
  Tabs,
} from "@/components/ui";

interface MemoryItem {
  id: string;
  type: "post" | "friendship";
  yearsAgo: number;
  dateStr: string;
  content: string;
  mediaUrl?: string;
  authorName?: string;
  authorAvatar?: string;
  friendName?: string;
  friendAvatar?: string;
}

const fallbackMemories: MemoryItem[] = [
  {
    id: "m1",
    type: "post",
    yearsAgo: 2,
    dateStr: "August 12, 2024",
    content: "Launched the initial version of our WebGL spatial layout framework!",
    mediaUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600",
    authorName: "Alex Morgan",
    authorAvatar: "https://images.unsplash.com/photo-1779040622687-42bb00790c67?w=100",
  },
  {
    id: "m2",
    type: "post",
    yearsAgo: 1,
    dateStr: "August 12, 2025",
    content: "Attended React Conf in San Francisco. Unforgettable experience!",
    mediaUrl: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=600",
    authorName: "Alex Morgan",
    authorAvatar: "https://images.unsplash.com/photo-1779040622687-42bb00790c67?w=100",
  },
  {
    id: "m3",
    type: "friendship",
    yearsAgo: 1,
    dateStr: "August 12, 2025",
    content: "You and Sarah Chen became friends on TechSphere!",
    friendName: "Sarah Chen",
    friendAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
  },
];

export default function MemoriesPage() {
  const [memories, setMemories] = useState<MemoryItem[]>(fallbackMemories);
  const [loading, setLoading] = useState(false);
  const [sharedMap, setSharedMap] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [activeShareMemory, setActiveShareMemory] = useState<MemoryItem | null>(null);
  const [customCaption, setCustomCaption] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const { createPost } = usePostStore();

  const handleConfirmShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShareMemory || isSharing) return;

    setIsSharing(true);
    const prefix = customCaption.trim() ? `${customCaption.trim()}\n\n` : "";
    const shareContent = `${prefix}On this day ${activeShareMemory.yearsAgo} year${activeShareMemory.yearsAgo > 1 ? "s" : ""} ago: "${activeShareMemory.content}"`;

    try {
      await Promise.allSettled([
        postService.createPost({
          content: shareContent,
          mediaUrls: activeShareMemory.mediaUrl ? [activeShareMemory.mediaUrl] : [],
          privacy: "PUBLIC",
        }),
        memoryService.shareMemory(activeShareMemory.id, customCaption.trim() || undefined),
      ]);
    } catch (err) {
      console.warn("Backend share memory post error, fallback to local store:", err);
    }

    createPost({
      author: {
        name: "You",
        username: "you",
        avatar: "https://images.unsplash.com/photo-1779040622687-42bb00790c67?w=500",
      },
      visibility: "public",
      type: activeShareMemory.mediaUrl ? "image" : "text",
      content: shareContent,
      images: activeShareMemory.mediaUrl ? [activeShareMemory.mediaUrl] : [],
    });

    setSharedMap((prev) => ({ ...prev, [activeShareMemory.id]: true }));
    setToastMessage("Memory shared successfully to your feed timeline!");
    setTimeout(() => setToastMessage(null), 3500);
    setActiveShareMemory(null);
    setCustomCaption("");
    setIsSharing(false);
  };

  useEffect(() => {
    const fetchMemories = async () => {
      setLoading(true);
      try {
        const res = await memoryService.getMemories();
        const data = res?.data || res || {};
        const parsed: MemoryItem[] = [];

        // Parse posts
        const postItems = Array.isArray(data.posts) ? data.posts : Array.isArray(data) ? data : [];
        postItems.forEach((p: any, idx: number) => {
          const createdDate = p.createdAt ? new Date(p.createdAt) : new Date();
          const author = p.author || {};
          const authorName = `${author.firstName || ""} ${author.lastName || ""}`.trim() || author.username || "You";
          const media = Array.isArray(p.mediaUrls) && p.mediaUrls.length > 0 ? p.mediaUrls[0] : p.mediaUrl;
          parsed.push({
            id: p.id || `post_mem_${idx}`,
            type: "post",
            yearsAgo: p.yearsAgo || Math.max(1, new Date().getFullYear() - createdDate.getFullYear()),
            dateStr: createdDate.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" }),
            content: p.content || "Historical status update",
            mediaUrl: media,
            authorName,
            authorAvatar: author.profilePicture || author.avatarUrl || "https://images.unsplash.com/photo-1779040622687-42bb00790c67?w=100",
          });
        });

        // Parse friendship anniversaries
        if (Array.isArray(data.friendships)) {
          data.friendships.forEach((f: any, idx: number) => {
            const createdDate = f.createdAt ? new Date(f.createdAt) : new Date();
            const friend = f.friend || {};
            const friendName = `${friend.firstName || ""} ${friend.lastName || ""}`.trim() || friend.username || "a friend";
            parsed.push({
              id: f.friendshipId || `friend_mem_${idx}`,
              type: "friendship",
              yearsAgo: f.yearsAgo || Math.max(1, new Date().getFullYear() - createdDate.getFullYear()),
              dateStr: createdDate.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" }),
              content: `You and ${friendName} became friends on TechSphere!`,
              friendName,
              friendAvatar: friend.profilePicture || friend.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
            });
          });
        }

        if (parsed.length > 0) {
          setMemories(parsed);
        }
      } catch (err) {
        console.error("Using fallback memories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMemories();
  }, []);

  const memoryTabs = [
    { id: "all", label: "All Memories" },
    { id: "1yr", label: "1 Year Ago" },
    { id: "2yr", label: "2 Years Ago" },
    { id: "3yr_plus", label: "3+ Years Ago" },
    { id: "friendships", label: "Friendships" },
  ];

  const filteredMemories = memories.filter((m) => {
    if (activeFilter === "1yr") return m.yearsAgo === 1;
    if (activeFilter === "2yr") return m.yearsAgo === 2;
    if (activeFilter === "3yr_plus") return m.yearsAgo >= 3;
    if (activeFilter === "friendships") return m.type === "friendship";
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <div className="flex">
        {/* LEFT SIDEBAR */}
        <aside className="hidden lg:block w-72 shrink-0">
          <LeftSidebar />
        </aside>

        {/* MAIN FEED */}
        <main className="flex-1 flex justify-center">
          <div className="w-full max-w-3xl px-6 py-6 space-y-6">
            <PageHeader
              title="On This Day - Memories"
              description="Look back on special moments, technical achievements, and posts from previous years."
              icon={<Sparkles size={22} className="text-purple-400" />}
              badge={<Badge variant="primary">{filteredMemories.length} Memories</Badge>}
            />

            {toastMessage && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in duration-200">
                <Check size={16} className="text-emerald-400 shrink-0" />
                <span>{toastMessage}</span>
              </div>
            )}

            {/* Celebratory Banner */}
            <div className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-950/40 via-indigo-950/20 to-[#111827] p-5 shadow-lg">
              <div className="flex items-start gap-3.5">
                <div className="h-10 w-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                  <Sparkles size={20} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">Your Personal Time Machine</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Rediscover photos, code releases, status updates, and friends you connected with on this exact day in past years.
                  </p>
                </div>
              </div>
            </div>

            <Tabs
              tabs={memoryTabs}
              activeTab={activeFilter}
              onChange={setActiveFilter}
              variant="line"
            />

            {loading ? (
              <div className="py-16 text-center">
                <Loader label="Looking up memories..." />
              </div>
            ) : filteredMemories.length === 0 ? (
              <EmptyState
                icon={<Sparkles size={36} className="text-purple-400" />}
                title="No memories in this view"
                description={
                  activeFilter === "friendships"
                    ? "No friendship anniversaries recorded on this day yet."
                    : activeFilter === "all"
                    ? "Check back tomorrow to see your past activity and timeline posts!"
                    : "No memories found for this specific time period."
                }
              />
            ) : (
              <div className="space-y-6">
                {filteredMemories.map((m) => (
                  <Card key={m.id} hover>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between border-b border-[#1f2937]/60 pb-3">
                        <div className="flex items-center gap-2">
                          <Calendar size={15} className="text-purple-400" />
                          <span className="text-xs font-bold text-purple-400">{m.yearsAgo} Year{m.yearsAgo > 1 ? "s" : ""} Ago Today</span>
                          <span className="text-xs text-slate-500">• {m.dateStr}</span>
                          {m.type === "friendship" && (
                            <Badge variant="success" size="sm" className="hidden sm:inline-flex gap-1 items-center">
                              <Heart size={10} className="fill-emerald-400" /> Friendship
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant={sharedMap[m.id] ? "success" : "secondary"}
                          size="sm"
                          leftIcon={sharedMap[m.id] ? <Check size={13} /> : <Share2 size={13} />}
                          onClick={() => setActiveShareMemory(m)}
                        >
                          {sharedMap[m.id] ? "Shared to Feed!" : "Share Memory"}
                        </Button>
                      </div>

                      {m.type === "friendship" ? (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                          {m.friendAvatar && (
                            <Avatar src={m.friendAvatar} name={m.friendName || "Friend"} size="md" />
                          )}
                          <div>
                            <p className="text-sm font-semibold text-white">{m.content}</p>
                            <p className="text-xs text-purple-300">Celebrating {m.yearsAgo} year{m.yearsAgo > 1 ? "s" : ""} of connection</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {m.authorAvatar && (
                            <div className="flex items-center gap-2.5">
                              <Avatar src={m.authorAvatar} name={m.authorName || "You"} size="sm" />
                              <div>
                                <h4 className="text-xs font-bold text-white">{m.authorName}</h4>
                                <span className="text-[10px] text-slate-400">{m.dateStr}</span>
                              </div>
                            </div>
                          )}
                          <p className="text-sm text-slate-200 leading-relaxed">{m.content}</p>
                        </div>
                      )}

                      {m.mediaUrl && (
                        <div className="relative h-64 rounded-xl overflow-hidden border border-[#1f2937] shadow-md">
                          <Image src={m.mediaUrl} fill sizes="100vw" className="object-cover" alt="Memory media" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="hidden xl:block w-80 shrink-0">
          <RightSidebar />
        </aside>
      </div>

      {/* SHARE MEMORY MODAL */}
      <Dialog
        isOpen={!!activeShareMemory}
        onClose={() => setActiveShareMemory(null)}
        title="Share Memory to Your Feed"
        description="Add your thoughts looking back on this moment before sharing with friends."
      >
        {activeShareMemory && (
          <form onSubmit={handleConfirmShare} className="space-y-4 pt-2">
            <div className="p-3.5 rounded-xl border border-purple-500/30 bg-purple-500/10 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
                <Sparkles size={14} />
                <span>{activeShareMemory.yearsAgo} Year{activeShareMemory.yearsAgo > 1 ? "s" : ""} Ago Today • {activeShareMemory.dateStr}</span>
              </div>
              <p className="text-xs text-slate-200 line-clamp-3 italic">
                "{activeShareMemory.content}"
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Add a note or reflection (Optional)</label>
              <textarea
                rows={3}
                placeholder="What are you thinking looking back on this today?..."
                value={customCaption}
                onChange={(e) => setCustomCaption(e.target.value)}
                className="w-full rounded-xl border border-[#374151] bg-[#1f2937] p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500 transition resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#1f2937]">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setActiveShareMemory(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                variant="primary"
                loading={isSharing}
                disabled={isSharing}
                leftIcon={<Share2 size={13} />}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isSharing ? "Sharing..." : "Share to Feed"}
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  );
}
