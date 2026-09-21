"use client";

import React, { useEffect, useState } from "react";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import PostCard from "@/components/features/post/PostCard";
import { Bookmark, BookmarkX, Search, X, Tag, Download, Check, Image as ImageIcon, Video, FileText, BarChart2, AlignLeft, Trash2, AlertTriangle, ArrowUpDown } from "lucide-react";
import { bookmarkService } from "@/services/bookmarkService";
import { mapBackendPostToPostType, PostType, usePostStore } from "@/store/postStore";
import { PageHeader, Badge, EmptyState, Loader } from "@/components/ui";

export default function SavedPostsPage() {
  const [savedPosts, setSavedPosts] = useState<(PostType & { bookmarkId?: string; category?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedExport, setCopiedExport] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "popular">("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const { toggleSavePost } = usePostStore();

  const handleExportBookmarks = () => {
    if (savedPosts.length === 0) return;
    const exportData = savedPosts.map((p) => ({
      id: p.id,
      author: p.author?.name || p.author?.username || "Unknown",
      content: p.content,
      category: p.category || "discussions",
      type: p.type,
      mediaCount: p.images?.length || 0,
      createdAt: p.createdAt,
      exportedAt: new Date().toISOString(),
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `facebook-bookmarks-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 3000);
  };

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const res = await bookmarkService.getUserBookmarks();
      const items = res.data || res || [];
      const posts = items.map((b: any) => {
        const rawPost = b.post || b;
        const mapped = mapBackendPostToPostType(rawPost);
        let defaultCategory = "discussions";
        if (mapped.type === "image" || mapped.type === "video" || (mapped.images && mapped.images.length > 0)) {
          defaultCategory = "media";
        } else if (mapped.article) {
          defaultCategory = "articles";
        }

        if (typeof window !== "undefined") {
          const stored = localStorage.getItem(`saved_cat_${mapped.id}`);
          if (stored) defaultCategory = stored;
        }

        return {
          ...mapped,
          bookmarkId: b.id,
          saved: true,
          category: b.category || defaultCategory,
        };
      });
      setSavedPosts(posts);
    } catch (err) {
      console.error("Error fetching bookmarks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const handleAssignCategory = (postId: string, newCategory: string) => {
    setSavedPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, category: newCategory } : p))
    );
    if (typeof window !== "undefined") {
      localStorage.setItem(`saved_cat_${postId}`, newCategory);
    }
  };

  const searchedPosts = savedPosts.filter((post) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      post.content?.toLowerCase().includes(q) ||
      post.author?.name?.toLowerCase().includes(q) ||
      post.author?.username?.toLowerCase().includes(q)
    );
  });

  const categoryCounts: Record<string, number> = {
    all: searchedPosts.length,
    media: searchedPosts.filter((p) => p.category === "media").length,
    discussions: searchedPosts.filter((p) => p.category === "discussions").length,
    articles: searchedPosts.filter((p) => p.category === "articles").length,
  };

  const categories = [
    { id: "all", label: "All Items" },
    { id: "media", label: "Media & Photos" },
    { id: "discussions", label: "Discussions" },
    { id: "articles", label: "Articles" },
  ];

  const postTypes = [
    { id: "all", label: "All Formats" },
    { id: "media", label: "Images", icon: ImageIcon },
    { id: "video", label: "Videos", icon: Video },
    { id: "article", label: "Articles", icon: FileText },
    { id: "poll", label: "Polls", icon: BarChart2 },
    { id: "text", label: "Text", icon: AlignLeft },
  ];

  const handleUnbookmark = async (bookmarkId: string, postId: string) => {
    // Optimistic state removal
    setSavedPosts((prev) => prev.filter((p) => p.id !== postId && p.bookmarkId !== bookmarkId));
    toggleSavePost(postId);
    try {
      await bookmarkService.deleteBookmark(bookmarkId || postId);
    } catch (err) {
      console.error("Failed to delete bookmark:", err);
    }
  };

  const handleClearAllBookmarks = async () => {
    setIsClearing(true);
    const postList = [...savedPosts];
    setSavedPosts([]);
    postList.forEach((p) => {
      toggleSavePost(p.id);
    });
    setShowClearConfirm(false);
    try {
      await Promise.allSettled(
        postList.map((p) => bookmarkService.deleteBookmark(p.bookmarkId || p.id))
      );
    } catch (err) {
      console.error("Error clearing all bookmarks:", err);
    } finally {
      setIsClearing(false);
    }
  };

  const filteredPosts = searchedPosts.filter((post) => {
    if (selectedCategory !== "all" && post.category !== selectedCategory) return false;
    if (selectedType !== "all") {
      if (selectedType === "media" && post.type !== "image" && (!post.images || post.images.length === 0)) return false;
      if (selectedType === "video" && post.type !== "video" && !post.video) return false;
      if (selectedType === "article" && post.type !== "article" && !post.article) return false;
      if (selectedType === "poll" && post.type !== "poll" && !post.poll) return false;
      if (selectedType === "text" && post.type !== "text") return false;
    }
    return true;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    }
    if (sortBy === "oldest") {
      return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    }
    if (sortBy === "popular") {
      const scoreA = Object.values(a.reactions || {}).reduce((acc: number, v: any) => acc + (typeof v === "number" ? v : 0), 0) + (a.comments?.length || 0);
      const scoreB = Object.values(b.reactions || {}).reduce((acc: number, v: any) => acc + (typeof v === "number" ? v : 0), 0) + (b.comments?.length || 0);
      return scoreB - scoreA;
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <div className="flex">
        {/* LEFT SIDEBAR */}
        <aside className="hidden lg:block w-72 shrink-0">
          <LeftSidebar />
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 flex justify-center">
          <div className="w-full max-w-3xl px-6 py-6 space-y-6">
            <PageHeader
              title="Saved Posts"
              description="Access your bookmarked articles, discussions, and saved timeline posts."
              icon={<Bookmark size={22} className="fill-yellow-400 text-yellow-400" />}
              badge={
                <div className="flex items-center gap-2">
                  <Badge variant="warning">{savedPosts.length} Saved</Badge>
                  {savedPosts.length > 0 && (
                    <>
                      <button
                        type="button"
                        onClick={handleExportBookmarks}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
                        title="Export bookmarks as JSON"
                      >
                        {copiedExport ? <Check size={13} className="text-emerald-400" /> : <Download size={13} />}
                        <span>{copiedExport ? "Exported!" : "Export"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowClearConfirm(true)}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition cursor-pointer"
                        title="Clear all saved bookmarks"
                      >
                        <Trash2 size={13} />
                        <span>Clear All</span>
                      </button>
                    </>
                  )}
                </div>
              }
            />

            {/* Clear All Confirmation Banner */}
            {showClearConfirm && (
              <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-rose-300">Clear all {savedPosts.length} saved bookmarks?</h4>
                    <p className="text-[11px] text-slate-400">This action will remove all saved posts from your bookmarks.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    disabled={isClearing}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAllBookmarks}
                    disabled={isClearing}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition cursor-pointer shadow-sm shadow-rose-600/30 flex items-center gap-1.5"
                  >
                    {isClearing ? <Loader size="sm" /> : <Trash2 size={13} />}
                    <span>{isClearing ? "Clearing..." : "Yes, Clear All"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Search Input Bar */}
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search saved posts by keyword, content, or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-[#111827] border border-[#1f2937] text-xs text-white placeholder:text-slate-500 outline-none focus:border-blue-500 transition shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* CATEGORY FILTER TABS */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                const count = categoryCounts[cat.id] || 0;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                        : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/50"
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isActive ? "bg-white/20 text-white" : "bg-slate-700/60 text-slate-400"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* FORMAT / TYPE FILTER PILLS */}
            {/* FORMAT / TYPE FILTER PILLS & SORT SELECTOR */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 text-xs">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <span className="text-[11px] text-slate-500 font-medium mr-1 shrink-0">Format:</span>
                {postTypes.map((type) => {
                  const isActive = selectedType === type.id;
                  const IconComponent = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                        isActive
                          ? "bg-slate-800 text-blue-400 border border-blue-500/40"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                      }`}
                    >
                      {IconComponent && <IconComponent size={12} />}
                      <span>{type.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                <ArrowUpDown size={12} className="text-slate-400" />
                <span className="text-[11px] text-slate-500 font-medium">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1 outline-none cursor-pointer focus:border-blue-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="py-16 text-center">
                <Loader label="Loading bookmarked posts..." />
              </div>
            ) : sortedPosts.length === 0 ? (
              <EmptyState
                icon={<Bookmark size={36} className="text-yellow-400 fill-yellow-400/20" />}
                title={searchQuery ? "No matching saved posts found" : "No bookmarked posts found"}
                description={
                  searchQuery
                    ? `No saved items match "${searchQuery}". Try searching for another keyword or author.`
                    : selectedCategory === "all"
                    ? "Save posts from your main feed or community channels to access them quickly anytime."
                    : `No saved posts match the "${selectedCategory}" category filter.`
                }
              />
            ) : (
              <div className="space-y-6">
                {sortedPosts.map((post) => (
                  <div key={post.id} className="relative group">
                    <div className="absolute top-4 right-14 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                      <div className="relative flex items-center">
                        <Tag size={12} className="absolute left-2 text-slate-400 pointer-events-none" />
                        <select
                          value={post.category || "discussions"}
                          onChange={(e) => handleAssignCategory(post.id, e.target.value)}
                          className="bg-slate-800/90 text-slate-200 text-[11px] font-medium rounded-lg pl-6 pr-2 py-1 border border-slate-700 outline-none hover:border-slate-500 transition cursor-pointer shadow-md"
                          title="Assign category tag"
                        >
                          <option value="discussions">Discussions</option>
                          <option value="media">Media</option>
                          <option value="articles">Articles</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleUnbookmark(post.bookmarkId || "", post.id)}
                        className="px-2.5 py-1 text-[11px] font-medium bg-rose-600/90 hover:bg-rose-600 text-white rounded-lg shadow-md backdrop-blur-xs flex items-center gap-1 transition cursor-pointer"
                        title="Remove from saved bookmarks"
                      >
                        <BookmarkX size={13} />
                        Remove
                      </button>
                    </div>
                    <PostCard post={post} />
                  </div>
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
    </div>
  );
}
