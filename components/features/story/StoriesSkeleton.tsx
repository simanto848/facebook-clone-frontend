import React from "react";

export interface StoriesSkeletonProps {
  count?: number;
  className?: string;
}

export function StoriesSkeleton({ count = 6, className = "" }: StoriesSkeletonProps) {
  return (
    <div className={`flex gap-4 overflow-x-auto pb-2 no-scrollbar ${className}`}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex flex-col items-center shrink-0 space-y-2">
          <div className="h-16 w-16 rounded-full bg-[#1f2937]/60 animate-pulse border-2 border-slate-700/30" />
          <div className="h-2.5 w-12 rounded-md bg-[#1f2937]/60 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export default StoriesSkeleton;
