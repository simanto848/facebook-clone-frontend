"use client";

import React, { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users, Shield, Plus, Check, UserPlus, Crown, MessageSquare, Info, ShieldCheck } from "lucide-react";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import PostCard from "@/components/features/post/PostCard";
import { usePostStore, mapBackendPostToPostType, PostType } from "@/store/postStore";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { groupService } from "@/services/groupService";
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

  // Tabs and members
  const [activeTab, setActiveTab] = useState<"feed" | "members" | "about">("feed");
  const [members, setMembers] = useState<any[]>([]);
  const [isMembersLoading, setIsMembersLoading] = useState(false);

  // Post creation modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

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
                    <div className="flex items-center justify-between">
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

                    {groupPosts.length === 0 ? (
                      <EmptyState
                        icon={<Users size={36} className="text-slate-500" />}
                        title="No posts in this group yet"
                        description="Be the first to share an update, question, or design in this community."
                        action={
                          <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                            Create First Post
                          </Button>
                        }
                      />
                    ) : (
                      groupPosts.map((post) => (
                        <PostCard key={post.id} post={post} />
                      ))
                    )}
                  </div>
                )}

                {/* Tab: Members */}
                {activeTab === "members" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-sm text-white">Community Members</h3>
                        <p className="text-xs text-slate-400">People who joined {group.name}</p>
                      </div>
                      <Badge variant="primary" size="sm">{memberCount} Total</Badge>
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
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {members.map((m: any, idx: number) => {
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
                    )}
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
