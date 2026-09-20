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
              <div className="space-y-6">
                <PostCard post={post} defaultShowComments={true} />

                {/* Reaction Summary Breakdown */}
                {(() => {
                  const total = Object.values(post.reactions || {}).reduce((a, b) => a + b, 0);
                  const reactionItems = [
                    { key: "like", label: "Like", emoji: "👍", count: post.reactions?.like || 0, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
                    { key: "love", label: "Love", emoji: "❤️", count: post.reactions?.love || 0, color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
                    { key: "haha", label: "Haha", emoji: "😆", count: post.reactions?.haha || 0, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
                    { key: "wow", label: "Wow", emoji: "😮", count: post.reactions?.wow || 0, color: "text-amber-300 bg-amber-500/10 border-amber-500/20" },
                    { key: "sad", label: "Sad", emoji: "😢", count: post.reactions?.sad || 0, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
                    { key: "angry", label: "Angry", emoji: "😡", count: post.reactions?.angry || 0, color: "text-red-400 bg-red-500/10 border-red-500/20" },
                  ].filter((r) => r.count > 0);

                  if (reactionItems.length === 0) return null;

                  return (
                    <div className="p-4 rounded-2xl border border-[#1f2937] bg-[#111827]/60 backdrop-blur-sm space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-300 tracking-wide uppercase">
                          Reaction Breakdown ({total})
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {reactionItems.length} reaction type{reactionItems.length > 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {reactionItems.map((r) => (
                          <div
                            key={r.key}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${r.color}`}
                          >
                            <span className="text-sm">{r.emoji}</span>
                            <span>{r.label}</span>
                            <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-[10px]">
                              {r.count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Related Discussions Section */}
                {(() => {
                  const relatedPosts = posts
                    .filter(
                      (p) => p.id !== id && (p.author.username === post.author.username || p.type === post.type)
                    )
                    .slice(0, 3);

                  if (relatedPosts.length === 0) return null;

                  return (
                    <div className="pt-6 space-y-4 border-t border-[#1f2937]">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm text-white">Related Discussions</h3>
                        <Link href="/" className="text-xs text-blue-400 hover:underline">
                          View Feed
                        </Link>
                      </div>
                      <div className="space-y-4">
                        {relatedPosts.map((rp) => (
                          <PostCard key={rp.id} post={rp} defaultShowComments={false} />
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
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
