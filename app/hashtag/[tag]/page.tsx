"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import PostCard from "@/components/features/post/PostCard";
import { Hash, Flame, Bell, Loader2, Sparkles, TrendingUp, Check, Send, Plus, Image as ImageIcon } from "lucide-react";
import { usePostStore, mapBackendPostToPostType, PostType } from "@/store/postStore";
import { useAuthStore } from "@/store/authStore";
import { hashtagService } from "@/services/hashtagService";
import { postService } from "@/services/postService";
import { PageHeader, Badge, Button, EmptyState, Avatar } from "@/components/ui";

export default function HashtagPage() {
  const params = useParams();
  const rawTag = (params?.tag as string) || "design";
  const tag = decodeURIComponent(rawTag);
  const user = useAuthStore((s) => s.user);
  const { posts } = usePostStore();
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(1420);
  const [followFeedback, setFollowFeedback] = useState<string | null>(null);
  const [hashtagPosts, setHashtagPosts] = useState<PostType[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostText, setNewPostText] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  const handleCreateTagPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim() || isPosting) return;

    setIsPosting(true);
    setPostError(null);
    let content = newPostText.trim();
    if (!content.toLowerCase().includes(`#${tag.toLowerCase()}`)) {
      content = `${content} #${tag}`;
    }

    try {
      const res = await postService.createPost({
        content,
        privacy: "PUBLIC",
      });
      const data = res?.data || res;
      let newPost: PostType;
      if (data && data.id) {
        newPost = mapBackendPostToPostType(data);
      } else {
        newPost = {
          id: Math.random().toString(36).substring(7),
          author: {
            name: user?.displayName || user?.username || "You",
            username: user?.username || "you",
            avatar: user?.avatar || "https://images.unsplash.com/photo-1779040622687-42bb00790c67?w=100",
          },
          content,
          createdAt: "Just now",
          visibility: "public",
          type: "text",
          reactions: { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 },
          comments: [],
        };
      }
      setHashtagPosts((prev) => [newPost, ...prev]);
      usePostStore.getState().createPost({
        author: newPost.author,
        visibility: "public",
        type: "text",
        content,
      });
      setNewPostText("");
    } catch (err: any) {
      console.error("Create hashtag post error:", err);
      setPostError(err.response?.data?.message || err.message || "Failed to publish post");
    } finally {
      setIsPosting(false);
    }
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem("followed_topics");
      if (stored) {
        const list: string[] = JSON.parse(stored);
        if (list.includes(tag.toLowerCase())) {
          setFollowing(true);
        }
      }
    } catch {
      // ignore
    }
  }, [tag]);

  const handleToggleFollow = () => {
    const nextFollowing = !following;
    setFollowing(nextFollowing);
    setFollowerCount((prev) => (nextFollowing ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const stored = localStorage.getItem("followed_topics");
      let list: string[] = stored ? JSON.parse(stored) : [];
      if (nextFollowing) {
        if (!list.includes(tag.toLowerCase())) list.push(tag.toLowerCase());
        setFollowFeedback(`Following #${tag}. Posts tagged with this topic will appear in your feed.`);
      } else {
        list = list.filter((t) => t !== tag.toLowerCase());
        setFollowFeedback(`Unfollowed #${tag}.`);
      }
      localStorage.setItem("followed_topics", JSON.stringify(list));
      setTimeout(() => setFollowFeedback(null), 3000);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await hashtagService.getTrending(12);
        const data = res?.data || res || [];
        if (Array.isArray(data) && data.length > 0) {
          setTrendingTopics(data);
        } else {
          setTrendingTopics([
            { name: "react", count: 420 },
            { name: "nextjs", count: 310 },
            { name: "typescript", count: 280 },
            { name: "webgl", count: 190 },
            { name: "tailwindcss", count: 160 },
            { name: "design", count: 140 },
          ]);
        }
      } catch (err) {
        console.warn("Trending fetch failed:", err);
      }
    };
    fetchTrending();
  }, []);

  useEffect(() => {
    const fetchTagPosts = async () => {
      setLoading(true);
      try {
        const res = await hashtagService.getHashtagPosts(tag);
        const items = res?.data?.posts || res?.data || res?.posts || res;
        if (Array.isArray(items) && items.length > 0) {
          setHashtagPosts(items.map(mapBackendPostToPostType));
        } else {
          // Fallback to store filtering
          const localFiltered = posts.filter(
            (p) =>
              p.content.toLowerCase().includes(`#${tag.toLowerCase()}`) ||
              p.content.toLowerCase().includes(tag.toLowerCase())
          );
          setHashtagPosts(localFiltered);
        }
      } catch (err) {
        console.warn("Backend hashtag fetch failed, falling back to local posts:", err);
        const localFiltered = posts.filter(
          (p) =>
            p.content.toLowerCase().includes(`#${tag.toLowerCase()}`) ||
            p.content.toLowerCase().includes(tag.toLowerCase())
        );
        setHashtagPosts(localFiltered);
      } finally {
        setLoading(false);
      }
    };

    fetchTagPosts();
  }, [tag, posts]);

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
            <PageHeader
              title={`#${tag}`}
              description={`Explore community posts, code snippets, and discussions tagged with #${tag}.`}
              icon={<Hash size={24} className="text-blue-400" />}
              badge={
                <div className="flex items-center gap-2">
                  <Badge variant="primary" pulse>{hashtagPosts.length} Posts</Badge>
                  <span className="text-xs text-slate-400 font-medium">{followerCount.toLocaleString()} followers</span>
                </div>
              }
              actions={
                <Button
                  variant={following ? "secondary" : "primary"}
                  size="sm"
                  leftIcon={following ? <Check size={14} className="text-emerald-400" /> : <Bell size={14} />}
                  onClick={handleToggleFollow}
                >
                  {following ? "Following Topic" : "Follow Topic"}
                </Button>
              }
            />

            {followFeedback && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl text-xs flex items-center gap-2 animate-in fade-in duration-200">
                <Check size={14} className="text-blue-400 shrink-0" />
                <span>{followFeedback}</span>
              </div>
            )}

            {/* Trending Topics Pill Bar */}
            {trendingTopics.length > 0 && (
              <div className="space-y-2 p-3.5 rounded-2xl border border-[#1f2937] bg-[#111827]/50 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <Flame size={14} className="text-amber-400" />
                  <span>Trending Topics</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trendingTopics.map((topic: any) => {
                    const topicName = (topic.name || topic.tag || topic).replace(/^#/, "");
                    const isCurrent = topicName.toLowerCase() === tag.toLowerCase();
                    return (
                      <Link
                        key={topicName}
                        href={`/hashtag/${encodeURIComponent(topicName)}`}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                          isCurrent
                            ? "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/20"
                            : "bg-[#0f172a] border-[#1f2937] text-slate-300 hover:border-slate-600 hover:text-white"
                        }`}
                      >
                        <Hash size={12} className={isCurrent ? "text-white" : "text-blue-400"} />
                        <span>{topicName}</span>
                        {topic.count && (
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                              isCurrent ? "bg-white/20 text-white" : "bg-[#1f2937] text-slate-400"
                            }`}
                          >
                            {topic.count}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Post Publisher for Tag */}
            <div className="rounded-2xl border border-[#1f2937] bg-[#111827] p-4 space-y-3 shadow-lg">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <Plus size={14} className="text-blue-400" />
                <span>Publish to #{tag}</span>
              </div>

              {postError && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs">
                  {postError}
                </div>
              )}

              <form onSubmit={handleCreateTagPost} className="space-y-3">
                <div className="flex gap-2.5 items-center">
                  <Avatar
                    src={user?.avatar || "https://images.unsplash.com/photo-1779040622687-42bb00790c67?w=100"}
                    name={user?.displayName || "You"}
                    size="sm"
                    className="shrink-0"
                  />
                  <input
                    type="text"
                    placeholder={`Write a thought or code tip about #${tag}...`}
                    value={newPostText}
                    onChange={(e) => setNewPostText(e.target.value)}
                    className="flex-1 rounded-xl border border-[#1f2937] bg-[#0f172a] px-4 py-2.5 text-xs text-white outline-none placeholder:text-slate-500 focus:border-blue-500 transition"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    loading={isPosting}
                    disabled={isPosting || !newPostText.trim()}
                    leftIcon={<Send size={13} />}
                  >
                    {isPosting ? "Posting..." : "Post"}
                  </Button>
                </div>
              </form>
            </div>

            <div className="flex items-center gap-2 border-b border-[#1f2937] pb-3">
              <Flame size={16} className="text-blue-400" />
              <span className="text-xs font-bold tracking-wider uppercase text-slate-400">
                Trending #{tag} Posts
              </span>
            </div>

            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 size={32} className="animate-spin text-blue-500" />
                <span className="text-xs">Loading posts tagged with #{tag}...</span>
              </div>
            ) : hashtagPosts.length === 0 ? (
              <EmptyState
                icon={<Hash size={36} className="text-slate-400" />}
                title={`No posts found for #${tag}`}
                description="Be the first developer to publish a post with this hashtag!"
              />
            ) : (
              <div className="space-y-6">
                {hashtagPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
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
