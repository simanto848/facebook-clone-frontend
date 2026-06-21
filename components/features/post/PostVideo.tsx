import React from "react";
import { Play, Eye, Clock } from "lucide-react";

interface Props {
  url: string;
  duration?: string;
  views?: number;
}

export default function PostVideo({ url, duration, views }: Props) {
  return (
    <div className="relative mt-4 overflow-hidden rounded-2xl border border-[#1f2937] bg-black">
      {/* Video element */}
      <video
        src={url}
        controls
        playsInline
        className="w-full max-h-[480px] object-contain mx-auto"
      />

      {/* Info Stats Header Overlay */}
      {(views !== undefined || duration !== undefined) && (
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 pointer-events-none">
          {views !== undefined && (
            <div className="flex items-center gap-1 bg-black/60 backdrop-blur-xs text-[11px] font-semibold text-white px-2.5 py-1 rounded-full">
              <Eye size={12} />
              <span>{views.toLocaleString()} views</span>
            </div>
          )}

          {duration && (
            <div className="flex items-center gap-1 bg-black/60 backdrop-blur-xs text-[11px] font-semibold text-white px-2.5 py-1 rounded-full">
              <Clock size={12} />
              <span>{duration}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
