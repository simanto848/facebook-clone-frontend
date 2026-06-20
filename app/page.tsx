import CreatePost from "@/components/features/post/CreatePost";
import PostCard from "@/components/features/post/PostCard";
import Stories from "@/components/features/story/Stories";
import LeftSidebar from "@/components/layout/LeftSidebar";

export default function Home() {
  return (
    <>
      {/* LEFT SIDEBAR */}
      <LeftSidebar />

      {/* MAIN CONTENT */}
      <section className="max-w-3xl mx-auto">
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
      <section></section>
    </>
  );
}
