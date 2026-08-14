"use client";

import React, { useState, useEffect } from "react";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import PostCard from "@/components/features/post/PostCard";
import { usePostStore } from "@/store/postStore";
import { useChatStore } from "@/store/chatStore";
import { Search, Hash, Compass } from "lucide-react";
import { searchService } from "@/services/searchService";
import { hashtagService } from "@/services/hashtagService";
import {
  PageHeader,
  Input,
  Tabs,
  Badge,
  EmptyState,
  Button,
} from "@/components/ui";

const defaultPopularTags = ["design", "webgl", "react", "brutalism", "tokyo", "security"];

export default function ExplorePage() {
  const { posts } = usePostStore();
  const { openChat } = useChatStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
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
        await searchService.search(searchQuery, activeCategory === "all" ? "all" : (activeCategory as any));
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

  const categoryTabs = [
    { id: "all", label: "All Feed" },
    { id: "posts", label: "Posts" },
    { id: "people", label: "People" },
    { id: "groups", label: "Groups" },
    { id: "pages", label: "Pages" },
  ];

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
              title="Explore & Discover"
              description="Search discussions, developer topics, trending hashtags, and community posts."
              icon={<Compass size={22} />}
            />

            {/* Search Bar */}
            <div className="space-y-4">
              <Input
                placeholder="Search posts, developers, topics..."
                leftIcon={<Search size={18} />}
                clearable
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedTag(null);
                }}
                className="bg-[#111827] border-[#1f2937] text-sm py-3"
              />

              {/* Popular Topics */}
              <div className="space-y-2">
                <span className="text-xs font-bold tracking-wider uppercase text-slate-400 block">Popular Topics</span>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag) => {
                    const isActive = selectedTag === tag;
                    return (
                      <Button
                        key={tag}
                        variant={isActive ? "primary" : "secondary"}
                        size="sm"
                        leftIcon={<Hash size={12} />}
                        onClick={() => {
                          if (isActive) {
                            setSelectedTag(null);
                            setSearchQuery("");
                          } else {
                            setSelectedTag(tag);
                            setSearchQuery("");
                          }
                        }}
                      >
                        {tag}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>

            <Tabs
              tabs={categoryTabs}
              activeTab={activeCategory}
              onChange={setActiveCategory}
              variant="line"
            />

            {/* Posts & Search Results Feed */}
            <div className="space-y-4">
              {filteredPosts.length === 0 ? (
                <EmptyState
                  icon={<Search size={36} className="text-slate-400" />}
                  title="No matches found"
                  description="Try selecting a different topic tag or adjusting your search phrase."
                />
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