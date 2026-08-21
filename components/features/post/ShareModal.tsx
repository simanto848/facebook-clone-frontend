import React, { useState } from "react";
import { Share2, Send, Link as LinkIcon, Check } from "lucide-react";
import { shareService } from "@/services/shareService";
import { Dialog, Button } from "@/components/ui";
import { useChatStore } from "@/store/chatStore";

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
  const [copied, setCopied] = useState(false);
  const { conversations, sendDirectMessage } = useChatStore();

  const targetPostId = postId || post?.id || "";

  const handleCopyLink = () => {
    const url = `${window.location.origin}/post/${targetPostId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToChat = (convId: string) => {
    const linkUrl = `${window.location.origin}/post/${targetPostId}`;
    sendDirectMessage(convId, `Shared post: ${linkUrl}`);
    setShared(true);
    setTimeout(() => {
      setShared(false);
      onClose();
    }, 1200);
  };

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
          <span className="text-white font-bold">Share Post</span>
        </div>
      }
    >
      {shared ? (
        <div className="py-8 text-center space-y-2">
          <Send size={32} className="mx-auto text-blue-400" />
          <h4 className="font-bold text-sm text-white">Post Shared Successfully!</h4>
        </div>
      ) : (
        <div className="space-y-4 text-xs">
          <div className="flex gap-2">
            <Button
              variant={copied ? "success" : "secondary"}
              fullWidth
              size="sm"
              leftIcon={copied ? <Check size={14} /> : <LinkIcon size={14} />}
              onClick={handleCopyLink}
            >
              {copied ? "Link Copied!" : "Copy Post Link"}
            </Button>
          </div>

          {conversations.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-[#1f2937]">
              <label className="text-slate-300 font-semibold block">Send in Direct Message</label>
              <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                {conversations.slice(0, 5).map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleSendToChat(conv.id)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0f172a] border border-[#1f2937] hover:border-blue-500 text-xs text-white shrink-0 cursor-pointer transition"
                  >
                    <span>{conv.name}</span>
                    <Send size={12} className="text-blue-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleShare} className="space-y-3 pt-2 border-t border-[#1f2937]">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block">Share to Feed Timeline</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Say something about this post..."
                className="w-full h-20 rounded-xl border border-[#374151] bg-[#0f172a] p-3 text-xs text-white outline-none resize-none focus:border-blue-500 transition"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={sharing}
            >
              Share to Timeline
            </Button>
          </form>
        </div>
      )}
    </Dialog>
  );
}
