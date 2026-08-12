"use client";

import React, { useState } from "react";
import { Share2, X, Send } from "lucide-react";
import { shareService } from "@/services/shareService";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
}

export default function ShareModal({ isOpen, onClose, postId }: ShareModalProps) {
  const [caption, setCaption] = useState("");
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState(false);

  if (!isOpen) return null;

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setSharing(true);

    try {
      await shareService.sharePost(postId, caption);
      setShared(true);
      setTimeout(() => {
        setShared(false);
        setCaption("");
        onClose();
      }, 1200);
    } catch (err) {
      console.error("Share post error:", err);
      onClose();
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-xs" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-[#1f2937] bg-[#111827] p-6 text-white shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#1f2937] pb-3">
          <div className="flex items-center gap-2 text-blue-400">
            <Share2 size={20} />
            <h3 className="font-bold text-base text-white">Share Post to Feed</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-[#1f2937]">
            <X size={18} />
          </button>
        </div>

        {shared ? (
          <div className="py-8 text-center space-y-2">
            <Send size={32} className="mx-auto text-blue-400" />
            <h4 className="font-bold text-sm text-white">Post Shared to Timeline!</h4>
          </div>
        ) : (
          <form onSubmit={handleShare} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Add thoughts (Optional)</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Say something about this post..."
                className="w-full h-24 rounded-xl border border-[#1f2937] bg-[#0f172a] p-3 outline-none resize-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={sharing}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-lg shadow-blue-600/10"
            >
              {sharing ? "Sharing..." : "Share Now"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
