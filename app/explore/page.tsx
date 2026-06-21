"use client";

import React, { useState } from "react";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import PostCard from "@/components/features/post/PostCard";
import { usePostStore } from "@/store/postStore";
import { useChatStore } from "@/store/chatStore";
import { Search, Hash, Users, UserPlus, UserCheck, MessageSquare, Flame, BookOpen, Compass, Shield } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const popularTags = ["design", "webgl", "react", "brutalism", "tokyo", "security"];

const recommendedPeople = [
  {
    id: "sarahc",
    name: "Sarah Chen",
    avatar: "https://images.unsplash.com/photo-1780570589435-059359e813cc?q=80&w=100&auto=format&fit=crop",
    bio: "Fluid Systems Designer",
  },
  {
    id: "davidk",
    name: "David Kim",
    avatar: "https://images.unsplash.com/photo-1780764895105-ea3037466236?q=80&w=100&auto=format&fit=crop",
    bio: "3D Artist & Photographer",
  },
  {
    id: "elena",
    name: "Elena Rostova",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    bio: "Core Infrastructure Lead",
  },
];

const mockGuilds = [
  { id: "g1", name: "UI Brutalists", members: "12.4k members", category: "Design", avatar: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=100" },
  { id: "g2", name: "Core Infrastructure", members: "8.2k members", category: "Systems", avatar: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=100" },
  { id: "g3", name: "Tokyo Creative Club", members: "3.5k members", category: "Photography", avatar: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=100" },
];

export default function ExplorePage() {
  const { posts } = usePostStore();
  const { openChat } = useChatStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<"all" | "posts" | "people" | "groups" | "pages">("all");
  const [followingStates, setFollowingStates] = useState<Record<string, boolean>>({});
  const [joinedGuilds, setJoinedGuilds] = useState<Record<string, boolean>>({});

  const toggleFollow = (username: string) => {
    setFollowingStates((prev) => ({
      ...prev,
      [username]: !prev[username],
    }));
  };

  const toggleJoinGuild = (guildId: string) => {
    setJoinedGuilds((prev) => ({
      ...prev,
      [guildId]: !prev[guildId],
    }));
  };

  // 1. FILTER POSTS
  const getFilteredPosts = () => {
    let list = [...posts];

    // Filter by tag if selected
    if (selectedTag) {
      list = list.filter((p) => p.content.toLowerCase().includes(`#${selectedTag}`) || p.content.toLowerCase().includes(selectedTag));
    }

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.content.toLowerCase().includes(q) ||
          p.author.name.toLowerCase().includes(q) ||
          p.author.username.toLowerCase().includes(q)
      );
    }

    // Filter by category: pages -> only show article post types
    if (activeCategory === "pages") {
      list = list.filter((p) => p.type === "article");
    }

    return list;
  };

  const filteredPosts = getFilteredPosts();

  // 2. FILTER PEOPLE
  const getFilteredPeople = () => {
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return recommendedPeople.filter(
        (person) =>
          person.name.toLowerCase().includes(q) ||
          person.id.toLowerCase().includes(q)
      );
    }
    // Default show all recommended if tab is active
    return recommendedPeople;
  };

  const filteredPeople = getFilteredPeople();

  // 3. FILTER GROUPS
  const getFilteredGroups = () => {
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return mockGuilds.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.category.toLowerCase().includes(q)
      );
    }
    return mockGuilds;
  };

  const filteredGroups = getFilteredGroups();

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
        <aside className="w-72 shrink-0">
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

            {/* 1. RENDER PEOPLE SECTION */}
            {(activeCategory === "people" || (activeCategory === "all" && searchQuery)) && filteredPeople.length > 0 && (
              <div className="rounded-2xl border border-[#1f2937] bg-[#111827] p-5 shadow-xl space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold tracking-wider uppercase text-slate-400 block">People</span>
                  {activeCategory === "all" && (
                    <button onClick={() => setActiveCategory("people")} className="text-[10px] text-blue-400 font-bold hover:underline">
                      See All
                    </button>
                  )}
                </div>
                <div className="divide-y divide-[#1f2937]">
                  {filteredPeople.map((person) => {
                    const following = !!followingStates[person.id];
                    return (
                      <div key={person.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                        <Link href={`/profile/${person.id}`} className="flex items-center gap-3 hover:opacity-85 transition">
                          <div className="relative h-10 w-10 overflow-hidden rounded-full border border-[#1f2937] bg-[#0f172a]">
                            <Image src={person.avatar} fill className="object-cover" alt={person.name} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{person.name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">@{person.id} • {person.bio}</p>
                          </div>
                        </Link>
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleFollow(person.id)}
                            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[10px] font-bold transition ${
                              following ? "bg-slate-800 text-slate-300" : "bg-blue-600 text-white"
                            }`}
                          >
                            {following ? <UserCheck size={12} /> : <UserPlus size={12} />}
                            <span>{following ? "Following" : "Follow"}</span>
                          </button>
                          <button
                            onClick={() => openChat({ id: person.id, name: person.name, avatar: person.avatar })}
                            className="bg-slate-800 border border-[#1f2937] text-slate-300 hover:bg-slate-700 rounded-full p-1.5 transition"
                          >
                            <MessageSquare size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. RENDER GROUPS / GUILDS SECTION */}
            {(activeCategory === "groups" || (activeCategory === "all" && searchQuery)) && filteredGroups.length > 0 && (
              <div className="rounded-2xl border border-[#1f2937] bg-[#111827] p-5 shadow-xl space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold tracking-wider uppercase text-slate-400 block">Suggested Guilds</span>
                  {activeCategory === "all" && (
                    <button onClick={() => setActiveCategory("groups")} className="text-[10px] text-blue-400 font-bold hover:underline">
                      See All
                    </button>
                  )}
                </div>
                <div className="divide-y divide-[#1f2937]">
                  {filteredGroups.map((guild) => {
                    const joined = !!joinedGuilds[guild.id];
                    return (
                      <div key={guild.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-[#1f2937] bg-[#0f172a]">
                            <Image src={guild.avatar} fill className="object-cover" alt={guild.name} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{guild.name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{guild.category} • {guild.members}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleJoinGuild(guild.id)}
                          className={`rounded-full px-3.5 py-1.5 text-[10px] font-bold transition ${
                            joined ? "bg-slate-800 text-slate-300" : "bg-blue-600 text-white"
                          }`}
                        >
                          {joined ? "Joined" : "Join"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. RENDER POSTS & PAGES FEED */}
            {(activeCategory === "all" || activeCategory === "posts" || activeCategory === "pages") && (
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
            )}
          </div>
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="w-80 shrink-0">
          <RightSidebar />
        </aside>
      </div>
    </div>
  );
}
