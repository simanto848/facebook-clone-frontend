"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import PostCard from "@/components/features/post/PostCard";
import { usePostStore, mapBackendPostToPostType, PostType } from "@/store/postStore";
import { postService } from "@/services/postService";
import { ArrowLeft, MessageSquare, Loader2, Copy, Check, Share2, Compass } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

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
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchPostDetail = async () => {
      if (!existingPost) {
        setLoading(true);
      }
      setError(null);
      try {
        const res = await postService.getPost(id);
        const data = res?.data || res;
        if (data && isMounted) {
          const mapped = mapBackendPostToPostType(data);
          setPost(mapped);
        } else if (!existingPost && isMounted) {
          setError("Post not found");
        }
      } catch (err: any) {
        if (!existingPost && isMounted) {
          setError(err.message || "Failed to load post");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPostDetail();

    return () => {
      isMounted = false;
    };
  }, [id, existingPost]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.back()}
                  className="h-10 w-10 rounded-full border border-[#1f2937] bg-[#111827]/50 flex items-center justify-center text-slate-300 hover:text-white transition"
                  title="Go back"
                >
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <h1 className="text-xl font-bold">Post Details</h1>
                  <p className="text-xs text-slate-400">Discussion thread & replies</p>
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                leftIcon={copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                onClick={handleCopyLink}
              >
                {copied ? "Link Copied!" : "Copy Link"}
              </Button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-3 rounded-2xl border border-[#1f2937] bg-[#111827]/40">
                <Loader2 size={32} className="animate-spin text-blue-500" />
                <p className="text-xs text-slate-400">Loading post thread...</p>
              </div>
            ) : post ? (
              <PostCard post={post} defaultShowComments={true} />
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 rounded-2xl border border-dashed border-[#1f2937] bg-[#111827]/30">
                <MessageSquare size={40} className="text-slate-500" />
                <div>
                  <h3 className="font-semibold text-white">{error || "Post not found"}</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    This post may have been deleted by the author or does not exist.
                  </p>
                </div>
                <Link href="/explore">
                  <Button variant="primary" size="sm" leftIcon={<Compass size={14} />}>
                    Explore Discussions
                  </Button>
                </Link>
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
