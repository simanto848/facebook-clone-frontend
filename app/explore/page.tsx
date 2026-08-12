"use client";

import React, { useState, useEffect } from "react";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import PostCard from "@/components/features/post/PostCard";
import { usePostStore } from "@/store/postStore";
import { useChatStore } from "@/store/chatStore";
import { Search, Hash, Flame } from "lucide-react";
import { searchService } from "@/services/searchService";
import { hashtagService } from "@/services/hashtagService";

const defaultPopularTags = ["design", "webgl", "react", "brutalism", "tokyo", "security"];

export default function ExplorePage() {
  const { posts } = usePostStore();
  const { openChat } = useChatStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<"all" | "posts" | "people" | "groups" | "pages">("all");
  const [popularTags, setPopularTags] = useState<string[]>(defaultPopularTags);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await hashtagService.getTrending();
        const items = res.data || res || [];
        if (Array.isArray(items) && items.length > 0) {
          setPopularTags(items.map((t: any) => t.name || t.tag || t));
        }
      } catch (err) {
        console.error("Using default trending tags fallback:", err);
      }
    };
    fetchTrending();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) return;
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await searchService.search(searchQuery, activeCategory === "all" ? "all" : (activeCategory as any));
        // Search API return parsed
      } catch (err) {
        console.error("Search API error:", err);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, activeCategory]);

  const getFilteredPosts = () => {
    let list = [...posts];

    if (selectedTag) {
      list = list.filter((p) => p.content.toLowerCase().includes(`#${selectedTag}`) || p.content.toLowerCase().includes(selectedTag));
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.content.toLowerCase().includes(q) ||
          p.author.name.toLowerCase().includes(q) ||
          p.author.username.toLowerCase().includes(q)
      );
    }

    if (activeCategory === "pages") {
      list = list.filter((p) => p.type === "article");
    }

    return list;
  };

  const filteredPosts = getFilteredPosts();

  const categories = [
    { id: "all", label: "All" },
    { id: "posts", label: "Posts" },
    { id: "people", label: "People" },
    { id: "groups", label: "Groups" },
    { id: "pages", label: "Pages" },
  ] as const;

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
            {/* Search Input */}
            <div className="relative flex items-center rounded-2xl border border-[#1f2937] bg-[#111827] px-4 py-3 shadow-xl">
              <Search size={18} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search posts, people, topics..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedTag(null);
                }}
                className="ml-3 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-slate-400 hover:text-white text-xs font-bold px-1"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Popular Topics / Tags */}
            <div className="space-y-2">
              <span className="text-xs font-bold tracking-wider uppercase text-slate-400 block">Popular Topics</span>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => {
                  const isActive = selectedTag === tag;
                  return (
                    <button
                      key={tag}
                      onClick={() => {
                        if (isActive) {
                          setSelectedTag(null);
                          setSearchQuery("");
                        } else {
                          setSelectedTag(tag);
                          setSearchQuery("");
                        }
                      }}
                      className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition
                        ${
                          isActive
                            ? "bg-blue-600 border-blue-500 text-white"
                            : "border-[#1f2937] bg-[#111827]/40 text-slate-300 hover:border-slate-600 hover:text-white"
                        }
                      `}
                    >
                      <Hash size={12} className={isActive ? "text-white" : "text-slate-400"} />
                      <span>{tag}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="border-b border-[#1f2937]/60 flex gap-6">
              {categories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`
                      pb-3 px-1 text-xs font-bold transition-all relative border-b-2
                      ${isActive ? "border-blue-500 text-blue-400 font-extrabold" : "border-transparent text-slate-400 hover:text-slate-200"}
                    `}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* RENDER POSTS & PAGES FEED */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-[#1f2937] pb-3">
                <Flame size={16} className="text-blue-400" />
                <span className="text-xs font-bold tracking-wider uppercase text-slate-400">
                  {activeCategory === "pages" ? "Articles & Pages" : "Trending Feed"}
                </span>
              </div>

              {filteredPosts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 rounded-2xl border border-dashed border-[#1f2937] bg-[#111827]/40">
                  <p className="text-slate-400 font-semibold text-sm">No matches found</p>
                  <p className="text-xs text-slate-500 max-w-xs">Try selecting a different topic or category.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
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