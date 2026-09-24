import React, { useState } from "react";
import { Share2, Send, Link as LinkIcon, Check, Globe, MessageCircle, ExternalLink, Mail, MessageSquare } from "lucide-react";
import { shareService } from "@/services/shareService";
import { Dialog, Button } from "@/components/ui";
import { useChatStore } from "@/store/chatStore";
import { usePostStore } from "@/store/postStore";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId?: string;
  post?: { id: string; [key: string]: any };
  onShareSuccess?: () => void;
}

export default function ShareModal({ isOpen, onClose, postId, post, onShareSuccess }: ShareModalProps) {
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
    onShareSuccess?.();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const url = `${window.location.origin}/post/${targetPostId}`;
    const text = encodeURIComponent(`Check out this post: ${url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
    onShareSuccess?.();
  };

  const handleShareTwitter = () => {
    const url = `${window.location.origin}/post/${targetPostId}`;
    const text = encodeURIComponent(post?.content?.slice(0, 100) || "Check out this post");
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`, "_blank");
    onShareSuccess?.();
  };

  const handleShareLinkedIn = () => {
    const url = `${window.location.origin}/post/${targetPostId}`;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank");
    onShareSuccess?.();
  };

  const handleShareTelegram = () => {
    const url = `${window.location.origin}/post/${targetPostId}`;
    const text = encodeURIComponent(post?.content?.slice(0, 100) || "Check out this post");
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${text}`, "_blank");
    onShareSuccess?.();
  };

  const handleShareReddit = () => {
    const url = `${window.location.origin}/post/${targetPostId}`;
    const title = encodeURIComponent(post?.content?.slice(0, 80) || "Facebook Clone Post");
    window.open(`https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${title}`, "_blank");
    onShareSuccess?.();
  };

  const handleShareEmail = () => {
    const url = `${window.location.origin}/post/${targetPostId}`;
    const subject = encodeURIComponent("Check out this post");
    const body = encodeURIComponent(`Hey,\n\nCheck out this post on Facebook:\n${url}\n\n${post?.content || ""}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
    onShareSuccess?.();
  };

  const handleSendToChat = (convId: string) => {
    const linkUrl = `${window.location.origin}/post/${targetPostId}`;
    sendDirectMessage(convId, `Shared post: ${linkUrl}`);
    setShared(true);
    onShareSuccess?.();
    setTimeout(() => {
      setShared(false);
      onClose();
    }, 1200);
  };

  const createPost = usePostStore((state) => state.createPost);

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setSharing(true);

    try {
      await shareService.sharePost({ postId: targetPostId, caption });
    } catch (err) {
      console.warn("Backend share error, using optimistic local state:", err);
    }

    // Optimistically add shared post to feed timeline
    if (post) {
      createPost({
        author: {
          name: "You",
          username: "you",
          avatar: "https://images.unsplash.com/photo-1779040622687-42bb00790c67?w=500",
        },
        visibility: "public",
        type: "shared",
        content: caption || "Shared a post",
        sharedPost: {
          id: post.id,
          author: post.author || {
            name: "User",
            username: "user",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
          },
          content: post.content || "",
          createdAt: post.createdAt || "Recently",
        },
      });
    }

    setShared(true);
    setTimeout(() => {
      setShared(false);
      setCaption("");
      onClose();
    }, 1200);
    setSharing(false);
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
          {/* External Social Sharing */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold block">Share to Socials</label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#0f172a] border border-[#1f2937] hover:border-blue-500 text-slate-300 hover:text-white transition group cursor-pointer"
              >
                {copied ? (
                  <Check size={16} className="text-emerald-400 mb-1" />
                ) : (
                  <LinkIcon size={16} className="text-blue-400 mb-1 group-hover:scale-110 transition" />
                )}
                <span className="text-[10px] font-medium">{copied ? "Copied!" : "Copy Link"}</span>
              </button>

              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#0f172a] border border-[#1f2937] hover:border-emerald-500 text-slate-300 hover:text-white transition group cursor-pointer"
              >
                <MessageCircle size={16} className="text-emerald-400 mb-1 group-hover:scale-110 transition" />
                <span className="text-[10px] font-medium">WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleShareTwitter}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#0f172a] border border-[#1f2937] hover:border-sky-500 text-slate-300 hover:text-white transition group cursor-pointer"
              >
                <Globe size={16} className="text-sky-400 mb-1 group-hover:scale-110 transition" />
                <span className="text-[10px] font-medium">X / Twitter</span>
              </button>

              <button
                type="button"
                onClick={handleShareLinkedIn}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#0f172a] border border-[#1f2937] hover:border-blue-600 text-slate-300 hover:text-white transition group cursor-pointer"
              >
                <ExternalLink size={16} className="text-blue-400 mb-1 group-hover:scale-110 transition" />
                <span className="text-[10px] font-medium">LinkedIn</span>
              </button>

              <button
                type="button"
                onClick={handleShareTelegram}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#0f172a] border border-[#1f2937] hover:border-cyan-500 text-slate-300 hover:text-white transition group cursor-pointer"
              >
                <Send size={16} className="text-cyan-400 mb-1 group-hover:scale-110 transition" />
                <span className="text-[10px] font-medium">Telegram</span>
              </button>

              <button
                type="button"
                onClick={handleShareReddit}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#0f172a] border border-[#1f2937] hover:border-orange-500 text-slate-300 hover:text-white transition group cursor-pointer"
              >
                <Globe size={16} className="text-orange-400 mb-1 group-hover:scale-110 transition" />
                <span className="text-[10px] font-medium">Reddit</span>
              </button>

              <button
                type="button"
                onClick={handleShareEmail}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#0f172a] border border-[#1f2937] hover:border-violet-500 text-slate-300 hover:text-white transition group cursor-pointer"
              >
                <Mail size={16} className="text-violet-400 mb-1 group-hover:scale-110 transition" />
                <span className="text-[10px] font-medium">Email</span>
              </button>
            </div>
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
