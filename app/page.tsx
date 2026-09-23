"use client";

import { useEffect, useState } from "react";
import CreatePost from "@/components/features/post/CreatePost";
import PostCard from "@/components/features/post/PostCard";
import FeedFilter from "@/components/features/post/FeedFilter";
import Stories from "@/components/features/story/Stories";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import { usePostStore, mapBackendPostToPostType } from "@/store/postStore";
import { postService } from "@/services/postService";
import { feedService } from "@/services/feedService";
import { ShieldAlert, RefreshCw, ArrowUp, Search, X } from "lucide-react";
import { Button } from "@/components/ui";

// Stories Skeleton Loader
const StoriesSkeleton = () => (
  <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="flex flex-col items-center shrink-0 space-y-2">
        <div className="h-16 w-16 rounded-full bg-[#1f2937]/60 animate-pulse border-2 border-slate-700/30" />
        <div className="h-2.5 w-12 rounded-md bg-[#1f2937]/60 animate-pulse" />
      </div>
    ))}
  </div>
);

// Post Card Skeleton Loader
const PostSkeleton = () => (
  <div className="rounded-2xl border border-[#1f2937] bg-[#111827] p-5 space-y-4">
    <div className="flex items-center gap-3">
      <div className="h-11 w-11 rounded-full bg-[#1f2937] animate-pulse" />
      <div className="space-y-2">
        <div className="h-4 w-32 rounded-md bg-[#1f2937] animate-pulse" />
        <div className="h-3 w-20 rounded-md bg-[#1f2937] animate-pulse" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-4 w-full rounded-md bg-[#1f2937] animate-pulse" />
      <div className="h-4 w-5/6 rounded-md bg-[#1f2937] animate-pulse" />
      <div className="h-4 w-2/3 rounded-md bg-[#1f2937] animate-pulse" />
    </div>
    <div className="h-48 w-full rounded-xl bg-[#1f2937] animate-pulse" />
    <div className="flex justify-between pt-2">
      <div className="h-8 w-20 rounded-lg bg-[#1f2937] animate-pulse" />
      <div className="h-8 w-20 rounded-lg bg-[#1f2937] animate-pulse" />
      <div className="h-8 w-20 rounded-lg bg-[#1f2937] animate-pulse" />
    </div>
  </div>
);

// Feed Empty State
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 rounded-2xl border border-dashed border-[#1f2937] bg-[#111827]/40 p-6">
    <div className="h-16 w-16 rounded-full bg-slate-800/30 flex items-center justify-center text-slate-500">
      <ShieldAlert size={32} />
    </div>
    <div className="space-y-1">
      <h3 className="text-lg font-bold text-white">No posts found</h3>
      <p className="text-sm text-slate-400 max-w-sm">
        We couldn't find any posts matching this filter. Try switching to "Latest" or creating a new post.
      </p>
    </div>
  </div>
);

export default function Home() {
  const { posts, filter, setFilter, setPosts } = usePostStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formatFilter, setFormatFilter] = useState<"all" | "media" | "text" | "poll">("all");

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const fetchFeed = async (activeFilter = filter, showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      let res;
      if (activeFilter === "trending") {
        res = await feedService.getTrendingFeed({ page: 1, pageSize: 25 });
      } else {
        res = await feedService.getChronologicalFeed({ page: 1, pageSize: 25 });
      }
      const items = res?.data?.posts || res?.data || res?.posts || res;
      if (Array.isArray(items) && items.length > 0) {
        const mapped = items.map(mapBackendPostToPostType);
        setPosts(mapped);
      } else {
        // Fallback to postService feed if needed
        const fallbackRes = await postService.getFeed(1, 25);
        const fallbackItems = fallbackRes.data?.posts || fallbackRes.data || fallbackRes.posts || fallbackRes;
        if (Array.isArray(fallbackItems) && fallbackItems.length > 0) {
          setPosts(fallbackItems.map(mapBackendPostToPostType));
        }
      }
    } catch (err) {
      console.warn("Backend feed unavailable or returned error, using fallback feed:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeed(filter, false);
  }, [filter]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchFeed(filter, false);
  };

  const getFilteredPosts = () => {
    let list = [...posts];

    if (filter === "popular") {
      list.sort((a, b) => {
        const sumA = Object.values(a.reactions).reduce((x, y) => x + y, 0);
        const sumB = Object.values(b.reactions).reduce((x, y) => x + y, 0);
        return sumB - sumA;
      });
    } else if (filter === "trending") {
      list.sort((a, b) => b.comments.length - a.comments.length);
    } else if (filter === "following") {
      list = list.filter((p) => p.author.username !== "alex");
    }

    if (formatFilter === "media") {
      list = list.filter((p) => (p.images && p.images.length > 0) || !!p.video || !!(p as any).image);
    } else if (formatFilter === "text") {
      list = list.filter((p) => (!p.images || p.images.length === 0) && !p.video && !(p as any).image && !p.poll && p.type !== "poll");
    } else if (formatFilter === "poll") {
      list = list.filter((p) => p.type === "poll" || !!p.poll);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.content?.toLowerCase().includes(q) ||
          p.author?.name?.toLowerCase().includes(q) ||
          p.author?.username?.toLowerCase().includes(q)
      );
    }

    return list;
  };

  const filteredPosts = getFilteredPosts();

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <div className="flex">
        {/* LEFT SIDEBAR */}
        <aside className="hidden lg:block w-72 shrink-0">
          <LeftSidebar />
        </aside>

        {/* MAIN FEED */}
        <main className="flex-1 flex justify-center">
          <div className="w-full max-w-3xl px-6 py-6 space-y-6">
            {isLoading ? <StoriesSkeleton /> : <Stories />}
            <CreatePost />
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex-1">
                <FeedFilter
                  value={filter}
                  onChange={setFilter}
                  formatFilter={formatFilter}
                  onFormatChange={setFormatFilter}
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-36 sm:w-44 pl-8 pr-7 py-1.5 rounded-xl bg-[#111827] border border-[#1f2937] text-xs text-white placeholder:text-slate-500 outline-none focus:border-blue-500 transition"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />}
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="text-slate-400 hover:text-white shrink-0"
                >
                  Refresh
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              {isLoading ? (
                <>
                  <PostSkeleton />
                  <PostSkeleton />
                </>
              ) : filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))
              ) : (
                <EmptyState />
              )}
            </div>
          </div>
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="hidden xl:block w-80 shrink-0">
          <RightSidebar />
        </aside>
      </div>

      {/* Floating Scroll to Top Button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/40 border border-blue-400/30 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer animate-in fade-in slide-in-from-bottom-2"
          title="Scroll to top"
          aria-label="Scroll to top"
        >
          <ArrowUp size={18} />
        </button>
      )}
    </div>
  );
}
