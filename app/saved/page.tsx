"use client";

import React, { useEffect, useState } from "react";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import PostCard from "@/components/features/post/PostCard";
import { Bookmark } from "lucide-react";
import { bookmarkService } from "@/services/bookmarkService";
import { mapBackendPostToPostType, PostType } from "@/store/postStore";
import { PageHeader, Badge, EmptyState, Loader } from "@/components/ui";

export default function SavedPostsPage() {
  const [savedPosts, setSavedPosts] = useState<(PostType & { bookmarkId?: string; category?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const res = await bookmarkService.getUserBookmarks();
      const items = res.data || res || [];
      const posts = items.map((b: any) => {
        const rawPost = b.post || b;
        const mapped = mapBackendPostToPostType(rawPost);
        return {
          ...mapped,
          bookmarkId: b.id,
          saved: true,
          category: b.category || "All",
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

  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", label: "All Items" },
    { id: "media", label: "Media & Photos" },
    { id: "discussions", label: "Discussions" },
    { id: "articles", label: "Articles" },
  ];

  const handleUnbookmark = async (bookmarkId: string, postId: string) => {
    try {
      await bookmarkService.deleteBookmark(bookmarkId || postId);
    } catch (err) {
      console.error("Failed to delete bookmark:", err);
    }
    setSavedPosts((prev) => prev.filter((p) => p.id !== postId && p.bookmarkId !== bookmarkId));
  };

  const filteredPosts = savedPosts.filter((post) => {
    if (selectedCategory === "all") return true;
    if (selectedCategory === "media") return post.type === "image" || post.type === "video" || (post.images && post.images.length > 0);
    if (selectedCategory === "discussions") return post.type === "text" || (!post.article && (!post.images || post.images.length === 0));
    if (selectedCategory === "articles") return !!post.article;
    return true;
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
              badge={<Badge variant="warning">{savedPosts.length} Saved</Badge>}
            />

            {/* CATEGORY FILTER TABS */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                        : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/50"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {loading ? (
              <div className="py-16 text-center">
                <Loader label="Loading bookmarked posts..." />
              </div>
            ) : filteredPosts.length === 0 ? (
              <EmptyState
                icon={<Bookmark size={36} className="text-yellow-400 fill-yellow-400/20" />}
                title="No bookmarked posts found"
                description={
                  selectedCategory === "all"
                    ? "Save posts from your main feed or community channels to access them quickly anytime."
                    : `No saved posts match the "${selectedCategory}" category filter.`
                }
              />
            ) : (
              <div className="space-y-6">
                {filteredPosts.map((post) => (
                  <div key={post.id} className="relative group">
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
