"use client";

import React, { useState, useEffect, use } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Flag, ThumbsUp, Plus, Globe, Send, MessageSquare } from "lucide-react";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import PostCard from "@/components/features/post/PostCard";
import { pageService } from "@/services/pageService";
import { mapBackendPostToPostType, PostType } from "@/store/postStore";
import {
  Button,
  Badge,
  Card,
  CardContent,
  Avatar,
  Loader,
  EmptyState,
} from "@/components/ui";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function BrandPageDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);

  const [page, setPage] = useState<any>(null);
  const [pagePosts, setPagePosts] = useState<PostType[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [postContent, setPostContent] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    const fetchPageData = async () => {
      setLoading(true);
      try {
        const res = await pageService.getPageById(id);
        const data = res.data || res;
        if (data) {
          setPage(data);
          setIsLiked(Boolean(data.isLiked));
          setLikesCount(data._count?.likes || data.likes || 0);
        }

        const postsRes = await pageService.getPagePosts(id);
        const pItems = postsRes.data?.posts || postsRes.data || postsRes.posts || postsRes || [];
        if (Array.isArray(pItems) && pItems.length > 0) {
          setPagePosts(pItems.map(mapBackendPostToPostType));
        }
      } catch (err) {
        console.error("Fetch page detail error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, [id]);

  const handleToggleLike = async () => {
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikesCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));

    try {
      await pageService.toggleLike(id);
    } catch (err) {
      console.error("Toggle page like error:", err);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim() || posting) return;

    setPosting(true);
    const content = postContent.trim();
    setPostContent("");

    try {
      const res = await pageService.createPagePost(id, content);
      const newP = res?.data || res;
      if (newP && newP.id) {
        setPagePosts((prev) => [mapBackendPostToPostType(newP), ...prev]);
      } else {
        // Optimistic entry
        const optPost: PostType = {
          id: Math.random().toString(36).substring(7),
          author: {
            name: page?.name || "Page Admin",
            username: page?.name?.toLowerCase().replace(/\s+/g, "") || "page",
            avatar: page?.avatar || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=200",
          },
          content,
          createdAt: "Just now",
          visibility: "public",
          type: "text",
          reactions: { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 },
          comments: [],
        };
        setPagePosts((prev) => [optPost, ...prev]);
      }
    } catch (err) {
      console.error("Create page post error:", err);
    } finally {
      setPosting(false);
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
              <div className="py-24 text-center">
                <Loader label="Loading Page details..." />
              </div>
            ) : !page ? (
              <div className="space-y-4">
                <button
                  onClick={() => router.back()}
                  className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition"
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <EmptyState
                  icon={<Flag size={36} className="text-slate-400" />}
                  title="Page Not Found"
                  description="This official page or brand community does not exist or has been removed."
                />
              </div>
            ) : (
              <>
                {/* Header Back Button */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => router.back()}
                    className="h-9 w-9 rounded-full border border-[#1f2937] bg-[#111827]/60 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Official Page
                  </span>
                </div>

                {/* Page Cover & Profile Card */}
                <div className="rounded-3xl border border-[#1f2937] bg-[#111827] overflow-hidden shadow-xl">
                  {/* Cover Photo */}
                  <div className="relative h-56 w-full bg-slate-800">
                    <Image
                      src={page.cover || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200"}
                      alt={page.name}
                      fill
                      priority
                      sizes="100vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-[#111827] via-transparent to-black/30" />
                  </div>

                  {/* Profile Header Details */}
                  <div className="p-6 pt-0 relative">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-14 mb-4">
                      <div className="flex items-end gap-4">
                        <div className="relative h-24 w-24 rounded-2xl overflow-hidden border-4 border-[#111827] bg-[#0f172a] shrink-0 shadow-lg">
                          <Image
                            src={page.avatar || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=200"}
                            alt={page.name}
                            fill
                            sizes="96px"
                            className="object-cover"
                          />
                        </div>
                        <div className="mb-1">
                          <h1 className="text-2xl font-black text-white">{page.name}</h1>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="primary">{page.category || "Official Brand"}</Badge>
                            <span className="text-xs text-slate-400">
                              {likesCount.toLocaleString()} followers
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2.5 w-full sm:w-auto">
                        <Button
                          variant={isLiked ? "secondary" : "primary"}
                          size="md"
                          leftIcon={<ThumbsUp size={16} className={isLiked ? "text-blue-400 fill-blue-400" : ""} />}
                          onClick={handleToggleLike}
                          className="flex-1 sm:flex-none"
                        >
                          {isLiked ? "Following Page" : "Follow Page"}
                        </Button>
                        {page.website && (
                          <a
                            href={page.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#0f172a] border border-[#1f2937] hover:border-slate-600 text-xs font-semibold text-slate-200 transition"
                          >
                            <Globe size={14} />
                            <span>Website</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {page.description && (
                      <p className="text-xs text-slate-300 leading-relaxed max-w-2xl mt-3">
                        {page.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Page Post Creation Form */}
                <div className="rounded-2xl border border-[#1f2937] bg-[#111827] p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                    <Plus size={14} className="text-blue-400" />
                    <span>Publish an update as {page.name}</span>
                  </div>
                  <form onSubmit={handleCreatePost} className="flex gap-2">
                    <input
                      type="text"
                      placeholder={`Share an announcement or update on ${page.name}...`}
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      className="flex-1 rounded-xl border border-[#1f2937] bg-[#0f172a] px-4 py-2.5 text-xs text-white outline-none placeholder:text-slate-500 focus:border-blue-500 transition"
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={posting || !postContent.trim()}
                      leftIcon={<Send size={13} />}
                    >
                      {posting ? "Posting..." : "Publish"}
                    </Button>
                  </form>
                </div>

                {/* Page Timeline Posts */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                    Page Timeline
                  </h3>
                  {pagePosts.length === 0 ? (
                    <EmptyState
                      icon={<MessageSquare size={36} className="text-slate-500" />}
                      title="No posts yet"
                      description="Be the first to publish an official update to this page timeline."
                    />
                  ) : (
                    pagePosts.map((post) => <PostCard key={post.id} post={post} />)
                  )}
                </div>
              </>
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
