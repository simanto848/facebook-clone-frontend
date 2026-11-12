"use client";

import { useEffect, useState } from "react";
import CreatePost from "@/components/features/post/CreatePost";
import PostCard from "@/components/features/post/PostCard";
import PostSkeleton from "@/components/features/post/PostSkeleton";
import FeedFilter from "@/components/features/post/FeedFilter";
import Stories from "@/components/features/story/Stories";
import StoriesSkeleton from "@/components/features/story/StoriesSkeleton";
import FeedLayoutWrapper from "@/components/layout/FeedLayoutWrapper";
import { usePostStore, mapBackendPostToPostType } from "@/store/postStore";
import { postService } from "@/services/postService";
import { feedService } from "@/services/feedService";
import { ShieldAlert, RefreshCw, Clock, TrendingUp, Sparkles } from "lucide-react";
import { Button, ScrollToTop, SortToggleGroup, SearchInput } from "@/components/ui";

const TOPIC_CATEGORIES = [
  { id: "all", label: "All Posts", icon: "🌐" },
  { id: "tech", label: "Tech & Code", icon: "💻", keywords: ["tech", "code", "dev", "react", "next", "js", "webgl", "typescript", "architecture", "css"] },
  { id: "design", label: "Design & UI", icon: "🎨", keywords: ["design", "ui", "ux", "layout", "figma", "theme", "style", "palette"] },
  { id: "photography", label: "Photos", icon: "📸", keywords: ["photo", "camera", "shot", "view", "image", "sunset", "city"] },
  { id: "startups", label: "Startups", icon: "🚀", keywords: ["startup", "launch", "product", "growth", "build", "saas", "team"] },
  { id: "ai", label: "AI & ML", icon: "⚡", keywords: ["ai", "ml", "gpt", "model", "llm", "neural", "deepmind", "agent"] },
];

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
  const [searchQuery, setSearchQuery] = useState("");
  const [formatFilter, setFormatFilter] = useState<"all" | "media" | "text" | "poll">("all");
  const [topicCategory, setTopicCategory] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"recent" | "top">("recent");

  const fetchFeed = async (activeFilter = filter, showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      let res;
      if (activeFilter === "trending" || activeFilter === "popular") {
        res = await feedService.getTrendingFeed({ page: 1, pageSize: 25 });
      } else if (formatFilter === "media") {
        res = await feedService.getMediaFeed({ page: 1, pageSize: 25 });
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

    if (topicCategory !== "all") {
      const cat = TOPIC_CATEGORIES.find((c) => c.id === topicCategory);
      if (cat?.keywords) {
        list = list.filter((p) => {
          const content = (p.content || "").toLowerCase();
          return cat.keywords.some((kw) => content.includes(kw));
        });
      }
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

    if (sortOrder === "top") {
      list.sort((a, b) => {
        const sumA = Object.values(a.reactions || {}).reduce((x, y) => x + y, 0) + (a.comments?.length || 0);
        const sumB = Object.values(b.reactions || {}).reduce((x, y) => x + y, 0) + (b.comments?.length || 0);
        return sumB - sumA;
      });
    } else {
      list.sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime() || 0;
        const timeB = new Date(b.createdAt).getTime() || 0;
        return timeB - timeA;
      });
    }

    return list;
  };

  const filteredPosts = getFilteredPosts();

  return (
    <FeedLayoutWrapper>
      {isLoading ? <StoriesSkeleton /> : <Stories />}
      <CreatePost />

      {/* Facebook-style Topic Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {TOPIC_CATEGORIES.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => setTopicCategory(topic.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                    topicCategory === topic.id
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "bg-[#111827] text-slate-300 hover:text-white border border-[#1f2937] hover:bg-slate-800"
                  }`}
                >
                  <span>{topic.icon}</span>
                  <span>{topic.label}</span>
                </button>
              ))}
            </div>

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
                {/* Sort order toggle (Recent vs Top Stories) */}
                <SortToggleGroup
                  value={sortOrder}
                  onChange={setSortOrder}
                  options={[
                    { value: "recent", label: "Recent", icon: <Clock size={12} />, title: "Sort by most recent" },
                    { value: "top", label: "Top", icon: <TrendingUp size={12} />, title: "Sort by top engagement" },
                  ]}
                />

                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search posts..."
                />
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
                <PostSkeleton count={2} />
              ) : filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))
              ) : (
                <EmptyState />
              )}
            </div>

      {/* Floating Scroll to Top Button */}
      <ScrollToTop threshold={400} />
    </FeedLayoutWrapper>
  );
}
