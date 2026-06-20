import CreatePost from "@/components/features/post/CreatePost";
import PostCard from "@/components/features/post/PostCard";
import Stories from "@/components/features/story/Stories";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* PAGE CONTENT */}
      <div className="flex">
        {/* LEFT SIDEBAR */}
        <aside className="w-72 shrink-0">
          <LeftSidebar />
        </aside>

        {/* MAIN FEED */}
        <main className="flex-1 flex justify-center">
          <div className="w-full max-w-3xl px-6 py-6 space-y-6">
            <Stories />
            <CreatePost />
            <PostCard />
          </div>
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="w-80 shrink-0">
          <RightSidebar />
        </aside>
      </div>
    </div>
  );
}
