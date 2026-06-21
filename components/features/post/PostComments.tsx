import React, { useState } from "react";
import Image from "next/image";
import { Send } from "lucide-react";
import { usePostStore, CommentType } from "@/store/postStore";
import CommentItem from "./CommentItem";

interface Props {
  postId: string;
  comments: CommentType[];
}

export default function PostComments({ postId, comments }: Props) {
  const { addComment, addReplyToComment, toggleLikeComment, editComment, deleteComment } =
    usePostStore();
  const [commentText, setCommentText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(postId, commentText);
    setCommentText("");
  };

  const handleReply = (commentId: string, replyText: string) => {
    addReplyToComment(postId, commentId, replyText);
  };

  const handleLike = (commentId: string) => {
    toggleLikeComment(postId, commentId);
  };

  const handleEdit = (commentId: string, newText: string) => {
    editComment(postId, commentId, newText);
  };

  const handleDelete = (commentId: string) => {
    deleteComment(postId, commentId);
  };

  return (
    <div className="border-t border-[#1f2937] bg-[#111827]/30 px-5 py-4">
      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="relative h-9 w-9 overflow-hidden rounded-full shrink-0 border border-[#1f2937]">
          <Image
            src="https://images.unsplash.com/photo-1779040622687-42bb00790c67?w=100"
            alt="Alex Morgan"
            fill
            className="object-cover"
          />
        </div>

        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full rounded-full border border-[#1f2937] bg-[#0f172a] px-4 py-2 pr-10 text-xs text-white outline-none placeholder:text-slate-400 focus:border-blue-500 transition"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition"
          >
            <Send size={14} />
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="mt-4 space-y-4 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
        {comments.length === 0 ? (
          <p className="text-center text-xs text-slate-500 py-3">No comments yet. Start the conversation!</p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onLike={handleLike}
              onReply={handleReply}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
