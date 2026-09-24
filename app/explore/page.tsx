"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import PostCard from "@/components/features/post/PostCard";
import { usePostStore, mapBackendPostToPostType, PostType } from "@/store/postStore";
import { useChatStore } from "@/store/chatStore";
import { Search, Hash, Compass, User, Users, UserPlus, MessageSquare, Loader2, ArrowRight, History, Check, X, Filter, ArrowUpDown, LayoutGrid, List } from "lucide-react";
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
  const [postSort, setPostSort] = useState<"newest" | "popular">("newest");
  const [formatFilter, setFormatFilter] = useState<"all" | "media" | "text">("all");
  const [postLayout, setPostLayout] = useState<"list" | "grid">("list");
  const [popularTags, setPopularTags] = useState<string[]>(defaultPopularTags);
  const [searching, setSearching] = useState(false);
  const [matchedUsers, setMatchedUsers] = useState<any[]>([]);
  const [matchedPosts, setMatchedPosts] = useState<PostType[]>([]);
  const [matchedGroups, setMatchedGroups] = useState<any[]>([]);
  const [matchedPages, setMatchedPages] = useState<any[]>([]);
  const [matchedHashtags, setMatchedHashtags] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [followedUserIds, setFollowedUserIds] = useState<Set<string>>(new Set());
  const [joinedGroupIds, setJoinedGroupIds] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleSelectHashtag = async (tag: string) => {
    setSelectedTag(tag);
    setSearchQuery("");
    setSearching(true);
    try {
      const res = await hashtagService.getHashtagPosts(tag);
      const items = res?.data?.posts || res?.data || res?.posts || res || [];
      if (Array.isArray(items) && items.length > 0) {
        setMatchedPosts(items.map(mapBackendPostToPostType));
      } else {
        // Filter local posts with the tag
        const filtered = posts.filter(
          (p) => p.content.toLowerCase().includes(`#${tag.toLowerCase()}`) || p.content.toLowerCase().includes(tag.toLowerCase())
        );
        setMatchedPosts(filtered);
      }
    } catch (e) {
      console.warn("Could not fetch hashtag posts from backend, using fallback filter:", e);
      const filtered = posts.filter(
        (p) => p.content.toLowerCase().includes(`#${tag.toLowerCase()}`) || p.content.toLowerCase().includes(tag.toLowerCase())
      );
      setMatchedPosts(filtered);
    } finally {
      setSearching(false);
    }
  };

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

  const removeRecentSearch = (termToRemove: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = recentSearches.filter((s) => s !== termToRemove);
    setRecentSearches(updated);
    try {
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
      setMatchedHashtags([]);
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

        // Query hashtags
        const tagClean = searchQuery.replace(/^#/, "").trim();
        if (tagClean) {
          try {
            const hashRes = await hashtagService.searchHashtags(tagClean);
            const hashData = hashRes?.data || hashRes || [];
            if (Array.isArray(hashData)) {
              setMatchedHashtags(hashData);
            } else {
              setMatchedHashtags([]);
            }
          } catch {
            setMatchedHashtags([]);
          }
        } else {
          setMatchedHashtags([]);
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

    if (formatFilter === "media") {
      list = list.filter((p) => p.type === "image" || p.type === "video" || (p.images && p.images.length > 0) || p.video);
    } else if (formatFilter === "text") {
      list = list.filter((p) => p.type === "text" || (!p.images?.length && !p.video));
    }

    if (postSort === "popular") {
      list.sort((a, b) => {
        const scoreA = Object.values(a.reactions || {}).reduce((acc: number, v: any) => acc + (typeof v === "number" ? v : 0), 0) + (a.comments?.length || 0);
        const scoreB = Object.values(b.reactions || {}).reduce((acc: number, v: any) => acc + (typeof v === "number" ? v : 0), 0) + (b.comments?.length || 0);
        return scoreB - scoreA;
      });
    } else if (postSort === "newest") {
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
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
    { id: "hashtags", label: searchQuery.trim() ? `Hashtags (${matchedHashtags.length})` : "Hashtags" },
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
                      <div
                        key={term}
                        onClick={() => {
                          setSearchQuery(term);
                          setSelectedTag(null);
                        }}
                        className="group px-3 py-1 bg-[#1e293b] hover:bg-[#334155] text-slate-300 hover:text-white rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Search size={11} className="text-slate-400" />
                        <span>{term}</span>
                        <button
                          type="button"
                          onClick={(e) => removeRecentSearch(term, e)}
                          className="p-0.5 ml-0.5 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded-full transition-colors"
                          aria-label={`Remove ${term}`}
                        >
                          <X size={10} />
                        </button>
                      </div>
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
                            setMatchedPosts([]);
                          } else {
                            handleSelectHashtag(tag);
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
              ) : activeCategory === "hashtags" ? (
                (() => {
                  const displayTags =
                    matchedHashtags.length > 0
                      ? matchedHashtags
                      : popularTags.map((t, idx) => ({ name: t, postCount: 120 - idx * 15, isTrending: true }));

                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <Hash size={16} className="text-blue-400" />
                          <span>{searchQuery ? `Hashtags for "${searchQuery}"` : "Trending Topics & Hashtags"}</span>
                        </h3>
                        <span className="text-xs text-slate-400">{displayTags.length} topics</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {displayTags.map((item: any, idx: number) => {
                          const tagName = typeof item === "string" ? item : item.name || item.tag;
                          const count = item.postCount || item.count || (100 - idx * 10);
                          const isTrending = item.isTrending ?? true;

                          return (
                            <Card
                              key={tagName + idx}
                              hover
                              className="p-4 flex items-center justify-between cursor-pointer border-[#1f2937] hover:border-blue-500/40 transition"
                              onClick={() => handleSelectHashtag(tagName)}
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-blue-600/15 text-blue-400 border border-blue-500/20">
                                  <Hash size={18} />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-bold text-white hover:text-blue-400 transition">
                                      #{tagName}
                                    </h4>
                                    {isTrending && (
                                      <Badge variant="primary" size="sm" className="text-[10px] py-0 px-1.5 bg-blue-600/20 text-blue-400 border-blue-500/30">
                                        Trending
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-400 mt-0.5">{count} posts</p>
                                </div>
                              </div>

                              <Button
                                size="sm"
                                variant="ghost"
                                rightIcon={<ArrowRight size={14} />}
                                className="text-xs text-slate-400 hover:text-white"
                              >
                                View
                              </Button>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()
              ) : activeCategory === "posts" ? (
                <div className="space-y-4">
                  {/* Filter and Sort Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-xl bg-[#111827] border border-[#1f2937] text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-500 font-medium">Filter:</span>
                      {(["all", "media", "text"] as const).map((fmt) => (
                        <button
                          key={fmt}
                          type="button"
                          onClick={() => setFormatFilter(fmt)}
                          className={`px-2.5 py-1 rounded-lg capitalize font-medium transition cursor-pointer ${
                            formatFilter === fmt
                              ? "bg-blue-600 text-white shadow-sm"
                              : "text-slate-400 hover:text-white hover:bg-slate-800"
                          }`}
                        >
                          {fmt === "all" ? "All Posts" : fmt === "media" ? "Photos & Videos" : "Text Only"}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      <div className="flex items-center gap-1.5">
                        <ArrowUpDown size={12} className="text-slate-400" />
                        <span className="text-[11px] text-slate-500 font-medium">Sort:</span>
                        <select
                          value={postSort}
                          onChange={(e) => setPostSort(e.target.value as any)}
                          className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1 outline-none cursor-pointer"
                        >
                          <option value="newest">Newest First</option>
                          <option value="popular">Most Popular</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60">
                        <button
                          type="button"
                          onClick={() => setPostLayout("list")}
                          className={`p-1 rounded-md transition cursor-pointer ${postLayout === "list" ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-slate-200"}`}
                          title="List View"
                        >
                          <List size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPostLayout("grid")}
                          className={`p-1 rounded-md transition cursor-pointer ${postLayout === "grid" ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-slate-200"}`}
                          title="Grid View"
                        >
                          <LayoutGrid size={13} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {filteredPosts.length === 0 ? (
                    <EmptyState
                      icon={<MessageSquare size={36} className="text-slate-400" />}
                      title="No posts found"
                      description={searchQuery ? `No posts matched your search for "${searchQuery}".` : "No posts found in this topic."}
                    />
                  ) : (
                    <div className={postLayout === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4 items-start" : "space-y-6"}>
                      {filteredPosts.map((post) => (
                        <PostCard key={post.id} post={post} />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {searchQuery.trim() && matchedUsers.length > 0 && (
                    <div className="p-4 rounded-xl bg-[#1e293b]/50 border border-[#334155]/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                          <User size={14} className="text-blue-400" />
                          People matching "{searchQuery}" ({matchedUsers.length})
                        </span>
                        <button
                          onClick={() => setActiveCategory("people")}
                          className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                        >
                          View all people &rarr;
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {matchedUsers.slice(0, 2).map((u) => {
                          const name = `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username || "Member";
                          const avatar = u.profilePicture || u.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100";
                          return (
                            <Link
                              key={u.id}
                              href={`/profile/${u.username || u.id}`}
                              className="p-2 rounded-lg bg-[#0f172a]/60 hover:bg-[#0f172a] border border-[#1f2937] flex items-center gap-2.5 transition"
                            >
                              <Avatar src={avatar} name={name} size="sm" />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-white truncate">{name}</p>
                                <p className="text-[10px] text-slate-400 truncate">@{u.username || "user"}</p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {searchQuery.trim() && matchedGroups.length > 0 && (
                    <div className="p-4 rounded-xl bg-[#1e293b]/50 border border-[#334155]/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                          <Users size={14} className="text-emerald-400" />
                          Groups matching "{searchQuery}" ({matchedGroups.length})
                        </span>
                        <button
                          onClick={() => setActiveCategory("groups")}
                          className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                        >
                          View all groups &rarr;
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {matchedGroups.slice(0, 2).map((g) => (
                          <Link
                            key={g.id}
                            href={`/groups/${g.id}`}
                            className="p-2 rounded-lg bg-[#0f172a]/60 hover:bg-[#0f172a] border border-[#1f2937] flex items-center gap-2.5 transition"
                          >
                            <Avatar src={g.coverImage || g.avatar} name={g.name} size="sm" />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate">{g.name}</p>
                              <p className="text-[10px] text-slate-400 truncate">{g.category || "Community"}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredPosts.length === 0 ? (
                    <EmptyState
                      icon={<Search size={36} className="text-slate-400" />}
                      title="No matches found"
                      description="Try selecting a different topic tag or adjusting your search phrase."
                    />
                  ) : (
                    <div className={postLayout === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4 items-start" : "space-y-6"}>
                      {filteredPosts.map((post) => (
                        <PostCard key={post.id} post={post} />
                      ))}
                    </div>
                  )}
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