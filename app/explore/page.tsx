"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import PostCard from "@/components/features/post/PostCard";
import { usePostStore, mapBackendPostToPostType, PostType } from "@/store/postStore";
import { useChatStore } from "@/store/chatStore";
import { Search, Hash, Compass, User, Users, UserPlus, MessageSquare, Loader2, ArrowRight, History, Check } from "lucide-react";
import { searchService } from "@/services/searchService";
import { hashtagService } from "@/services/hashtagService";
import { followService } from "@/services/followService";
import { groupService } from "@/services/groupService";
import {
  PageHeader,
  Input,
  Tabs,
  Badge,
  EmptyState,
  Button,
  Avatar,
  Card,
  CardContent,
} from "@/components/ui";

const defaultPopularTags = ["design", "webgl", "react", "brutalism", "tokyo", "security"];

export default function ExplorePage() {
  const { posts } = usePostStore();
  const { openChat } = useChatStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [popularTags, setPopularTags] = useState<string[]>(defaultPopularTags);
  const [searching, setSearching] = useState(false);
  const [matchedUsers, setMatchedUsers] = useState<any[]>([]);
  const [matchedPosts, setMatchedPosts] = useState<PostType[]>([]);
  const [matchedGroups, setMatchedGroups] = useState<any[]>([]);
  const [matchedPages, setMatchedPages] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [followedUserIds, setFollowedUserIds] = useState<Set<string>>(new Set());
  const [joinedGroupIds, setJoinedGroupIds] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("recent_explore_searches");
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveRecentSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    try {
      const updated = [trimmed, ...recentSearches.filter((s) => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, 6);
      setRecentSearches(updated);
      localStorage.setItem("recent_explore_searches", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem("recent_explore_searches");
    } catch {
      // ignore
    }
  };

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
    if (!searchQuery.trim()) {
      setMatchedUsers([]);
      setMatchedPosts([]);
      setMatchedGroups([]);
      setMatchedPages([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const searchType =
          activeCategory === "people"
            ? "users"
            : activeCategory === "posts"
            ? "posts"
            : activeCategory === "groups"
            ? "groups"
            : activeCategory === "pages"
            ? "pages"
            : "all";

        const res = await searchService.search(searchQuery, searchType as any);
        const data = res?.data || res;

        if (data?.users && Array.isArray(data.users)) {
          setMatchedUsers(data.users);
        } else {
          setMatchedUsers([]);
        }

        if (data?.posts && Array.isArray(data.posts)) {
          setMatchedPosts(data.posts.map(mapBackendPostToPostType));
        } else {
          setMatchedPosts([]);
        }

        if (data?.groups && Array.isArray(data.groups)) {
          setMatchedGroups(data.groups);
        } else {
          setMatchedGroups([]);
        }

        if (data?.pages && Array.isArray(data.pages)) {
          setMatchedPages(data.pages);
        } else {
          setMatchedPages([]);
        }

        saveRecentSearch(searchQuery);
      } catch (err) {
        console.error("Search API error:", err);
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, activeCategory]);

  const getFilteredPosts = () => {
    if (searchQuery.trim() && matchedPosts.length > 0) {
      return matchedPosts;
    }

    let list = [...posts];

    if (selectedTag) {
      list = list.filter(
        (p) =>
          p.content.toLowerCase().includes(`#${selectedTag}`) ||
          p.content.toLowerCase().includes(selectedTag)
      );
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

  const handleToggleFollow = async (userId: string) => {
    setActionLoading(`follow-${userId}`);
    const isFollowed = followedUserIds.has(userId);
    setFollowedUserIds((prev) => {
      const next = new Set(prev);
      if (isFollowed) next.delete(userId);
      else next.add(userId);
      return next;
    });

    try {
      if (isFollowed) {
        await followService.unfollowUser(userId);
      } else {
        await followService.followUser(userId);
      }
    } catch (err) {
      console.error("Failed to toggle follow:", err);
      setFollowedUserIds((prev) => {
        const next = new Set(prev);
        if (isFollowed) next.add(userId);
        else next.delete(userId);
        return next;
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleGroupJoin = async (groupId: string) => {
    setActionLoading(`group-${groupId}`);
    const isJoined = joinedGroupIds.has(groupId);
    setJoinedGroupIds((prev) => {
      const next = new Set(prev);
      if (isJoined) next.delete(groupId);
      else next.add(groupId);
      return next;
    });

    try {
      if (isJoined) {
        await groupService.leaveGroup(groupId);
      } else {
        await groupService.joinGroup(groupId);
      }
    } catch (err) {
      console.error("Failed to toggle group join:", err);
      setJoinedGroupIds((prev) => {
        const next = new Set(prev);
        if (isJoined) next.add(groupId);
        else next.delete(groupId);
        return next;
      });
    } finally {
      setActionLoading(null);
    }
  };

  const categoryTabs = [
    { id: "all", label: "All Feed" },
    { id: "posts", label: searchQuery.trim() ? `Posts (${matchedPosts.length})` : "Posts" },
    { id: "people", label: searchQuery.trim() ? `People (${matchedUsers.length})` : "People" },
    { id: "groups", label: searchQuery.trim() ? `Groups (${matchedGroups.length})` : "Groups" },
    { id: "pages", label: searchQuery.trim() ? `Pages (${matchedPages.length})` : "Pages" },
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

              {/* Recent Searches */}
              {!searchQuery && recentSearches.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
                      <History size={13} />
                      Recent Searches
                    </span>
                    <button
                      onClick={clearRecentSearches}
                      className="text-[11px] text-slate-400 hover:text-red-400 transition-colors"
                    >
                      Clear history
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => {
                          setSearchQuery(term);
                          setSelectedTag(null);
                        }}
                        className="px-3 py-1 bg-[#1e293b] hover:bg-[#334155] text-slate-300 hover:text-white rounded-full text-xs font-medium transition-colors flex items-center gap-1.5"
                      >
                        <Search size={11} className="text-slate-400" />
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

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
              {searching ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <Loader2 size={32} className="animate-spin text-blue-500" />
                  <span className="text-xs">Searching community for "{searchQuery}"...</span>
                </div>
              ) : activeCategory === "people" ? (
                matchedUsers.length === 0 ? (
                  <EmptyState
                    icon={<User size={36} className="text-slate-400" />}
                    title={searchQuery ? "No members found" : "Search members"}
                    description={searchQuery ? "No community members match your search criteria." : "Type a name or handle above to find people."}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {matchedUsers.map((u) => {
                      const name = `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username || "Member";
                      const avatar = u.profilePicture || u.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100";
                      const isFollowing = followedUserIds.has(u.id);
                      return (
                        <Card key={u.id} hover className="p-4 flex items-center justify-between gap-3">
                          <Link href={`/profile/${u.username || u.id}`} className="flex items-center gap-3 min-w-0 cursor-pointer">
                            <Avatar src={avatar} name={name} size="md" />
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-white truncate hover:underline">{name}</h4>
                              <p className="text-[11px] text-slate-400 truncate">@{u.username || "user"}</p>
                            </div>
                          </Link>
                          <div className="flex gap-1.5 shrink-0 items-center">
                            <Button
                              size="sm"
                              variant={isFollowing ? "secondary" : "primary"}
                              loading={actionLoading === `follow-${u.id}`}
                              leftIcon={isFollowing ? <Check size={12} /> : <UserPlus size={12} />}
                              onClick={() => handleToggleFollow(u.id)}
                            >
                              {isFollowing ? "Following" : "Follow"}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openChat({ id: u.id, name, avatar })}
                              className="text-slate-300 hover:text-white"
                            >
                              <MessageSquare size={13} />
                            </Button>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )
              ) : activeCategory === "groups" ? (
                searchQuery.trim() ? (
                  matchedGroups.length === 0 ? (
                    <EmptyState
                      icon={<Users size={36} className="text-slate-400" />}
                      title="No groups found"
                      description={`No groups matched your search for "${searchQuery}".`}
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {matchedGroups.map((g) => {
                        const isJoined = joinedGroupIds.has(g.id);
                        return (
                          <Card key={g.id} hover className="p-4 flex items-center justify-between gap-3">
                            <Link href={`/groups/${g.id}`} className="flex items-center gap-3 min-w-0 cursor-pointer">
                              <Avatar src={g.coverImage || g.avatar} name={g.name} size="md" />
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-white truncate hover:underline">{g.name}</h4>
                                <p className="text-[11px] text-slate-400 truncate">{g.category || "Community"}</p>
                              </div>
                            </Link>
                            <div className="flex gap-1.5 shrink-0 items-center">
                              <Button
                                size="sm"
                                variant={isJoined ? "secondary" : "primary"}
                                loading={actionLoading === `group-${g.id}`}
                                leftIcon={isJoined ? <Check size={12} /> : <Users size={12} />}
                                onClick={() => handleToggleGroupJoin(g.id)}
                              >
                                {isJoined ? "Joined" : "Join"}
                              </Button>
                              <Link href={`/groups/${g.id}`}>
                                <Button size="sm" variant="ghost">
                                  View
                                </Button>
                              </Link>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )
                ) : (
                  <div className="py-8 text-center space-y-4 rounded-2xl border border-[#1f2937] bg-[#111827]/40 p-6">
                    <h3 className="text-sm font-bold text-white">Explore Community Groups</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Browse all active tech groups, discussions, and specialized engineering rooms.
                    </p>
                    <Link href="/groups" className="inline-block">
                      <Button variant="primary" size="sm" rightIcon={<ArrowRight size={14} />}>
                        Go to Groups Hub
                      </Button>
                    </Link>
                  </div>
                )
              ) : activeCategory === "pages" ? (
                searchQuery.trim() ? (
                  matchedPages.length === 0 ? (
                    <EmptyState
                      icon={<Search size={36} className="text-slate-400" />}
                      title="No pages found"
                      description={`No official brand pages matched "${searchQuery}".`}
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {matchedPages.map((p) => (
                        <Card key={p.id} hover className="p-4 flex items-center justify-between gap-3">
                          <Link href={`/pages/${p.id}`} className="flex items-center gap-3 min-w-0 cursor-pointer">
                            <Avatar src={p.avatar || p.cover} name={p.name} size="md" />
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-white truncate hover:underline">{p.name}</h4>
                              <p className="text-[11px] text-slate-400 truncate">{p.category || "Brand"}</p>
                            </div>
                          </Link>
                          <Link href={`/pages/${p.id}`}>
                            <Button size="sm" variant="secondary">
                              View Page
                            </Button>
                          </Link>
                        </Card>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="py-8 text-center space-y-4 rounded-2xl border border-[#1f2937] bg-[#111827]/40 p-6">
                    <h3 className="text-sm font-bold text-white">Explore Brand & Tech Pages</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Discover official brand pages, developer tools, and verified organizations.
                    </p>
                    <Link href="/pages" className="inline-block">
                      <Button variant="primary" size="sm" rightIcon={<ArrowRight size={14} />}>
                        Go to Pages Hub
                      </Button>
                    </Link>
                  </div>
                )
              ) : filteredPosts.length === 0 ? (
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