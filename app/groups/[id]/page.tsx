"use client";

import React, { useState, useEffect, use } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users, Shield, Plus, Check, UserPlus } from "lucide-react";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import PostCard from "@/components/features/post/PostCard";
import { usePostStore, mapBackendPostToPostType, PostType } from "@/store/postStore";
import { useAuthStore } from "@/store/authStore";
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
  const [group, setGroup] = useState<any>(null);
  const [groupPosts, setGroupPosts] = useState<PostType[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [memberCount, setMemberCount] = useState(1);
  const [isJoinLoading, setIsJoinLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Post creation modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
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

  useEffect(() => {
    fetchGroupData();
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
      setPostError(err.response?.data?.message || err.message || "Failed to publish group post");
    } finally {
      setIsPosting(false);
    }
  };

  const toggleJoin = async () => {
    const nextJoined = !isJoined;
    setIsJoined(nextJoined);
    setMemberCount((c) => (nextJoined ? c + 1 : Math.max(1, c - 1)));
    setIsJoinLoading(true);
    try {
      if (nextJoined) {
        await groupService.joinGroup(id);
      } else {
        await groupService.leaveGroup(id);
      }
    } catch (err) {
      console.error("Group toggle join error:", err);
      // Revert on error
      setIsJoined(!nextJoined);
      setMemberCount((c) => (nextJoined ? Math.max(1, c - 1) : c + 1));
    } finally {
      setIsJoinLoading(false);
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
                      onClick={toggleJoin}
                      className={isJoined ? "" : "bg-blue-600 hover:bg-blue-500"}
                    >
                      {isJoined ? "Joined Guild" : "Join Guild"}
                    </Button>
                  </div>
                </div>

                {/* About Guild */}
                <Card>
                  <CardContent className="space-y-2 p-5">
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      <Shield size={16} className="text-blue-400" />
                      About this Group
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {group.description || "Welcome to our group community! Share code snippets, designs, and developer discussions."}
                    </p>
                  </CardContent>
                </Card>

                {/* Group Timeline Feed */}
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
