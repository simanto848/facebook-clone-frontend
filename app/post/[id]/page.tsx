"use client";

import React, { use, useState, useEffect } from "react";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import PostCard from "@/components/features/post/PostCard";
import { usePostStore, mapBackendPostToPostType, PostType } from "@/store/postStore";
import { postService } from "@/services/postService";
import { ArrowLeft, MessageSquare, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PostDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  const { posts } = usePostStore();
  const existingPost = posts.find((p) => p.id === id);

  const [post, setPost] = useState<PostType | null>(existingPost || null);
  const [loading, setLoading] = useState(!existingPost);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingPost) {
      setPost(existingPost);
      return;
    }

    const fetchPostDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await postService.getPost(id);
        const data = res?.data || res;
        if (data) {
          const mapped = mapBackendPostToPostType(data);
          setPost(mapped);
        } else {
          setError("Post not found");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load post");
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetail();
  }, [id, existingPost]);

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
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="h-10 w-10 rounded-full border border-[#1f2937] bg-[#111827]/50 flex items-center justify-center text-slate-300 hover:text-white transition"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h1 className="text-xl font-bold">Post Details</h1>
                <p className="text-xs text-slate-400">View thread and comments</p>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-3 rounded-2xl border border-[#1f2937] bg-[#111827]/40">
                <Loader2 size={32} className="animate-spin text-blue-500" />
                <p className="text-xs text-slate-400">Loading post thread...</p>
              </div>
            ) : post ? (
              <PostCard post={post} />
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 rounded-2xl border border-dashed border-[#1f2937] bg-[#111827]/30">
                <MessageSquare size={40} className="text-slate-500" />
                <div>
                  <h3 className="font-semibold text-white">{error || "Post not found"}</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    This post may have been deleted by the author or does not exist.
                  </p>
                </div>
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
