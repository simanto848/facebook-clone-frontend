"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import FeedLayoutWrapper from "@/components/layout/FeedLayoutWrapper";
import PostCard from "@/components/features/post/PostCard";
import ReactionBreakdown from "@/components/features/post/ReactionBreakdown";
import RelatedDiscussions from "@/components/features/post/RelatedDiscussions";
import ReadingTimeBadge from "@/components/features/post/ReadingTimeBadge";
import { usePostStore, mapBackendPostToPostType, PostType } from "@/store/postStore";
import { postService } from "@/services/postService";
import { bookmarkService } from "@/services/bookmarkService";
import { MessageSquare, Loader2, Share2, Compass, Bookmark, BookmarkCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button, BreadcrumbNav, DetailPageHeader } from "@/components/ui";
import ShareModal from "@/components/features/post/ShareModal";

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
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

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

  return (
    <FeedLayoutWrapper>
      {/* Breadcrumb Navigation */}
      <BreadcrumbNav
        items={[
          { label: "Home", href: "/" },
          { label: "Feed", href: "/" },
          { label: post ? `${post.author.name}'s Post` : "Post" },
        ]}
      />

      <DetailPageHeader
        title="Post Details"
        subtitle="Discussion thread & replies"
        badge={post ? <ReadingTimeBadge content={post.content} /> : undefined}
        actions={
          <>
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
          </>
        }
      />

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

        {/* REUSABLE SHARE MODAL */}
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          postId={id}
          post={post || undefined}
        />
    </FeedLayoutWrapper>
  );
}
