import React from "react";
import { PostType } from "@/store/postStore";
import PostCard from "@/components/features/post/PostCard";

export interface RelatedDiscussionsProps {
  posts: PostType[];
  currentPostId: string;
  authorUsername?: string;
  postType?: string;
  limit?: number;
  className?: string;
  feedHref?: string;
  feedLabel?: string;
  title?: string;
}

export function RelatedDiscussions({
  posts,
  currentPostId,
  authorUsername,
  postType,
  limit = 3,
  className = "",
  feedHref = "/",
  feedLabel = "View Feed",
  title = "Related Discussions",
}: RelatedDiscussionsProps) {
  const relatedPosts = React.useMemo(() => {
    return posts
      .filter((p) => {
        if (p.id === currentPostId) return false;
        if (authorUsername && p.author?.username === authorUsername) return true;
        if (postType && p.type === postType) return true;
        return false;
      })
      .slice(0, limit);
  }, [posts, currentPostId, authorUsername, postType, limit]);

  if (relatedPosts.length === 0) return null;

  return (
    <div className={`pt-6 space-y-4 border-t border-[#1f2937] ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm text-white">{title}</h3>
        {feedHref && (
          <a href={feedHref} className="text-xs text-blue-400 hover:underline">
            {feedLabel}
          </a>
        )}
      </div>
      <div className="space-y-4">
        {relatedPosts.map((rp) => (
          <PostCard key={rp.id} post={rp} defaultShowComments={false} />
        ))}
      </div>
    </div>
  );
}

export default RelatedDiscussions;
