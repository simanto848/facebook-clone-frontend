import React, { useState } from "react";
import { X, Rss, Tv, MessageSquare, Link, Check } from "lucide-react";
import { usePostStore, PostType } from "@/store/postStore";

interface Props {
  post: PostType;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareModal({ post, isOpen, onClose }: Props) {
  const { createPost, addStory } = usePostStore();
  const [copied, setCopied] = useState(false);
  const [sharedText, setSharedText] = useState("");
  const [shareStep, setShareStep] = useState<"select" | "feed">("select");

  if (!isOpen) return null;

  const handleCopyLink = () => {
    const mockUrl = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(mockUrl);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      onClose();
    }, 1500);
  };

  const handleShareToFeed = () => {
    createPost({
      author: {
        name: "Alex Morgan",
        username: "alex",
        avatar: "https://images.unsplash.com/photo-1779040622687-42bb00790c67?w=500",
      },
      visibility: "public",
      type: "shared",
      content: sharedText || "Shared this post",
      sharedPost: {
        id: post.id,
        author: post.author,
        content: post.content,
        createdAt: post.createdAt,
      },
    });
    onClose();
  };

  const handleShareToStory = () => {
    addStory({
      author: {
        name: "Alex Morgan",
        avatar: "https://images.unsplash.com/photo-1779040622687-42bb00790c67?w=500",
      },
      type: "text",
      content: `Recommended post: "${post.content.substring(0, 40)}..."`,
    });
    alert("Shared to your Story!");
    onClose();
  };

  const handleShareToMessage = () => {
    alert("Shared to Messages!");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Box */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-[#1f2937] bg-[#111827] p-6 shadow-2xl text-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold">Share Post</h3>
          <button onClick={onClose} className="rounded-full p-1 text-slate-400 hover:bg-[#1f2937] hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        {shareStep === "select" ? (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setShareStep("feed")}
              className="flex flex-col items-center gap-3 rounded-xl border border-[#1f2937] bg-[#111827]/40 p-4 transition hover:bg-[#1f2937]"
            >
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Rss size={20} />
              </div>
              <span className="text-sm font-semibold">Feed</span>
            </button>

            <button
              onClick={handleShareToStory}
              className="flex flex-col items-center gap-3 rounded-xl border border-[#1f2937] bg-[#111827]/40 p-4 transition hover:bg-[#1f2937]"
            >
              <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Tv size={20} />
              </div>
              <span className="text-sm font-semibold">Story</span>
            </button>

            <button
              onClick={handleShareToMessage}
              className="flex flex-col items-center gap-3 rounded-xl border border-[#1f2937] bg-[#111827]/40 p-4 transition hover:bg-[#1f2937]"
            >
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
                <MessageSquare size={20} />
              </div>
              <span className="text-sm font-semibold">Message</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="flex flex-col items-center gap-3 rounded-xl border border-[#1f2937] bg-[#111827]/40 p-4 transition hover:bg-[#1f2937]"
            >
              <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-400">
                {copied ? <Check size={20} /> : <Link size={20} />}
              </div>
              <span className="text-sm font-semibold">{copied ? "Copied!" : "Copy Link"}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <textarea
              value={sharedText}
              onChange={(e) => setSharedText(e.target.value)}
              placeholder="Say something about this post..."
              className="w-full h-24 rounded-xl border border-[#1f2937] bg-[#0f172a] p-3 text-sm text-white outline-none resize-none placeholder:text-slate-400 focus:border-blue-500"
            />

            {/* Original post preview */}
            <div className="rounded-xl border border-[#1f2937] bg-[#0f172a]/50 p-3 text-xs text-slate-300">
              <span className="font-semibold text-white">{post.author.name}</span>
              <p className="mt-1 line-clamp-2">{post.content}</p>
            </div>

            <div className="flex gap-3 justify-end mt-4">
              <button
                onClick={() => setShareStep("select")}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-[#1f2937] rounded-xl transition"
              >
                Back
              </button>
              <button
                onClick={handleShareToFeed}
                className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 rounded-xl transition"
              >
                Share Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
