import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Avatar } from "@/components/ui";
import { PostType } from "@/store/postStore";

export interface PostGridCardProps {
  post: PostType;
  className?: string;
}

export function PostGridCard({ post, className = "" }: PostGridCardProps) {
  const mediaUrl =
    post.images?.[0] ||
    (post.video
      ? typeof post.video === "string"
        ? post.video
        : post.video.url
      : (post as any).image);

  const totalLikes = post.reactions
    ? Object.values(post.reactions).reduce(
        (sum, val) => sum + (typeof val === "number" ? val : 0),
        0
      )
    : 0;

  return (
    <div
      className={`bg-[#111827] border border-[#1f2937] hover:border-slate-700 rounded-2xl overflow-hidden shadow-xl transition flex flex-col justify-between group ${className}`}
    >
      <div>
        {mediaUrl && (
          <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
            <Image
              src={mediaUrl}
              alt="Post media"
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover group-hover:scale-105 transition duration-300"
            />
          </div>
        )}
        <div className="p-4 space-y-2.5">
          <div className="flex items-center gap-2">
            <Avatar
              src={post.author?.avatar}
              name={post.author?.name || post.author?.username || "User"}
              size="xs"
            />
            <span className="text-xs font-semibold text-slate-200 truncate">
              {post.author?.name || post.author?.username}
            </span>
            <span className="text-[10px] text-slate-500 ml-auto">
              {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ""}
            </span>
          </div>
          <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
            {post.content || "Media attachment"}
          </p>
        </div>
      </div>
      <div className="px-4 py-3 bg-[#0d131f]/80 border-t border-[#1f2937] flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <Heart size={13} className="text-rose-400" />
          <span>{totalLikes}</span>
        </span>
        <Link
          href={`/post/${post.id}`}
          className="text-blue-400 hover:text-blue-300 font-semibold transition"
        >
          View post →
        </Link>
      </div>
    </div>
  );
}

export default PostGridCard;
