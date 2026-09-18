import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Send, Loader2 } from "lucide-react";
import { usePostStore, CommentType } from "@/store/postStore";
import { useAuthStore } from "@/store/authStore";
import { commentService } from "@/services/commentService";
import { reactionService } from "@/services/reactionService";
import { mentionService } from "@/services/mentionService";
import CommentItem from "./CommentItem";

interface Props {
  postId: string;
  comments: CommentType[];
}

export default function PostComments({ postId, comments }: Props) {
  const { addComment, addReplyToComment, toggleLikeComment, editComment, deleteComment } =
    usePostStore();
  const user = useAuthStore((state) => state.user);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [commentList, setCommentList] = useState<CommentType[]>(comments);
  const [mentionSuggestions, setMentionSuggestions] = useState<any[]>([]);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);

  const handleTextChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCommentText(val);

    const cursor = e.target.selectionStart || val.length;
    const textBeforeCursor = val.slice(0, cursor);
    const match = textBeforeCursor.match(/@([a-zA-Z0-9_]*)$/);

    if (match) {
      const query = match[1];
      setMentionQuery(query);
      try {
        const res = await mentionService.getSuggestions(query, 5);
        const list = res?.data || res || [];
        if (Array.isArray(list) && list.length > 0) {
          setMentionSuggestions(list);
        } else {
          setMentionSuggestions([
            { id: "u_sarah", username: "sarahw", name: "Sarah Wilson", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" },
            { id: "u_alex", username: "alexj", name: "Alex Johnson", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" },
          ].filter((u) => u.username.toLowerCase().includes(query.toLowerCase()) || u.name.toLowerCase().includes(query.toLowerCase())));
        }
      } catch {
        setMentionSuggestions([
          { id: "u_sarah", username: "sarahw", name: "Sarah Wilson", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" },
          { id: "u_alex", username: "alexj", name: "Alex Johnson", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" },
        ]);
      }
    } else {
      setMentionSuggestions([]);
      setMentionQuery(null);
    }
  };

  const handleSelectMention = (u: any) => {
    if (mentionQuery === null) return;
    const handle = u.username || u.name?.replace(/\s+/g, "").toLowerCase() || "user";
    const replaced = commentText.replace(new RegExp(`@${mentionQuery}$`), `@${handle} `);
    setCommentText(replaced);
    setMentionSuggestions([]);
    setMentionQuery(null);
  };

  useEffect(() => {
    setCommentList(comments);
  }, [comments]);

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const res = await commentService.getPostComments(postId, 1, 30);
        const items = res?.data?.comments || res?.data || res?.comments || res;
        if (Array.isArray(items) && items.length > 0) {
          const mapped: CommentType[] = items.map((c: any) => ({
            id: c.id,
            author: {
              name:
                c.author?.displayName ||
                `${c.author?.firstName || ""} ${c.author?.lastName || ""}`.trim() ||
                c.author?.username ||
                "User",
              username: c.author?.username || "user",
              avatar:
                c.author?.profilePicture ||
                c.author?.avatarUrl ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
            },
            content: c.content || "",
            createdAt: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "Just now",
            likes: c._count?.likes || c.likes || 0,
            userLiked: c.userLiked,
            replies: Array.isArray(c.replies)
              ? c.replies.map((r: any) => ({
                  id: r.id,
                  author: {
                    name: r.author?.displayName || r.author?.username || "User",
                    username: r.author?.username || "user",
                    avatar: r.author?.profilePicture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
                  },
                  content: r.content || "",
                  createdAt: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "Just now",
                  likes: r._count?.likes || r.likes || 0,
                }))
              : [],
          }));
          setCommentList(mapped);
        }
      } catch (err) {
        console.warn("Could not load backend comments, using local comments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || submitting) return;

    setSubmitting(true);
    const content = commentText.trim();
    setCommentText("");

    let backendId: string | undefined;
    try {
      const res = await commentService.createComment({ postId, content });
      const data = res?.data || res;
      if (data?.id) backendId = data.id;
    } catch (err) {
      console.warn("Backend createComment failed, using optimistic state:", err);
    }

    const newComment: CommentType = {
      id: backendId || Math.random().toString(36).substring(7),
      author: {
        name: user?.displayName || user?.username || "You",
        username: user?.username || "you",
        avatar: user?.avatar || "https://images.unsplash.com/photo-1779040622687-42bb00790c67?w=100",
      },
      content,
      createdAt: "Just now",
      likes: 0,
    };

    setCommentList((prev) => [newComment, ...prev]);
    addComment(postId, content);
    setSubmitting(false);
  };

  const handleReply = async (commentId: string, replyText: string) => {
    const tempId = Math.random().toString(36).substring(7);
    const newReplyItem: CommentType = {
      id: tempId,
      author: {
        name: user?.displayName || user?.username || "You",
        username: user?.username || "you",
        avatar: user?.avatar || "https://images.unsplash.com/photo-1779040622687-42bb00790c67?w=100",
      },
      content: replyText,
      createdAt: "Just now",
      likes: 0,
    };

    const addReplyRecursive = (list: CommentType[]): CommentType[] => {
      return list.map((item) => {
        if (item.id === commentId) {
          return {
            ...item,
            replies: [...(item.replies || []), newReplyItem],
          };
        }
        if (item.replies && item.replies.length > 0) {
          return {
            ...item,
            replies: addReplyRecursive(item.replies),
          };
        }
        return item;
      });
    };

    setCommentList((prev) => addReplyRecursive(prev));
    addReplyToComment(postId, commentId, replyText);

    try {
      const res = await commentService.createComment({ postId, parentId: commentId, content: replyText });
      const data = res?.data || res;
      if (data?.id) {
        const backendId = data.id;
        setCommentList((prev) => {
          const updateIdRecursive = (list: CommentType[]): CommentType[] => {
            return list.map((item) => {
              if (item.id === tempId) {
                return { ...item, id: backendId };
              }
              if (item.replies && item.replies.length > 0) {
                return { ...item, replies: updateIdRecursive(item.replies) };
              }
              return item;
            });
          };
          return updateIdRecursive(prev);
        });
      }
    } catch (err) {
      console.warn("Backend reply creation failed, using local store:", err);
    }
  };

  const handleLike = async (commentId: string) => {
    toggleLikeComment(postId, commentId);

    const toggleLikeRecursive = (list: CommentType[]): { updated: CommentType[]; wasLiked: boolean } => {
      let foundWasLiked = false;
      const updated = list.map((item) => {
        if (item.id === commentId) {
          foundWasLiked = !!item.userLiked;
          const nextLiked = !item.userLiked;
          return {
            ...item,
            userLiked: nextLiked,
            likes: Math.max(0, item.likes + (nextLiked ? 1 : -1)),
          };
        }
        if (item.replies && item.replies.length > 0) {
          const res = toggleLikeRecursive(item.replies);
          if (res.wasLiked) foundWasLiked = true;
          return { ...item, replies: res.updated };
        }
        return item;
      });
      return { updated, wasLiked: foundWasLiked };
    };

    let wasLiked = false;
    setCommentList((prev) => {
      const res = toggleLikeRecursive(prev);
      wasLiked = res.wasLiked;
      return res.updated;
    });

    try {
      if (wasLiked) {
        await reactionService.removeReaction(commentId, "COMMENT");
      } else {
        await reactionService.addReaction({
          targetId: commentId,
          targetType: "COMMENT",
          type: "LIKE",
        });
      }
    } catch (err) {
      console.warn("Backend toggle comment like failed:", err);
    }
  };

  const handleEdit = async (commentId: string, newText: string) => {
    editComment(postId, commentId, newText);

    const updateRecursive = (list: CommentType[]): CommentType[] =>
      list.map((item) => {
        if (item.id === commentId) {
          return { ...item, content: newText };
        }
        if (item.replies && item.replies.length > 0) {
          return { ...item, replies: updateRecursive(item.replies) };
        }
        return item;
      });

    setCommentList((prev) => updateRecursive(prev));

    try {
      await commentService.updateComment(commentId, newText);
    } catch (err) {
      console.warn("Backend update comment failed, using local store:", err);
    }
  };

  const handleDelete = async (commentId: string) => {
    deleteComment(postId, commentId);

    const deleteRecursive = (list: CommentType[]): CommentType[] =>
      list
        .filter((item) => item.id !== commentId)
        .map((item) => ({
          ...item,
          replies: item.replies ? deleteRecursive(item.replies) : [],
        }));

    setCommentList((prev) => deleteRecursive(prev));

    try {
      await commentService.deleteComment(commentId);
    } catch (err) {
      console.warn("Backend delete comment failed, using local store:", err);
    }
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
            sizes="36px"
            className="object-cover"
          />
        </div>

        <div className="relative flex-1">
          {mentionQuery !== null && mentionSuggestions.length > 0 && (
            <div className="absolute left-0 bottom-full z-50 mb-2 w-64 rounded-xl border border-[#1f2937] bg-[#111827] shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-1 duration-150">
              <div className="p-2 border-b border-[#1f2937] bg-[#1a2233] text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Mention user
              </div>
              <div className="max-h-36 overflow-y-auto divide-y divide-[#1f2937]">
                {mentionSuggestions.map((u) => (
                  <button
                    key={u.id || u.username}
                    type="button"
                    onClick={() => handleSelectMention(u)}
                    className="w-full flex items-center gap-2.5 p-2 text-left hover:bg-blue-600/20 transition cursor-pointer"
                  >
                    <div className="relative h-6 w-6 rounded-full overflow-hidden shrink-0 border border-[#374151] bg-slate-800">
                      {u.avatar ? (
                        <Image src={u.avatar} fill className="object-cover" alt={u.name || u.username} />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-[10px] text-white">
                          {(u.name || u.username)?.[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-white truncate">{u.name || u.username}</p>
                      <p className="text-[10px] text-slate-400 truncate">@{u.username || "user"}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <input
            type="text"
            placeholder="Write a comment... (Type @ to mention)"
            value={commentText}
            onChange={handleTextChange}
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
        {loading ? (
          <div className="py-4 flex justify-center text-slate-500 items-center gap-2">
            <Loader2 size={16} className="animate-spin text-blue-500" />
            <span className="text-xs">Loading comments...</span>
          </div>
        ) : commentList.length === 0 ? (
          <p className="text-center text-xs text-slate-500 py-3">No comments yet. Start the conversation!</p>
        ) : (
          commentList.map((comment) => (
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
