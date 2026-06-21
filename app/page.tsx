"use client";

import CreatePost from "@/components/features/post/CreatePost";
import PostCard from "@/components/features/post/PostCard";
import FeedFilter from "@/components/features/post/FeedFilter";
import Stories from "@/components/features/story/Stories";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import { usePostStore } from "@/store/postStore";

export default function Home() {
  const { posts, filter, setFilter } = usePostStore();

  const getFilteredPosts = () => {
    let list = [...posts];

    if (filter === "popular") {
      // Sort by sum of reactions
      list.sort((a, b) => {
        const sumA = Object.values(a.reactions).reduce((x, y) => x + y, 0);
        const sumB = Object.values(b.reactions).reduce((x, y) => x + y, 0);
        return sumB - sumA;
      });
    } else if (filter === "trending") {
      // Sort by comment count
      list.sort((a, b) => b.comments.length - a.comments.length);
    } else if (filter === "following") {
      // Show posts from users other than the logged-in user ('alex')
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
            <Stories />
            <CreatePost />
            <FeedFilter value={filter} onChange={setFilter} />

            <div className="space-y-6">
              {filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
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
