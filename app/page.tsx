import CreatePost from "@/components/features/post/CreatePost";
import PostCard from "@/components/features/post/PostCard";
import Stories from "@/components/features/story/Stories";
import LeftSidebar from "@/components/layout/LeftSidebar";

export default function Home() {
  return (
    <div className="flex min-h-screen">
      {/* LEFT SIDEBAR */}
      <div className="sticky top-0 h-screen shrink-0 overflow-y-auto">
        <LeftSidebar />
      </div>

      {/* MAIN CONTENT */}
      <section className="flex-1 max-w-3xl py-6 px-4">
        <main>
          {/* STORY SECTION */}
          <Stories />

          {/* CREATE POST SECTION */}
          <CreatePost />

          {/* POSTS SECTION (FEED) */}
          <PostCard />
        </main>
      </section>

      {/* RIGHT SIDEBAR */}
      <section className="flex-shrink-0"></section>
    </div>
  );
}
