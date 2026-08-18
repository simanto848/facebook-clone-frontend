"use client";

import React, { useState } from "react";
import { Share2, Send } from "lucide-react";
import { shareService } from "@/services/shareService";
import { Dialog, Button } from "@/components/ui";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId?: string;
  post?: { id: string; [key: string]: any };
}

export default function ShareModal({ isOpen, onClose, postId, post }: ShareModalProps) {
  const [caption, setCaption] = useState("");
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState(false);

  const targetPostId = postId || post?.id || "";

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setSharing(true);

    try {
      await shareService.sharePost({ postId: targetPostId, caption });
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
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-blue-400">
          <Share2 size={20} />
          <span className="text-white font-bold">Share Post to Feed</span>
        </div>
      }
    >
      {shared ? (
        <div className="py-8 text-center space-y-2">
          <Send size={32} className="mx-auto text-blue-400" />
          <h4 className="font-bold text-sm text-white">Post Shared to Timeline!</h4>
        </div>
      ) : (
        <form onSubmit={handleShare} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold block">Add thoughts (Optional)</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Say something about this post..."
              className="w-full h-24 rounded-xl border border-[#374151] bg-[#0f172a] p-3 text-xs text-white outline-none resize-none focus:border-blue-500 transition"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={sharing}
          >
            Share Now
          </Button>
        </form>
      )}
    </Dialog>
  );
}
