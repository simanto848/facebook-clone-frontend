import React from "react";

export interface PostSkeletonProps {
  count?: number;
  className?: string;
}

export function PostSkeleton({ count = 1, className = "" }: PostSkeletonProps) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className={`rounded-2xl border border-[#1f2937] bg-[#111827] p-5 space-y-4 ${className}`}
        >
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-[#1f2937] animate-pulse shrink-0" />
            <div className="space-y-2">
              <div className="h-4 w-32 rounded-md bg-[#1f2937] animate-pulse" />
              <div className="h-3 w-20 rounded-md bg-[#1f2937] animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full rounded-md bg-[#1f2937] animate-pulse" />
            <div className="h-4 w-5/6 rounded-md bg-[#1f2937] animate-pulse" />
            <div className="h-4 w-2/3 rounded-md bg-[#1f2937] animate-pulse" />
          </div>
          <div className="h-48 w-full rounded-xl bg-[#1f2937] animate-pulse" />
          <div className="flex justify-between pt-2">
            <div className="h-8 w-20 rounded-lg bg-[#1f2937] animate-pulse" />
            <div className="h-8 w-20 rounded-lg bg-[#1f2937] animate-pulse" />
            <div className="h-8 w-20 rounded-lg bg-[#1f2937] animate-pulse" />
          </div>
        </div>
      ))}
    </>
  );
}

export default PostSkeleton;
