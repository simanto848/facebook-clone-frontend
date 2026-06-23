"use client";

import { useEffect, useState } from "react";
import CreatePost from "@/components/features/post/CreatePost";
import PostCard from "@/components/features/post/PostCard";
import FeedFilter from "@/components/features/post/FeedFilter";
import Stories from "@/components/features/story/Stories";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import { usePostStore } from "@/store/postStore";
import { ShieldAlert } from "lucide-react";

// Stories Skeleton Loader
const StoriesSkeleton = () => (
  <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="flex flex-col items-center shrink-0 space-y-2">
        <div className="h-16 w-16 rounded-full bg-[#1f2937]/60 animate-pulse border-2 border-slate-700/30" />
        <div className="h-2.5 w-12 rounded-md bg-[#1f2937]/60 animate-pulse" />
      </div>
    ))}
  </div>
);

// Post Card Skeleton Loader
const PostSkeleton = () => (
  <div className="rounded-2xl border border-[#1f2937] bg-[#111827] p-5 space-y-4">
    <div className="flex items-center gap-3">
      <div className="h-11 w-11 rounded-full bg-[#1f2937] animate-pulse" />
      <div className="space-y-2">
        <div className="h-4 w-32 rounded-md bg-[#1f2937] animate-pulse" />
        <div className="h-3 w-20 rounded-md bg-[#1f2937] animate-pulse" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-4 w-full rounded-md bg-[#1f2937] animate-pulse" />
      <div className="h-4 w-5/6 rounded-md bg-[#1f2937] animate-pulse" />
      <div className="h-4 w-2/3 rounded-md bg-[#1f2937] animate-pulse" />
    </div>
    <div className="h-48 w-full rounded-xl bg-[#1f2937] animate-pulse" />
    <div className="flex justify-between pt-2">
      <div className="h-8 w-20 rounded-lg bg-[#1f2937] animate-pulse" />
      <div className="h-8 w-20 rounded-lg bg-[#1f2937] animate-pulse" />
      <div className="h-8 w-20 rounded-lg bg-[#1f2937] animate-pulse" />
    </div>
  </div>
);

// Feed Empty State
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 rounded-2xl border border-dashed border-[#1f2937] bg-[#111827]/40 p-6">
    <div className="h-16 w-16 rounded-full bg-slate-800/30 flex items-center justify-center text-slate-500">
      <ShieldAlert size={32} />
    </div>
    <div className="space-y-1">
      <h3 className="text-lg font-bold text-white">No posts found</h3>
      <p className="text-sm text-slate-400 max-w-sm">
        We couldn't find any posts matching this filter. Try switching to "Latest" or creating a new post.
      </p>
    </div>
  </div>
);

export default function Home() {
  const { posts, filter, setFilter } = usePostStore();
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading on mount and filter changes
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [filter]);

  const getFilteredPosts = () => {
    let list = [...posts];

    if (filter === "popular") {
      list.sort((a, b) => {
        const sumA = Object.values(a.reactions).reduce((x, y) => x + y, 0);
        const sumB = Object.values(b.reactions).reduce((x, y) => x + y, 0);
        return sumB - sumA;
      });
    } else if (filter === "trending") {
      list.sort((a, b) => b.comments.length - a.comments.length);
    } else if (filter === "following") {
      list = list.filter((p) => p.author.username !== "alex");
    }

    return list;
  };

  const filteredPosts = getFilteredPosts();

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <div className="flex">
        {/* LEFT SIDEBAR */}
        <aside className="hidden lg:block w-72 shrink-0">
          <LeftSidebar />
        </aside>

        {/* MAIN FEED */}
        <main className="flex-1 flex justify-center">
          <div className="w-full max-w-3xl px-6 py-6 space-y-6">
            {isLoading ? <StoriesSkeleton /> : <Stories />}
            <CreatePost />
            <FeedFilter value={filter} onChange={setFilter} />

            <div className="space-y-6">
              {isLoading ? (
                <>
                  <PostSkeleton />
                  <PostSkeleton />
                </>
              ) : filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))
              ) : (
                <EmptyState />
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
