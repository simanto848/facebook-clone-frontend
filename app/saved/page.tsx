"use client";

import React from "react";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import PostCard from "@/components/features/post/PostCard";
import { usePostStore } from "@/store/postStore";
import { Bookmark } from "lucide-react";

export default function SavedPostsPage() {
  const { posts } = usePostStore();
  const savedPosts = posts.filter((post) => post.saved);

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
            <div className="flex items-center gap-3 border-b border-[#1f2937] pb-4">
              <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-400">
                <Bookmark size={20} className="fill-yellow-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Saved Posts</h1>
                <p className="text-xs text-slate-400">Your bookmarked and saved content</p>
              </div>
            </div>

            {savedPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 rounded-2xl border border-dashed border-[#1f2937] bg-[#111827]/30">
                <Bookmark size={40} className="text-slate-500" />
                <div>
                  <h3 className="font-semibold text-white">No bookmarked posts</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Save posts from your feed to access them quickly here anytime.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {savedPosts.map((post) => (
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
