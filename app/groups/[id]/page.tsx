"use client";

import React, { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users, Shield, Plus, Check, UserPlus, Crown, MessageSquare, Info, ShieldCheck, Share2, Flag, Search, X, Clock, Flame, Filter, Pin, Megaphone, Pencil } from "lucide-react";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import PostCard from "@/components/features/post/PostCard";
import ReportModal from "@/components/features/post/ReportModal";
import { usePostStore, mapBackendPostToPostType, PostType } from "@/store/postStore";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { groupService } from "@/services/groupService";
import { friendshipService } from "@/services/friendshipService";
import {
  Button,
  Badge,
  Card,
  CardContent,
  Avatar,
  Loader,
  Dialog,
  EmptyState,
} from "@/components/ui";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function GroupDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  const { posts: storePosts } = usePostStore();
  const { user: authUser } = useAuthStore();
  const { openChat } = useChatStore();
  const [group, setGroup] = useState<any>(null);
  const [groupPosts, setGroupPosts] = useState<PostType[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [memberCount, setMemberCount] = useState(1);
  const [isJoinLoading, setIsJoinLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Tabs, members, and feed filters
  const [activeTab, setActiveTab] = useState<"feed" | "members" | "about">("feed");
  const [members, setMembers] = useState<any[]>([]);
  const [isMembersLoading, setIsMembersLoading] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [memberRoleFilter, setMemberRoleFilter] = useState<"all" | "admins" | "members">("all");
  const [feedSearchQuery, setFeedSearchQuery] = useState("");
  const [feedSort, setFeedSort] = useState<"latest" | "popular">("latest");
  const [pinnedAnnouncement, setPinnedAnnouncement] = useState<{ id: string; title: string; content: string; authorName: string; date: string } | null>(null);
  const [isEditingAnnouncement, setIsEditingAnnouncement] = useState(false);
  const [announcementText, setAnnouncementText] = useState("");

  // Post creation modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [friendsToInvite, setFriendsToInvite] = useState<any[]>([]);
  const [inviteSearch, setInviteSearch] = useState("");
  const [invitedIds, setInvitedIds] = useState<string[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`group_announcement_${id}`);
      if (stored) {
        setPinnedAnnouncement(JSON.parse(stored));
      } else {
        const defaultAnnounce = {
          id: `ann_${id}`,
          title: "Community Guidelines & Welcome",
          content: "Welcome to our group! Please be respectful, keep discussions on topic, and check out the group rules tab.",
          authorName: group?.creator?.name || "Admin",
          date: "Pinned Announcement",
        };
        setPinnedAnnouncement(defaultAnnounce);
      }
    } catch {}
  }, [id, group?.creator?.name]);

  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) return;
    const next = {
      id: `ann_${Date.now()}`,
      title: "Pinned Announcement",
      content: announcementText.trim(),
      authorName: authUser?.displayName || "Admin",
      date: "Just now",
    };
    setPinnedAnnouncement(next);
    setIsEditingAnnouncement(false);
    setAnnouncementText("");
    try {
      localStorage.setItem(`group_announcement_${id}`, JSON.stringify(next));
    } catch {}
  };

  const handleUnpinAnnouncement = () => {
    setPinnedAnnouncement(null);
    try {
      localStorage.removeItem(`group_announcement_${id}`);
    } catch {}
  };

  const fetchGroupData = async () => {
    setLoading(true);
    try {
      const res = await groupService.getGroupById(id);
      const data = res.data || res;
      if (data) {
        setGroup(data);
        setIsJoined(Boolean(data.isMember));
        setMemberCount(data._count?.members || data.membersCount || 1);
      }

      // Fetch dynamic group posts
      try {
        const postsRes = await groupService.getGroupPosts(id);
        const pItems = postsRes.data?.posts || postsRes.data || postsRes.posts || postsRes || [];
        if (Array.isArray(pItems) && pItems.length > 0) {
          setGroupPosts(pItems.map(mapBackendPostToPostType));
        } else {
          setGroupPosts(storePosts.slice(0, 3));
        }
      } catch {
        setGroupPosts(storePosts.slice(0, 3));
      }
    } catch (err) {
      console.error("Fetch group detail error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    setIsMembersLoading(true);
    try {
      const res = await groupService.getGroupMembers(id);
      const mItems = res.data?.members || res.members || res.data || [];
      if (Array.isArray(mItems) && mItems.length > 0) {
        setMembers(mItems);
      }
    } catch (err) {
      console.error("Fetch group members error:", err);
    } finally {
      setIsMembersLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupData();
    fetchMembers();
  }, [id]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    setIsPosting(true);
    setPostError(null);
    try {
      const res = await groupService.createGroupPost(id, postContent);
      const created = res.data || res;
      const newPost: PostType = created?.id
        ? mapBackendPostToPostType(created)
        : {
            id: `gp_${Date.now()}`,
            author: {
              name: authUser?.displayName || "You",
              username: authUser?.username || "you",
              avatar: authUser?.avatar || "https://images.unsplash.com/photo-1779040622687-42bb00790c67?w=500",
            },
            content: postContent,
            createdAt: "Just now",
            visibility: "public",
            type: "text",
            reactions: { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 },
            comments: [],
          };

      setGroupPosts((prev) => [newPost, ...prev]);
      setPostContent("");
      setIsCreateOpen(false);
    } catch (err: any) {
      console.error("Create group post error:", err);
      setPostError(err.response?.data?.message || err.message || "Failed to publish group post");
    } finally {
      setIsPosting(false);
    }
  };

  const handleJoinGroup = async () => {
    setIsJoined(true);
    setMemberCount((c) => c + 1);
    setIsJoinLoading(true);
    try {
      await groupService.joinGroup(id);
    } catch (err) {
      console.error("Group join error:", err);
      setIsJoined(false);
      setMemberCount((c) => Math.max(1, c - 1));
    } finally {
      setIsJoinLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    setIsLeaveDialogOpen(false);
    setIsJoined(false);
    setMemberCount((c) => Math.max(1, c - 1));
    setIsJoinLoading(true);
    try {
      await groupService.leaveGroup(id);
    } catch (err) {
      console.error("Group leave error:", err);
      setIsJoined(true);
      setMemberCount((c) => c + 1);
    } finally {
      setIsJoinLoading(false);
    }
  };

  const handleMembershipClick = () => {
    if (isJoined) {
      setIsLeaveDialogOpen(true);
    } else {
      handleJoinGroup();
    }
  };

  const [copied, setCopied] = useState(false);

  const handleShareGroup = async () => {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleOpenInvite = async () => {
    setIsInviteOpen(true);
    if (friendsToInvite.length === 0) {
      setLoadingFriends(true);
      try {
        const res = await friendshipService.getFriends();
        const items = res?.data || res || [];
        if (Array.isArray(items) && items.length > 0) {
          setFriendsToInvite(
            items.map((f: any) => {
              const u = f.friend || f;
              return {
                id: u.id || u._id,
                name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username || "Friend",
                username: u.username || "user",
                avatar: u.profilePicture || u.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
              };
            })
          );
        } else {
          setFriendsToInvite([
            { id: "u_sarah", name: "Sarah Wilson", username: "sarahw", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" },
            { id: "u_alex", name: "Alex Johnson", username: "alexj", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" },
            { id: "u_emma", name: "Emma Brown", username: "emmab", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100" },
          ]);
        }
      } catch {
        setFriendsToInvite([
          { id: "u_sarah", name: "Sarah Wilson", username: "sarahw", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" },
          { id: "u_alex", name: "Alex Johnson", username: "alexj", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" },
        ]);
      } finally {
        setLoadingFriends(false);
      }
    }
  };

  const handleToggleInvite = (friendId: string) => {
    setInvitedIds((prev) =>
      prev.includes(friendId) ? prev.filter((i) => i !== friendId) : [...prev, friendId]
    );
  };

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
            {loading ? (
              <div className="py-20 text-center">
                <Loader label="Loading group details..." />
              </div>
            ) : group ? (
              <div className="space-y-6">
                {/* Cover Banner */}
                <div className="relative h-52 rounded-3xl overflow-hidden border border-[#1f2937] shadow-2xl">
                  <Image
                    src={group.cover || "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=800"}
                    fill
                    sizes="100vw"
                    className="object-cover"
                    alt={group.name}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />

                  <div className="absolute top-4 left-4 z-10">
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<ArrowLeft size={14} />}
                      onClick={() => router.back()}
                    >
                      Back
                    </Button>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between z-10">
                    <div className="flex items-center gap-4">
                      <Avatar
                        src={group.avatar || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=120"}
                        name={group.name}
                        size="xl"
                      />
                      <div>
                        <h1 className="text-2xl font-bold text-white leading-tight drop-shadow-md">{group.name}</h1>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="primary" size="sm">{group.category || "Community"}</Badge>
                          <span className="text-xs text-slate-300 font-semibold">{memberCount} members</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={copied ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
                        onClick={handleShareGroup}
                        className="border border-[#1f2937] text-slate-200 hover:text-white"
                      >
                        {copied ? "Copied!" : "Share"}
                      </Button>

                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<Shield size={14} className="text-blue-400" />}
                        onClick={() => setIsRulesOpen(true)}
                        className="border border-[#1f2937] text-slate-200 hover:text-white"
                      >
                        Rules
                      </Button>

                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<UserPlus size={14} className="text-emerald-400" />}
                        onClick={handleOpenInvite}
                        className="border border-[#1f2937] text-slate-200 hover:text-white"
                      >
                        Invite
                      </Button>

                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<Flag size={14} className="text-amber-400" />}
                        onClick={() => setIsReportOpen(true)}
                        className="border border-[#1f2937] text-slate-200 hover:text-white"
                      >
                        Report
                      </Button>

                      <Button
                        variant={isJoined ? "secondary" : "primary"}
                        size="sm"
                        leftIcon={isJoined ? <Check size={14} /> : <UserPlus size={14} />}
                        loading={isJoinLoading}
                        onClick={handleMembershipClick}
                        className={isJoined ? "" : "bg-blue-600 hover:bg-blue-500"}
                      >
                        {isJoined ? "Joined Guild" : "Join Guild"}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex items-center gap-2 border-b border-[#1f2937] pb-1">
                  {[
                    { key: "feed", label: "Group Feed", icon: Users },
                    { key: "members", label: `Members (${memberCount})`, icon: ShieldCheck },
                    { key: "about", label: "About", icon: Info },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.key;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as any)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isActive
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                            : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                        }`}
                      >
                        <Icon size={14} />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Tab: Feed */}
                {activeTab === "feed" && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <h3 className="font-bold text-sm text-white">Group Feed</h3>
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<Plus size={14} />}
                        onClick={() => setIsCreateOpen(true)}
                      >
                        New Post
                      </Button>
                    </div>

                    {/* Pinned Announcement Banner */}
                    {pinnedAnnouncement ? (
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 to-slate-900 border border-blue-500/30 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400">
                              <Pin size={14} className="rotate-45" />
                            </span>
                            <span className="text-xs font-bold text-white uppercase tracking-wider">
                              {pinnedAnnouncement.title}
                            </span>
                            <span className="text-[10px] text-blue-400 font-medium">• {pinnedAnnouncement.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setAnnouncementText(pinnedAnnouncement.content);
                                setIsEditingAnnouncement(true);
                              }}
                              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                              title="Edit Announcement"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={handleUnpinAnnouncement}
                              className="p-1 rounded-md text-slate-400 hover:text-red-400 hover:bg-slate-800 transition cursor-pointer"
                              title="Unpin Announcement"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        </div>
                        {isEditingAnnouncement ? (
                          <form onSubmit={handleSaveAnnouncement} className="space-y-2 pt-1">
                            <textarea
                              value={announcementText}
                              onChange={(e) => setAnnouncementText(e.target.value)}
                              className="w-full h-18 rounded-xl bg-slate-900/90 border border-blue-500/40 p-2 text-xs text-white outline-none resize-none"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setIsEditingAnnouncement(false)}
                                className="px-2.5 py-1 rounded-lg text-xs text-slate-400 hover:text-white cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="px-3 py-1 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
                              >
                                Save Announcement
                              </button>
                            </div>
                          </form>
                        ) : (
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {pinnedAnnouncement.content}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setAnnouncementText("");
                            setIsEditingAnnouncement(true);
                            setPinnedAnnouncement({
                              id: "new",
                              title: "Pinned Announcement",
                              content: "",
                              authorName: authUser?.displayName || "Admin",
                              date: "Now",
                            });
                          }}
                          className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition cursor-pointer"
                        >
                          <Pin size={12} className="rotate-45" />
                          <span>Pin an announcement</span>
                        </button>
                      </div>
                    )}

                    {/* Feed Search & Sort Bar */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-[#111827] p-3 rounded-2xl border border-[#1f2937]">
                      <div className="relative flex-1">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search posts in this guild..."
                          value={feedSearchQuery}
                          onChange={(e) => setFeedSearchQuery(e.target.value)}
                          className="w-full bg-[#1e293b]/60 border border-[#334155] rounded-xl pl-8 pr-8 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                        />
                        {feedSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setFeedSearchQuery("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                          >
                            <X size={13} />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        <span className="text-[11px] text-slate-400 font-medium mr-1">Sort:</span>
                        <button
                          type="button"
                          onClick={() => setFeedSort("latest")}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                            feedSort === "latest"
                              ? "bg-blue-600 text-white shadow-sm"
                              : "bg-[#1e293b] text-slate-300 hover:text-white"
                          }`}
                        >
                          <Clock size={12} />
                          Latest
                        </button>
                        <button
                          type="button"
                          onClick={() => setFeedSort("popular")}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                            feedSort === "popular"
                              ? "bg-blue-600 text-white shadow-sm"
                              : "bg-[#1e293b] text-slate-300 hover:text-white"
                          }`}
                        >
                          <Flame size={12} />
                          Popular
                        </button>
                      </div>
                    </div>

                    {(() => {
                      let displayed = [...groupPosts];
                      if (feedSearchQuery.trim()) {
                        const q = feedSearchQuery.toLowerCase();
                        displayed = displayed.filter(
                          (p) =>
                            p.content.toLowerCase().includes(q) ||
                            p.author.name.toLowerCase().includes(q) ||
                            p.author.username.toLowerCase().includes(q)
                        );
                      }
                      if (feedSort === "latest") {
                        displayed.sort(
                          (a, b) =>
                            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
                        );
                      } else if (feedSort === "popular") {
                        const getScore = (p: PostType) => {
                          const rxSum = Object.values(p.reactions || {}).reduce(
                            (acc, v) => acc + (typeof v === "number" ? v : 0),
                            0
                          );
                          return rxSum + (p.comments?.length || 0);
                        };
                        displayed.sort((a, b) => getScore(b) - getScore(a));
                      }

                      if (displayed.length === 0) {
                        return (
                          <EmptyState
                            icon={<Users size={36} className="text-slate-500" />}
                            title={feedSearchQuery ? "No matching posts found" : "No posts in this group yet"}
                            description={
                              feedSearchQuery
                                ? `No group posts match "${feedSearchQuery}". Try clearing search filter.`
                                : "Be the first to share an update, question, or design in this community."
                            }
                            action={
                              feedSearchQuery ? (
                                <Button size="sm" variant="secondary" onClick={() => setFeedSearchQuery("")}>
                                  Clear Search
                                </Button>
                              ) : (
                                <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                                  Create First Post
                                </Button>
                              )
                            }
                          />
                        );
                      }

                      return displayed.map((post) => <PostCard key={post.id} post={post} />);
                    })()}
                  </div>
                )}

                {/* Tab: Members */}
                {activeTab === "members" && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-sm text-white">Community Members</h3>
                        <p className="text-xs text-slate-400">People who joined {group.name}</p>
                      </div>
                      <Badge variant="primary" size="sm">{memberCount} Total</Badge>
                    </div>

                    {/* Member Search Bar */}
                    <div className="relative">
                      <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search members by name, username, or role..."
                        value={memberSearchQuery}
                        onChange={(e) => setMemberSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#111827] border border-[#1f2937] text-xs text-white placeholder:text-slate-500 outline-none focus:border-blue-500 transition shadow-inner"
                      />
                      {memberSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setMemberSearchQuery("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    {/* Role Filter Chips */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setMemberRoleFilter("all")}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                          memberRoleFilter === "all"
                            ? "bg-blue-600 text-white"
                            : "bg-[#111827] text-slate-300 border border-[#1f2937] hover:text-white"
                        }`}
                      >
                        All Members
                      </button>
                      <button
                        type="button"
                        onClick={() => setMemberRoleFilter("admins")}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition flex items-center gap-1 ${
                          memberRoleFilter === "admins"
                            ? "bg-amber-600 text-white"
                            : "bg-[#111827] text-slate-300 border border-[#1f2937] hover:text-white"
                        }`}
                      >
                        <Crown size={12} />
                        Admins & Mods
                      </button>
                      <button
                        type="button"
                        onClick={() => setMemberRoleFilter("members")}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                          memberRoleFilter === "members"
                            ? "bg-blue-600 text-white"
                            : "bg-[#111827] text-slate-300 border border-[#1f2937] hover:text-white"
                        }`}
                      >
                        Members Only
                      </button>
                    </div>

                    {isMembersLoading ? (
                      <div className="py-12 text-center">
                        <Loader label="Loading members..." />
                      </div>
                    ) : members.length === 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-4 rounded-2xl bg-[#111827] border border-[#1f2937] flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar src={authUser?.avatar} name={authUser?.displayName || "Admin"} size="md" />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white">{authUser?.displayName || "Group Admin"}</span>
                                <Badge variant="warning" size="sm" className="text-[10px] px-1.5 py-0 flex items-center gap-1">
                                  <Crown size={10} /> Admin
                                </Badge>
                              </div>
                              <span className="text-[11px] text-slate-400">@{authUser?.username || "creator"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (() => {
                      const filteredMembers = members.filter((m: any, idx: number) => {
                        const isAdmin = m.role === "ADMIN" || m.role === "OWNER" || idx === 0;
                        const isMod = m.role === "MODERATOR";
                        if (memberRoleFilter === "admins" && !isAdmin && !isMod) return false;
                        if (memberRoleFilter === "members" && (isAdmin || isMod)) return false;

                        if (!memberSearchQuery.trim()) return true;
                        const q = memberSearchQuery.toLowerCase();
                        const u = m.user || m;
                        const name = `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.name || u.displayName || u.username || "";
                        const username = u.username || "";
                        const role = (m.role || (idx === 0 ? "admin" : "member")).toLowerCase();
                        return name.toLowerCase().includes(q) || username.toLowerCase().includes(q) || role.includes(q);
                      });

                      if (filteredMembers.length === 0) {
                        return (
                          <EmptyState
                            icon={<Users size={32} className="text-slate-500" />}
                            title="No matching members"
                            description={`No group members match "${memberSearchQuery}". Try a different name.`}
                          />
                        );
                      }

                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {filteredMembers.map((m: any, idx: number) => {
                            const u = m.user || m;
                            const name = `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.name || u.username || "Member";
                            const isAdmin = m.role === "ADMIN" || m.role === "OWNER" || idx === 0;
                            const isMod = m.role === "MODERATOR";

                            return (
                              <div key={m.id || idx} className="p-4 rounded-2xl bg-[#111827] border border-[#1f2937] flex items-center justify-between transition-all hover:border-slate-700">
                                <Link href={`/profile/${u.id || ""}`} className="flex items-center gap-3 flex-1 min-w-0">
                                  <Avatar src={u.avatar || u.profilePicture} name={name} size="md" />
                                  <div className="truncate">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-xs font-bold text-white hover:text-blue-400 truncate transition-colors">
                                        {name}
                                      </span>
                                      {isAdmin && (
                                        <Badge variant="warning" size="sm" className="text-[9px] px-1.5 py-0 shrink-0 flex items-center gap-1">
                                          <Crown size={9} /> Admin
                                        </Badge>
                                      )}
                                      {isMod && (
                                        <Badge variant="secondary" size="sm" className="text-[9px] px-1.5 py-0 shrink-0">
                                          Mod
                                        </Badge>
                                      )}
                                    </div>
                                    <span className="text-[11px] text-slate-400 block truncate">@{u.username || "member"}</span>
                                  </div>
                                </Link>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openChat({ id: u.id || `user-${idx}`, name, avatar: u.avatar || "" })}
                                  className="text-blue-400 hover:bg-blue-600/10 text-xs shrink-0 ml-2"
                                >
                                  <MessageSquare size={13} />
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Tab: About */}
                {activeTab === "about" && (
                  <Card>
                    <CardContent className="space-y-4 p-6">
                      <div>
                        <h3 className="font-bold text-sm text-white flex items-center gap-2 mb-2">
                          <Shield size={16} className="text-blue-400" />
                          About this Group
                        </h3>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {group.description || "Welcome to our group community! Share code snippets, designs, and developer discussions."}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-[#1f2937]/80 text-xs">
                        <div>
                          <p className="text-slate-400 text-[11px]">Privacy</p>
                          <p className="text-white font-medium capitalize">{group.privacy?.toLowerCase() || "Public"}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-[11px]">Category</p>
                          <p className="text-white font-medium">{group.category || "Community"}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-[11px]">Total Members</p>
                          <p className="text-white font-medium">{memberCount}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Create Group Post Modal */}
                <Dialog
                  isOpen={isCreateOpen}
                  onClose={() => setIsCreateOpen(false)}
                  title={`Post to ${group.name}`}
                  description="Share an update or question with the members of this group."
                  size="md"
                >
                  <form onSubmit={handleCreatePost} className="space-y-4 pt-2">
                    {postError && (
                      <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs">
                        {postError}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Your Message</label>
                      <textarea
                        rows={4}
                        placeholder="What would you like to discuss with this group?"
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        className="w-full bg-[#1e293b] border border-[#334155] rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition resize-none"
                        required
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-[#1f2937]">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsCreateOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={isPosting}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isPosting ? "Publishing..." : "Post to Group"}
                      </Button>
                    </div>
                  </form>
                </Dialog>

                {/* Leave Group Confirmation Dialog */}
                <Dialog
                  isOpen={isLeaveDialogOpen}
                  onClose={() => setIsLeaveDialogOpen(false)}
                  title="Leave Group"
                  description={`Are you sure you want to leave ${group.name}? You will lose access to member updates and community posts.`}
                >
                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsLeaveDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={isJoinLoading}
                      onClick={handleLeaveGroup}
                    >
                      {isJoinLoading ? "Leaving..." : "Leave Group"}
                    </Button>
                  </div>
                </Dialog>

                {/* Report Group Modal */}
                <ReportModal
                  isOpen={isReportOpen}
                  onClose={() => setIsReportOpen(false)}
                  targetId={group?.id || id}
                  targetType="GROUP"
                />

                {/* Group Rules Modal */}
                <Dialog
                  isOpen={isRulesOpen}
                  onClose={() => setIsRulesOpen(false)}
                  title={
                    <div className="flex items-center gap-2 text-white font-bold">
                      <Shield className="text-blue-400" size={18} />
                      <span>Group Rules & Guidelines</span>
                    </div>
                  }
                  description={`Community standards for ${group?.name || "this group"}.`}
                  size="md"
                >
                  <div className="space-y-3 pt-2 text-xs">
                    {[
                      { num: "1", title: "Be Respectful & Kind", desc: "Treat fellow members with empathy and courtesy. Constructive debate is welcome; harassment or abuse is strictly prohibited." },
                      { num: "2", title: "No Spam or Self-Promotion", desc: "Avoid repetitive promotional links, unsolicited advertisements, or commercial pitching outside of designated showcase threads." },
                      { num: "3", title: "Keep Discussions Relevant", desc: "Ensure your posts, questions, and responses align directly with the topics and mission of this community." },
                      { num: "4", title: "Respect Privacy & Security", desc: "Never share private conversations, API keys, credentials, or proprietary source code without explicit consent." },
                      { num: "5", title: "Offer Constructive Feedback", desc: "When sharing code reviews or critiques, offer actionable suggestions and celebrate member achievements." },
                    ].map((rule) => (
                      <div key={rule.num} className="p-3 rounded-xl bg-[#0f172a] border border-[#1f2937] flex gap-3">
                        <span className="h-6 w-6 rounded-full bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center shrink-0 text-xs border border-blue-500/30">
                          {rule.num}
                        </span>
                        <div>
                          <h4 className="font-bold text-white text-xs">{rule.title}</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{rule.desc}</p>
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-end pt-3 border-t border-[#1f2937]">
                      <Button variant="primary" size="sm" onClick={() => setIsRulesOpen(false)}>
                        I Understand & Agree
                      </Button>
                    </div>
                  </div>
                </Dialog>

                {/* Invite Friends Modal */}
                <Dialog
                  isOpen={isInviteOpen}
                  onClose={() => setIsInviteOpen(false)}
                  title={
                    <div className="flex items-center gap-2 text-white font-bold">
                      <UserPlus className="text-emerald-400" size={18} />
                      <span>Invite Friends to {group?.name || "Group"}</span>
                    </div>
                  }
                  description="Select connections from your network to invite them to this community."
                  size="md"
                >
                  <div className="space-y-3 pt-2 text-xs">
                    {/* Search Input */}
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search friends by name..."
                        value={inviteSearch}
                        onChange={(e) => setInviteSearch(e.target.value)}
                        className="w-full pl-9 pr-7 py-2 rounded-xl bg-[#0f172a] border border-[#1f2937] text-xs text-white placeholder:text-slate-500 outline-none focus:border-blue-500 transition"
                      />
                      {inviteSearch && (
                        <button
                          type="button"
                          onClick={() => setInviteSearch("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>

                    {loadingFriends ? (
                      <div className="py-8 text-center">
                        <Loader label="Loading your connections..." />
                      </div>
                    ) : (
                      <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {friendsToInvite
                          .filter((f) =>
                            !inviteSearch.trim() ||
                            f.name.toLowerCase().includes(inviteSearch.toLowerCase()) ||
                            f.username?.toLowerCase().includes(inviteSearch.toLowerCase())
                          )
                          .map((friend) => {
                            const isInvited = invitedIds.includes(friend.id);
                            return (
                              <div
                                key={friend.id}
                                className="flex items-center justify-between p-2.5 rounded-xl bg-[#0f172a] border border-[#1f2937]"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <Avatar src={friend.avatar} name={friend.name} size="sm" />
                                  <div className="min-w-0">
                                    <h4 className="font-bold text-white text-xs truncate">{friend.name}</h4>
                                    <p className="text-[10px] text-slate-400 truncate">@{friend.username || "user"}</p>
                                  </div>
                                </div>

                                <Button
                                  variant={isInvited ? "secondary" : "primary"}
                                  size="sm"
                                  onClick={() => handleToggleInvite(friend.id)}
                                  leftIcon={isInvited ? <Check size={12} className="text-emerald-400" /> : <Plus size={12} />}
                                  className={isInvited ? "border border-[#1f2937] text-emerald-400" : "bg-emerald-600 hover:bg-emerald-500"}
                                >
                                  {isInvited ? "Invited" : "Invite"}
                                </Button>
                              </div>
                            );
                          })}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-[#1f2937]">
                      <span className="text-[11px] text-slate-400">
                        {invitedIds.length} friend{invitedIds.length !== 1 ? "s" : ""} invited
                      </span>
                      <Button variant="primary" size="sm" onClick={() => setIsInviteOpen(false)}>
                        Done
                      </Button>
                    </div>
                  </div>
                </Dialog>
              </div>
            ) : (
              <div className="py-20 text-center space-y-3">
                <Users size={40} className="mx-auto text-slate-500" />
                <h3 className="text-lg font-bold text-white">Group Not Found</h3>
                <Button variant="secondary" onClick={() => router.push("/groups")}>
                  Return to Groups Hub
                </Button>
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
