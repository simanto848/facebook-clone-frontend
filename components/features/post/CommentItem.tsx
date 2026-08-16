"use client";

import React, { useState } from "react";
import { Heart, MessageSquare, Check, CornerDownRight, Trash2, Edit2 } from "lucide-react";
import { CommentType } from "@/store/postStore";
import { Avatar, Button, Input } from "@/components/ui";

interface Props {
  comment: CommentType;
  onLike: (id: string) => void;
  onReply: (id: string, text: string) => void;
  onEdit: (id: string, newText: string) => void;
  onDelete: (id: string) => void;
}

export default function CommentItem({ comment, onLike, onReply, onEdit, onDelete }: Props) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [editText, setEditText] = useState(comment.content);

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onReply(comment.id, replyText);
    setReplyText("");
    setIsReplying(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editText.trim()) return;
    onEdit(comment.id, editText);
    setIsEditing(false);
  };

  return (
    <div className="group/item relative mt-4 select-none">
      {/* Connector Line for nested comments */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="absolute left-5 top-12 bottom-4 w-0.5 bg-[#1f2937]" />
      )}

      <div className="flex gap-3">
        <Avatar src={comment.author.avatar} name={comment.author.name} size="md" />

        {/* Comment Bubble Content */}
        <div className="flex-1">
          <div className="rounded-2xl bg-[#0f172a]/60 px-4 py-3 border border-[#1f2937]">
            <div className="flex justify-between items-center">
              <h5 className="text-xs font-bold text-white">{comment.author.name}</h5>
              <span className="text-[10px] text-slate-500">{comment.createdAt}</span>
            </div>

            {isEditing ? (
              <form onSubmit={handleEditSubmit} className="mt-2 flex gap-2">
                <Input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="h-8 text-xs bg-[#111827]"
                  autoFocus
                />
                <Button variant="primary" size="sm" type="submit" className="h-8 px-2.5">
                  <Check size={14} />
                </Button>
              </form>
            ) : (
              <p className="mt-1 text-xs text-slate-300 leading-relaxed">{comment.content}</p>
            )}
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-4 mt-1.5 px-2 text-[11px] text-slate-400">
            <button
              onClick={() => onLike(comment.id)}
              className={`flex items-center gap-1 transition ${
                comment.userLiked ? "text-red-400 font-bold" : "hover:text-red-400"
              }`}
            >
              <Heart size={12} className={comment.userLiked ? "fill-red-400" : ""} />
              <span>{comment.likes}</span>
            </button>

            <button
              onClick={() => setIsReplying(!isReplying)}
              className="flex items-center gap-1 hover:text-blue-400 transition"
            >
              <MessageSquare size={12} />
              <span>Reply</span>
            </button>

            {comment.author.username === "alex" && (
              <>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="hover:text-yellow-400 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(comment.id)}
                  className="hover:text-red-400 transition"
                >
                  Delete
                </button>
              </>
            )}
          </div>

          {/* Reply Form */}
          {isReplying && (
            <form onSubmit={handleReplySubmit} className="mt-3 flex gap-2 items-center">
              <CornerDownRight size={16} className="text-slate-500 shrink-0 ml-1" />
              <Input
                placeholder={`Reply to ${comment.author.name}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="h-9 text-xs bg-[#0f172a]"
                autoFocus
              />
              <Button variant="primary" size="sm" type="submit" className="h-9 px-3 shrink-0">
                Reply
              </Button>
            </form>
          )}

          {/* Recursively Render nested replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="pl-6 border-l border-[#1f2937]/40 mt-1">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onLike={onLike}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
