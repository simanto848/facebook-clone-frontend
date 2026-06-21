import React, { useState } from "react";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Pin,
  Bookmark,
  EyeOff,
  AlertTriangle,
  Link,
  Check,
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
  postId,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

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
                  <Link size={16} />
                  <span>Copy Link</span>
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
          </div>
        </>
      )}
    </div>
  );
}
