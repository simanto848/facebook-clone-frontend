"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import PostCard from "@/components/features/post/PostCard";
import ReactionBreakdown from "@/components/features/post/ReactionBreakdown";
import RelatedDiscussions from "@/components/features/post/RelatedDiscussions";
import { usePostStore, mapBackendPostToPostType, PostType } from "@/store/postStore";
import { postService } from "@/services/postService";
import { bookmarkService } from "@/services/bookmarkService";
import { ArrowLeft, MessageSquare, Loader2, Copy, Check, Share2, Compass, Bookmark, BookmarkCheck, Eye, Clock, Code2, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button, Dialog, Badge } from "@/components/ui";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PostDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  const { posts, toggleSavePost } = usePostStore();
  const existingPost = posts.find((p) => p.id === id);

  const [post, setPost] = useState<PostType | null>(existingPost || null);
  const [loading, setLoading] = useState(!existingPost);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);

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

  const isSaved = Boolean(post?.saved || existingPost?.saved);

  const handleToggleBookmark = async () => {
    const nextSaved = !isSaved;
    toggleSavePost(id);
    setPost((p) => (p ? { ...p, saved: nextSaved } : p));
    try {
      if (nextSaved) {
        await bookmarkService.createBookmark(id);
      } else {
        await bookmarkService.deleteBookmark(id);
      }
    } catch (err) {
      console.warn("Backend bookmark toggle error:", err);
    }
  };

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
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
              <span>/</span>
              <Link href="/" className="hover:text-blue-400 transition-colors">Feed</Link>
              <span>/</span>
              <span className="text-slate-200 truncate max-w-[200px]">
                {post ? `${post.author.name}'s Post` : "Post"}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.back()}
                  className="h-10 w-10 rounded-full border border-[#1f2937] bg-[#111827]/50 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
                  title="Go back"
                >
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold">Post Details</h1>
                    {post && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-400 border border-slate-700 font-mono">
                        <Clock size={10} />
                        {Math.max(1, Math.ceil((post.content?.split(/\s+/).length || 1) / 200))} min read
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">Discussion thread & replies</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={
                    isSaved ? (
                      <BookmarkCheck size={14} className="text-amber-400 fill-amber-400" />
                    ) : (
                      <Bookmark size={14} />
                    )
                  }
                  onClick={handleToggleBookmark}
                  className="border border-[#1f2937]"
                >
                  {isSaved ? "Saved" : "Save Post"}
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Share2 size={14} />}
                  onClick={() => setIsShareModalOpen(true)}
                  className="border border-[#1f2937]"
                >
                  Share
                </Button>
              </div>
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
                <ReactionBreakdown reactions={post.reactions} />

                {/* Related Discussions Section */}
                <RelatedDiscussions
                  posts={posts}
                  currentPostId={id}
                  authorUsername={post.author?.username}
                  postType={post.type}
                  limit={3}
                />
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

      {/* SHARE MODAL DIALOG */}
      <Dialog
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title="Share Post"
        description="Share this post with your network or copy the link directly."
      >
        <div className="space-y-4 pt-2">
          {/* Quick Copy Link Box */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Direct Link</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={typeof window !== "undefined" ? window.location.href : ""}
                className="flex-1 bg-[#0f172a] border border-[#1f2937] rounded-xl px-3 py-2 text-xs text-slate-300 font-mono select-all outline-none"
              />
              <Button
                size="sm"
                variant="primary"
                leftIcon={copied ? <Check size={14} /> : <Copy size={14} />}
                onClick={handleCopyLink}
              >
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="space-y-2 pt-2 border-t border-[#1f2937]">
            <span className="text-xs font-semibold text-slate-300 block">Share to Social</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    const text = encodeURIComponent(post?.content?.slice(0, 100) || "Check out this post");
                    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(window.location.href)}`, "_blank");
                  }
                }}
                className="p-2.5 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] border border-[#1f2937] text-xs font-semibold text-white flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <span>X / Twitter</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, "_blank");
                  }
                }}
                className="p-2.5 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] border border-[#1f2937] text-xs font-semibold text-blue-400 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <span>LinkedIn</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, "_blank");
                  }
                }}
                className="p-2.5 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] border border-[#1f2937] text-xs font-semibold text-blue-500 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <span>Facebook</span>
              </button>
            </div>
          </div>

          {/* Embed Code Snippet */}
          <div className="space-y-1.5 pt-2 border-t border-[#1f2937]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Code2 size={13} className="text-purple-400" /> Embed Post
              </span>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    const snippet = `<iframe src="${window.location.href}" width="500" height="400" frameborder="0"></iframe>`;
                    navigator.clipboard.writeText(snippet);
                    setEmbedCopied(true);
                    setTimeout(() => setEmbedCopied(false), 2000);
                  }
                }}
                className="text-[11px] text-purple-400 hover:text-purple-300 font-medium cursor-pointer"
              >
                {embedCopied ? "Snippet Copied!" : "Copy Embed Code"}
              </button>
            </div>
            <textarea
              readOnly
              rows={2}
              value={typeof window !== "undefined" ? `<iframe src="${window.location.href}" width="500" height="400" frameborder="0"></iframe>` : ""}
              className="w-full bg-[#0f172a] border border-[#1f2937] rounded-xl p-2 text-[11px] text-slate-400 font-mono resize-none select-all outline-none"
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
