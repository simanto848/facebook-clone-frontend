"use client";

import React, { useEffect, useState } from "react";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import PostCard from "@/components/features/post/PostCard";
import { Bookmark } from "lucide-react";
import { bookmarkService } from "@/services/bookmarkService";
import { PageHeader, Badge, EmptyState, Loader } from "@/components/ui";

export default function SavedPostsPage() {
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const res = await bookmarkService.getUserBookmarks();
      const items = res.data || res || [];
      const posts = items.map((b: any) => (b.post ? { ...b.post, bookmarkId: b.id, saved: true } : { ...b, saved: true }));
      setSavedPosts(posts);
    } catch (err) {
      console.error("Error fetching bookmarks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

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
              title="Saved Posts"
              description="Access your bookmarked articles, discussions, and saved timeline posts."
              icon={<Bookmark size={22} className="fill-yellow-400 text-yellow-400" />}
              badge={<Badge variant="warning">{savedPosts.length} Saved</Badge>}
            />

            {loading ? (
              <div className="py-16 text-center">
                <Loader label="Loading bookmarked posts..." />
              </div>
            ) : savedPosts.length === 0 ? (
              <EmptyState
                icon={<Bookmark size={36} className="text-yellow-400 fill-yellow-400/20" />}
                title="No bookmarked posts"
                description="Save posts from your main feed or community channels to access them quickly anytime."
              />
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
