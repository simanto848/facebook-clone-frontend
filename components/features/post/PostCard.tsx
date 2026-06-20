import { Heart, MessageSquare, MoreHorizontal, Share2 } from "lucide-react";
import Image from "next/image";
import React from "react";

const PostCard = () => {
  return (
    <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="https://images.unsplash.com/photo-1780764895105-ea3037466236?q=80&w=1170&auto=format&fit=crop"
            alt="David Kim"
            width={48}
            height={48}
            className="rounded-full object-cover"
          />

          <div>
            <h2 className="font-bold text-white">David Kim</h2>
            <p className="text-sm text-slate-400">5 hours ago</p>
          </div>
        </div>

        <button className="text-slate-400 hover:text-white">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="mt-5">
        <p className="text-slate-200 text-lg">
          Neon nights in the city. The contrast is unbelievable.
        </p>
      </div>

      {/* Post Image */}
      <div className="mt-5 overflow-hidden rounded-xl">
        <Image
          src="https://images.unsplash.com/photo-1778192391493-7436d746b128?w=1200&auto=format&fit=crop"
          alt="Post"
          width={1200}
          height={800}
          className="w-full h-100 object-cover"
        />
      </div>

      {/* Footer */}
      <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-slate-400">
        <button className="flex items-center gap-2 hover:text-white transition">
          <Heart size={20} />
          <span>1.2k</span>
        </button>

        <button className="flex items-center gap-2 hover:text-white transition">
          <MessageSquare size={20} />
          <span>89</span>
        </button>

        <button className="hover:text-white transition">
          <Share2 size={20} />
        </button>
      </div>
    </div>
  );
};

export default PostCard;
