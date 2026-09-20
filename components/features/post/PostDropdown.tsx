import React, { useState } from "react";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Pin,
  Bookmark,
  EyeOff,
  AlertTriangle,
  Link as LinkIcon,
  Check,
  BarChart3,
  Bell,
  BellOff,
  ExternalLink,
  UserPlus,
  UserCheck,
  Copy,
} from "lucide-react";

interface Props {
  isSaved: boolean;
  isPinned: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onPin: () => void;
  onSave: () => void;
  onHide: () => void;
  onReport: () => void;
  onAnalytics?: () => void;
  isAuthor?: boolean;
  authorName?: string;
  isFollowingAuthor?: boolean;
  onFollowAuthor?: () => void;
  postContent?: string;
  postId: string;
}

export default function PostDropdown({
  isSaved,
  isPinned,
  onEdit,
  onDelete,
  onPin,
  onSave,
  onHide,
  onReport,
  onAnalytics,
  isAuthor = true,
  authorName,
  isFollowingAuthor = false,
  onFollowAuthor,
  postContent,
  postId,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const mockUrl = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(mockUrl);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setIsOpen(false);
    }, 1500);
  };

  const handleCopyText = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!postContent) return;
    navigator.clipboard.writeText(postContent);
    setCopiedText(true);
    setTimeout(() => {
      setCopiedText(false);
      setIsOpen(false);
    }, 1500);
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-slate-400 transition hover:text-white rounded-full p-1 hover:bg-[#1f2937]"
      >
        <MoreHorizontal size={20} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 z-50 rounded-xl border border-[#1f2937] bg-[#111827] p-1.5 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
            {isAuthor && (
              <>
                <button
                  onClick={() => {
                    onEdit();
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-[#1f2937] hover:text-white"
                >
                  <Pencil size={16} />
                  <span>Edit Post</span>
                </button>

                {onAnalytics && (
                  <button
                    onClick={() => {
                      onAnalytics();
                      setIsOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-[#1f2937] hover:text-white"
                  >
                    <BarChart3 size={16} className="text-blue-400" />
                    <span>View Analytics</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    onPin();
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-[#1f2937] ${
                    isPinned ? "text-blue-400 font-semibold" : "text-slate-300 hover:text-white"
                  }`}
                >
                  <Pin size={16} className={isPinned ? "fill-blue-500" : ""} />
                  <span>{isPinned ? "Unpin Post" : "Pin Post"}</span>
                </button>
              </>
            )}

            {!isAuthor && onFollowAuthor && (
              <button
                onClick={() => {
                  onFollowAuthor();
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-[#1f2937] hover:text-white"
              >
                {isFollowingAuthor ? (
                  <>
                    <UserCheck size={16} className="text-blue-400" />
                    <span>Unfollow {authorName ? authorName.split(" ")[0] : "Author"}</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={16} />
                    <span>Follow {authorName ? authorName.split(" ")[0] : "Author"}</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={() => {
                onSave();
                setIsOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-[#1f2937] ${
                isSaved ? "text-yellow-500 font-semibold" : "text-slate-300 hover:text-white"
              }`}
            >
              <Bookmark size={16} className={isSaved ? "fill-yellow-500" : ""} />
              <span>{isSaved ? "Unsave Post" : "Save Post"}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-[#1f2937] hover:text-white"
            >
              {copied ? (
                <>
                  <Check size={16} className="text-green-500" />
                  <span className="text-green-500">Copied!</span>
                </>
              ) : (
                <>
                  <LinkIcon size={16} />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            {postContent && (
              <button
                onClick={handleCopyText}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-[#1f2937] hover:text-white"
              >
                {copiedText ? (
                  <>
                    <Check size={16} className="text-green-500" />
                    <span className="text-green-500">Copied Text!</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    <span>Copy Post Text</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={() => {
                window.open(`/post/${postId}`, "_blank");
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-[#1f2937] hover:text-white"
            >
              <ExternalLink size={16} />
              <span>Open in New Tab</span>
            </button>

            <button
              onClick={handleToggleMute}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-[#1f2937] hover:text-white"
            >
              {isMuted ? (
                <>
                  <Bell size={16} className="text-blue-400" />
                  <span className="text-blue-400">Unmute Notifications</span>
                </>
              ) : (
                <>
                  <BellOff size={16} />
                  <span>Mute Notifications</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                onHide();
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-[#1f2937] hover:text-white"
            >
              <EyeOff size={16} />
              <span>Hide Post</span>
            </button>

            <button
              onClick={() => {
                onReport();
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-[#1f2937] hover:text-white"
            >
              <AlertTriangle size={16} />
              <span>Report Post</span>
            </button>

            {isAuthor && (
              <>
                <div className="my-1 border-t border-[#1f2937]" />

                <button
                  onClick={() => {
                    onDelete();
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-red-400 transition hover:bg-red-500/10"
                >
                  <Trash2 size={16} />
                  <span>Delete Post</span>
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
