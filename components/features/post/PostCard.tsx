import { Heart, MessageSquare, MoreHorizontal, Share2 } from "lucide-react";
import Image from "next/image";
import React from "react";

const PostCard = () => {
  return (
    <article className="overflow-hidden rounded-2xl border border-[#1f2937] bg-[#111827]">
      {/* Header */}
      <div className="flex items-center justify-between p-5">
        <div className="flex items-center gap-3">
          {/* Profile Image */}
          <div className="relative h-12 w-12 overflow-hidden rounded-full">
            <Image
              src="https://images.unsplash.com/photo-1780764895105-ea3037466236?q=80&w=1170&auto=format&fit=crop"
              alt="David Kim"
              fill
              className="object-cover"
            />
          </div>

          <div>
            <h2 className="font-semibold text-white">David Kim</h2>

            <p className="text-sm text-slate-400">5 hours ago</p>
          </div>
        </div>

        <button className="text-slate-400 transition hover:text-white">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="px-5">
        <p className="text-lg text-slate-200">
          Neon nights in the city. The contrast is unbelievable.
        </p>
      </div>

      {/* Post Image */}
      <div className="relative mt-5 h-[420px] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1778192391493-7436d746b128?w=1200&auto=format&fit=crop"
          alt="Post"
          fill
          className="object-cover"
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-[#1f2937] p-5 text-slate-400">
        <button className="flex items-center gap-2 transition hover:text-red-400">
          <Heart size={20} />
          <span>1.2k</span>
        </button>

        <button className="flex items-center gap-2 transition hover:text-blue-400">
          <MessageSquare size={20} />
          <span>89</span>
        </button>

        <button className="transition hover:text-white">
          <Share2 size={20} />
        </button>
      </div>
    </article>
  );
};

export default PostCard;
