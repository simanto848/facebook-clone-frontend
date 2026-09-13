"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import PostCard from "@/components/features/post/PostCard";
import { Hash, Flame, Bell, Loader2 } from "lucide-react";
import { usePostStore, mapBackendPostToPostType, PostType } from "@/store/postStore";
import { hashtagService } from "@/services/hashtagService";
import { PageHeader, Badge, Button, EmptyState } from "@/components/ui";

export default function HashtagPage() {
  const params = useParams();
  const rawTag = (params?.tag as string) || "design";
  const tag = decodeURIComponent(rawTag);
  const { posts } = usePostStore();
  const [following, setFollowing] = useState(false);
  const [hashtagPosts, setHashtagPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);

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
              badge={<Badge variant="primary" pulse>{hashtagPosts.length} Posts</Badge>}
              actions={
                <Button
                  variant={following ? "secondary" : "primary"}
                  size="sm"
                  leftIcon={<Bell size={14} />}
                  onClick={() => setFollowing(!following)}
                >
                  {following ? "Following Topic" : "Follow Topic"}
                </Button>
              }
            />

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
