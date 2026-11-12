import React from "react";
import Image from "next/image";
import Link from "next/link";
import { PostType } from "@/store/postStore";

export interface MediaGridProps {
  posts: PostType[];
  emptyMessage?: string;
  emptyTitle?: string;
  className?: string;
}

export function MediaGrid({ posts, className = "" }: MediaGridProps) {
  if (posts.length === 0) return null;

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 gap-3 ${className}`}>
      {posts.map((post) => {
        const mediaUrl =
          post.images?.[0] ||
          (typeof post.video === "string" ? post.video : post.video?.url) ||
          (post as any).image ||
          "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600";
        const isVideo = Boolean(post.video) || post.type === "video";
        const imageCount = post.images?.length || 0;

        return (
          <Link
            key={post.id}
            href={`/post/${post.id}`}
            className="group relative aspect-square rounded-xl overflow-hidden bg-[#111827] border border-[#1f2937] hover:border-blue-500/50 transition cursor-pointer"
          >
            <Image
              src={mediaUrl}
              alt={post.content ? post.content.slice(0, 30) : "Media"}
              fill
              sizes="(max-width: 640px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-3">
              <p className="text-[11px] text-white font-medium line-clamp-2">
                {post.content || "View post"}
              </p>
            </div>
            {isVideo && (
              <span className="absolute top-2 right-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                ▶ Video
              </span>
            )}
            {imageCount > 1 && (
              <span className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                +{imageCount}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

export default MediaGrid;
