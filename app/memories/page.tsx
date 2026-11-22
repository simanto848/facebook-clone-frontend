"use client";

import React, { useState, useEffect } from "react";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import { Sparkles, Calendar, Share2, Check, Users, Heart, Search, X, Download, Copy, Star, Settings, EyeOff, UserX, CalendarX, Plus, Play, Pause, ChevronLeft, ChevronRight } from "lucide-react";
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
  Input,
} from "@/components/ui";
import ShareMemoryModal from "@/components/features/memories/ShareMemoryModal";
import MemorySlideshowModal from "@/components/features/memories/MemorySlideshowModal";
import MemoryPreferencesModal from "@/components/features/memories/MemoryPreferencesModal";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [activeShareMemory, setActiveShareMemory] = useState<MemoryItem | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedMemoryId, setCopiedMemoryId] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const { createPost } = usePostStore();

  // Slideshow recap state
  const [isSlideshowOpen, setIsSlideshowOpen] = useState(false);

  // Preferences State (Hide people, dates, notification settings)
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [hiddenPeople, setHiddenPeople] = useState<string[]>([]);
  const [hiddenYears, setHiddenYears] = useState<string[]>([]);
  const [notificationLevel, setNotificationLevel] = useState<"all" | "highlights" | "none">("all");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("memories_preferences");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed.hiddenPeople)) setHiddenPeople(parsed.hiddenPeople);
        if (Array.isArray(parsed.hiddenYears)) setHiddenYears(parsed.hiddenYears);
        if (parsed.notificationLevel) setNotificationLevel(parsed.notificationLevel);
      }
    } catch {
      // ignore
    }
  }, []);

  const savePreferences = (people: string[], years: string[], notify: "all" | "highlights" | "none") => {
    setHiddenPeople(people);
    setHiddenYears(years);
    setNotificationLevel(notify);
    try {
      localStorage.setItem(
        "memories_preferences",
        JSON.stringify({ hiddenPeople: people, hiddenYears: years, notificationLevel: notify })
      );
      setToastMessage("Memories preferences updated.");
      setTimeout(() => setToastMessage(null), 2500);
    } catch {
      // ignore
    }
  };

  const handleAddHiddenPerson = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || hiddenPeople.includes(trimmed)) return;
    const updated = [...hiddenPeople, trimmed];
    savePreferences(updated, hiddenYears, notificationLevel);
  };

  const handleRemoveHiddenPerson = (name: string) => {
    const updated = hiddenPeople.filter((p) => p !== name);
    savePreferences(updated, hiddenYears, notificationLevel);
  };

  const handleToggleHiddenYear = (year: string) => {
    const updated = hiddenYears.includes(year)
      ? hiddenYears.filter((y) => y !== year)
      : [...hiddenYears, year];
    savePreferences(hiddenPeople, updated, notificationLevel);
  };

  const handleCopyMemoryText = async (m: MemoryItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const formatted = `📅 ${m.dateStr} (${m.yearsAgo} year${m.yearsAgo > 1 ? "s" : ""} ago today):\n"${m.content}"`;
    try {
      await navigator.clipboard.writeText(formatted);
      setCopiedMemoryId(m.id);
      setToastMessage("Memory text copied to clipboard!");
      setTimeout(() => {
        setCopiedMemoryId(null);
        setToastMessage(null);
      }, 2500);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem("favorite_memories");
      if (stored) {
        setFavoriteIds(new Set(JSON.parse(stored)));
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleFavorite = (memoryId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(memoryId)) {
        next.delete(memoryId);
        setToastMessage("Removed memory from favorites.");
      } else {
        next.add(memoryId);
        setToastMessage("Starred memory added to favorites!");
      }
      try {
        localStorage.setItem("favorite_memories", JSON.stringify(Array.from(next)));
      } catch {
        // ignore
      }
      setTimeout(() => setToastMessage(null), 2500);
      return next;
    });
  };

  const handleExportMemories = () => {
    if (memories.length === 0) return;
    const dataStr = JSON.stringify(memories, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `my-memories-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setToastMessage("Memories exported successfully!");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopySummary = async () => {
    if (memories.length === 0) return;
    const summary = memories
      .map((m) => `• ${m.dateStr} (${m.yearsAgo} yr${m.yearsAgo > 1 ? "s" : ""} ago): ${m.content}`)
      .join("\n");
    const textToCopy = `📅 On This Day Memories:\n${summary}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
      setToastMessage("Memories summary copied to clipboard!");
      setTimeout(() => setToastMessage(null), 3000);
    } catch {
      // fallback
    }
  };

  const handleConfirmShare = async (memory: MemoryItem, caption: string) => {
    if (!memory || isSharing) return;

    setIsSharing(true);
    const prefix = caption.trim() ? `${caption.trim()}\n\n` : "";
    const shareContent = `${prefix}On this day ${memory.yearsAgo} year${memory.yearsAgo > 1 ? "s" : ""} ago: "${memory.content}"`;

    try {
      await Promise.allSettled([
        postService.createPost({
          content: shareContent,
          mediaUrls: memory.mediaUrl ? [memory.mediaUrl] : [],
          privacy: "PUBLIC",
        }),
        memoryService.shareMemory(memory.id, caption.trim() || undefined),
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
      type: memory.mediaUrl ? "image" : "text",
      content: shareContent,
      images: memory.mediaUrl ? [memory.mediaUrl] : [],
    });

    setSharedMap((prev) => ({ ...prev, [memory.id]: true }));
    setToastMessage("Memory shared successfully to your feed timeline!");
    setTimeout(() => setToastMessage(null), 3500);
    setActiveShareMemory(null);
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

  const availableYears = Array.from(
    new Set(
      memories.map((m) => {
        const year = new Date(m.dateStr).getFullYear();
        return isNaN(year) ? new Date().getFullYear() - m.yearsAgo : year;
      })
    )
  ).sort((a, b) => b - a);

  const memoryTabs = [
    { id: "all", label: "All Memories" },
    { id: "favorites", label: `Starred (${favoriteIds.size})` },
    { id: "1yr", label: "1 Year Ago" },
    { id: "2yr", label: "2 Years Ago" },
    { id: "3yr_plus", label: "3+ Years Ago" },
    { id: "friendships", label: "Friendships" },
  ];

  const filteredMemories = memories.filter((m) => {
    // Filter out hidden people
    if (m.authorName && hiddenPeople.some((p) => m.authorName?.toLowerCase().includes(p.toLowerCase()))) {
      return false;
    }
    if (m.friendName && hiddenPeople.some((p) => m.friendName?.toLowerCase().includes(p.toLowerCase()))) {
      return false;
    }
    // Filter out hidden years
    const mYear = new Date(m.dateStr).getFullYear();
    const actualYearStr = String(isNaN(mYear) ? new Date().getFullYear() - m.yearsAgo : mYear);
    if (hiddenYears.includes(actualYearStr)) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchContent = m.content.toLowerCase().includes(q);
      const matchDate = m.dateStr.toLowerCase().includes(q);
      const matchAuthor = (m.authorName || "").toLowerCase().includes(q);
      const matchFriend = (m.friendName || "").toLowerCase().includes(q);
      const matchYear = String(m.yearsAgo).includes(q);
      if (!matchContent && !matchDate && !matchAuthor && !matchFriend && !matchYear) {
        return false;
      }
    }
    if (selectedYear !== "all") {
      const memYear = new Date(m.dateStr).getFullYear();
      const actualYear = isNaN(memYear) ? new Date().getFullYear() - m.yearsAgo : memYear;
      if (String(actualYear) !== selectedYear) return false;
    }
    if (activeFilter === "favorites") return favoriteIds.has(m.id);
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
              badge={
                <div className="flex items-center gap-2">
                  <Badge variant="primary">{filteredMemories.length} Memories</Badge>
                  {filteredMemories.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsSlideshowOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md transition cursor-pointer"
                      title="Play Memories Recap Slideshow"
                    >
                      <Play size={12} className="fill-current" />
                      <span>Play Recap</span>
                    </button>
                  )}
                  {memories.length > 0 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setIsPreferencesOpen(true)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition cursor-pointer ${
                          hiddenPeople.length > 0 || hiddenYears.length > 0
                            ? "bg-purple-600/30 text-purple-300 border-purple-500/50"
                            : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                        }`}
                        title="Configure memories & hidden preferences"
                      >
                        <Settings size={13} />
                        <span>Preferences</span>
                        {(hiddenPeople.length > 0 || hiddenYears.length > 0) && (
                          <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleCopySummary}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
                        title="Copy summary to clipboard"
                      >
                        {copiedSummary ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                        <span>{copiedSummary ? "Copied" : "Copy"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleExportMemories}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 transition cursor-pointer"
                        title="Export memories as JSON"
                      >
                        <Download size={13} />
                        <span>Export</span>
                      </button>
                    </>
                  )}
                </div>
              }
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

            {/* Search & Year Filters */}
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <div className="flex-1 w-full">
                <Input
                  placeholder="Search memories by keyword, friend, or year..."
                  leftIcon={<Search size={16} />}
                  clearable
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#111827] border-[#1f2937] text-xs py-2.5"
                />
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setSelectedYear("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    selectedYear === "all"
                      ? "bg-purple-600 text-white shadow-xs"
                      : "bg-[#111827] border border-[#1f2937] text-slate-400 hover:text-white"
                  }`}
                >
                  All Years
                </button>
                {availableYears.map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setSelectedYear(selectedYear === String(yr) ? "all" : String(yr))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                      selectedYear === String(yr)
                        ? "bg-purple-600 text-white shadow-xs"
                        : "bg-[#111827] border border-[#1f2937] text-slate-400 hover:text-white"
                    }`}
                  >
                    {yr}
                  </button>
                ))}
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
                  searchQuery.trim() || selectedYear !== "all"
                    ? `No memories match your filter${searchQuery ? ` for "${searchQuery}"` : ""}${selectedYear !== "all" ? ` in year ${selectedYear}` : ""}.`
                    : activeFilter === "friendships"
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
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => handleCopyMemoryText(m, e)}
                            className={`p-1.5 rounded-lg border transition cursor-pointer ${
                              copiedMemoryId === m.id
                                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                                : "bg-slate-800/80 border-slate-700/60 text-slate-400 hover:text-white hover:bg-slate-700"
                            }`}
                            title={copiedMemoryId === m.id ? "Memory text copied!" : "Copy memory text"}
                          >
                            {copiedMemoryId === m.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => toggleFavorite(m.id, e)}
                            className={`p-1.5 rounded-lg border transition cursor-pointer ${
                              favoriteIds.has(m.id)
                                ? "bg-amber-500/20 border-amber-500/40 text-amber-400 hover:bg-amber-500/30"
                                : "bg-slate-800/80 border-slate-700/60 text-slate-400 hover:text-amber-300 hover:bg-slate-700"
                            }`}
                            title={favoriteIds.has(m.id) ? "Unstar memory" : "Star memory as favorite"}
                          >
                            <Star size={14} className={favoriteIds.has(m.id) ? "fill-amber-400" : ""} />
                          </button>
                          <Button
                            variant={sharedMap[m.id] ? "success" : "secondary"}
                            size="sm"
                            leftIcon={sharedMap[m.id] ? <Check size={13} /> : <Share2 size={13} />}
                            onClick={() => setActiveShareMemory(m)}
                          >
                            {sharedMap[m.id] ? "Shared to Feed!" : "Share Memory"}
                          </Button>
                        </div>
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
      <ShareMemoryModal
        memory={activeShareMemory}
        onClose={() => setActiveShareMemory(null)}
        onShare={handleConfirmShare}
        isSharing={isSharing}
      />

      {/* Memories Preferences / Hide Modal */}
      <MemoryPreferencesModal
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
        hiddenPeople={hiddenPeople}
        onAddHiddenPerson={handleAddHiddenPerson}
        onRemoveHiddenPerson={handleRemoveHiddenPerson}
        availableYears={availableYears}
        hiddenYears={hiddenYears}
        onToggleHiddenYear={handleToggleHiddenYear}
        notificationLevel={notificationLevel}
        onNotificationLevelChange={(lvl) => savePreferences(hiddenPeople, hiddenYears, lvl)}
      />

      {/* MEMORIES RECAP SLIDESHOW MODAL */}
      <MemorySlideshowModal
        isOpen={isSlideshowOpen}
        onClose={() => setIsSlideshowOpen(false)}
        memories={filteredMemories}
        onShare={(m) => setActiveShareMemory(m)}
      />
    </div>
  );
}
