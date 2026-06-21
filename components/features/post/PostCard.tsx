import React, { useState } from "react";
import Image from "next/image";
import { MessageSquare, Share2, Send, Heart, ShieldAlert, Globe, Users, Lock } from "lucide-react";
import { PostType, usePostStore } from "@/store/postStore";
import PostDropdown from "./PostDropdown";
import ReactionPicker, { reactionsList } from "./ReactionPicker";
import ShareModal from "./ShareModal";
import SaveButton from "./SaveButton";
import PollPost from "./PollPost";
import PostGallery from "./PostGallery";
import PostVideo from "./PostVideo";
import PostComments from "./PostComments";

interface Props {
  post: PostType;
}

export default function PostCard({ post }: Props) {
  const {
    deletePost,
    editPost,
    toggleSavePost,
    togglePinPost,
    addReaction,
    voteInPoll,
  } = usePostStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(post.content);
  const [showComments, setShowComments] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editText.trim()) return;
    editPost(post.id, editText);
    setIsEditing(false);
  };

  // Visibility Icon lookup
  const getVisibilityIcon = (vis: typeof post.visibility) => {
    switch (vis) {
      case "public":
        return <Globe size={12} className="text-slate-400" />;
      case "friends":
        return <Users size={12} className="text-slate-400" />;
      case "private":
        return <Lock size={12} className="text-slate-400" />;
    }
  };

  // Get total reactions count
  const totalReactions = Object.values(post.reactions).reduce((a, b) => a + b, 0);

  // Get top reactions to display badges
  const topReactions = Object.entries(post.reactions)
    .filter(([_, count]) => count > 0)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 3)
    .map(([type]) => reactionsList.find((r) => r.type === type))
    .filter(Boolean);

  // Find user active reaction
  const userReactionObj = reactionsList.find((r) => r.type === post.userReaction);

  return (
    <article
      className={`
        overflow-hidden rounded-2xl border bg-[#111827] transition-all duration-300
        ${post.pinned ? "border-blue-500/50 shadow-lg shadow-blue-500/5" : "border-[#1f2937]"}
      `}
    >
      {/* Pinned Post Indicator */}
      {post.pinned && (
        <div className="bg-blue-600/10 px-5 py-2 flex items-center gap-2 border-b border-blue-500/15">
          <span className="text-[10px] font-bold tracking-wider uppercase text-blue-400">Pinned Post</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-5">
        <div className="flex items-center gap-3">
          <div className="relative h-11 w-11 overflow-hidden rounded-full border border-[#1f2937]">
            <Image
              src={post.author.avatar}
              alt={post.author.name}
              fill
              className="object-cover"
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-white text-sm">{post.author.name}</h2>
              {post.type === "shared" && (
                <span className="text-xs text-slate-500 font-medium">shared a post</span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
              <span>{post.createdAt}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                {getVisibilityIcon(post.visibility)}
              </div>
            </div>
          </div>
        </div>

        <PostDropdown
          postId={post.id}
          isSaved={!!post.saved}
          isPinned={!!post.pinned}
          onEdit={() => setIsEditing(true)}
          onDelete={() => deletePost(post.id)}
          onPin={() => togglePinPost(post.id)}
          onSave={() => toggleSavePost(post.id)}
          onHide={() => alert("Post hidden.")}
          onReport={() => alert("Post reported.")}
        />
      </div>

      {/* Content */}
      <div className="px-5 space-y-3">
        {isEditing ? (
          <form onSubmit={handleEditSubmit} className="space-y-3">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full min-h-20 rounded-xl border border-[#1f2937] bg-[#0f172a] p-3 text-sm text-white outline-none resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 rounded-lg border border-[#1f2937] text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white"
              >
                Save
              </button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{post.content}</p>
        )}

        {/* 1. Image Post Gallery */}
        {post.type === "image" && post.images && (
          <PostGallery images={post.images} />
        )}

        {/* 2. Video Post Player */}
        {post.type === "video" && post.video && (
          <PostVideo
            url={post.video.url}
            duration={post.video.duration}
            views={post.video.views}
          />
        )}

        {/* 3. Poll Post */}
        {post.type === "poll" && post.poll && (
          <PollPost
            question={post.poll.question}
            options={post.poll.options}
            userVotedOptionId={post.poll.userVotedOptionId}
            onVote={(optionId) => voteInPoll(post.id, optionId)}
          />
        )}

        {/* 4. Article Post */}
        {post.type === "article" && post.article && (
          <div className="border border-[#1f2937] rounded-2xl overflow-hidden bg-[#0f172a]/30 mt-3 group/article">
            {post.article.thumbnail && (
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={post.article.thumbnail}
                  alt={post.article.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover/article:scale-105"
                />
              </div>
            )}
            <div className="p-4 space-y-2">
              <h4 className="font-bold text-white text-sm hover:underline hover:cursor-pointer">
                {post.article.title}
              </h4>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {post.article.summary}
              </p>
              <a
                href={post.article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-blue-400 hover:underline inline-block mt-2"
              >
                Read More →
              </a>
            </div>
          </div>
        )}

        {/* 5. Shared Post */}
        {post.type === "shared" && post.sharedPost && (
          <div className="border border-[#1f2937] rounded-2xl p-4 bg-[#0f172a]/30 mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <div className="relative h-6 w-6 overflow-hidden rounded-full">
                <Image
                  src={post.sharedPost.author.avatar}
                  alt={post.sharedPost.author.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <span className="font-semibold text-xs text-white">
                  {post.sharedPost.author.name}
                </span>
                <span className="text-[10px] text-slate-500 ml-1.5">
                  {post.sharedPost.createdAt}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {post.sharedPost.content}
            </p>
          </div>
        )}
      </div>

      {/* Reaction / Comment Count Display */}
      { (totalReactions > 0 || post.comments.length > 0) && (
        <div className="flex justify-between items-center px-5 py-3 text-xs text-slate-400 border-t border-[#1f2937]/50 mt-4">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center -space-x-1.5">
              {topReactions.map((r, i) => (
                <span key={i} className="text-[13px] bg-[#111827] rounded-full p-0.5 border border-[#1f2937]">
                  {r?.emoji}
                </span>
              ))}
            </div>
            <span>{totalReactions}</span>
          </div>

          <button onClick={() => setShowComments(!showComments)} className="hover:underline">
            {post.comments.length} comments
          </button>
        </div>
      )}

      {/* Actions Footer Bar */}
      <div className="relative flex items-center justify-between border-t border-[#1f2937] p-3 text-slate-400">
        {/* Like Button with Reaction Picker hover */}
        <div
          className="relative flex-1 flex justify-center"
          onMouseEnter={() => setShowReactionPicker(true)}
          onMouseLeave={() => setShowReactionPicker(false)}
        >
          <button
            onClick={() => addReaction(post.id, "like")}
            className={`
              flex w-full items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium transition
              ${userReactionObj ? `${userReactionObj.color} bg-slate-800/30 font-semibold` : "hover:bg-[#1f2937] hover:text-white"}
            `}
          >
            {userReactionObj ? (
              <span>{userReactionObj.emoji}</span>
            ) : (
              <Heart size={18} />
            )}
            <span>{userReactionObj ? userReactionObj.label : "Like"}</span>
          </button>

          {showReactionPicker && (
            <ReactionPicker
              onSelect={(reaction) => addReaction(post.id, reaction)}
              onClose={() => setShowReactionPicker(false)}
            />
          )}
        </div>

        {/* Comment Action Toggle */}
        <div className="flex-1 flex justify-center">
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium transition hover:bg-[#1f2937] hover:text-white"
          >
            <MessageSquare size={18} />
            <span>Comment</span>
          </button>
        </div>

        {/* Save/Bookmark Action Button */}
        <div className="flex-1 flex justify-center">
          <SaveButton
            isSaved={!!post.saved}
            onClick={() => toggleSavePost(post.id)}
            showText={true}
          />
        </div>

        {/* Share Modal Action Trigger */}
        <div className="flex-1 flex justify-center">
          <button
            onClick={() => setShareModalOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium transition hover:bg-[#1f2937] hover:text-white"
          >
            <Share2 size={18} />
            <span>Share</span>
          </button>
        </div>

        {/* Send Action */}
        <div className="flex-1 flex justify-center">
          <button
            onClick={() => alert("Shared to Direct message!")}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium transition hover:bg-[#1f2937] hover:text-white"
          >
            <Send size={18} />
            <span>Send</span>
          </button>
        </div>
      </div>

      {/* Share Modal Dialog Overlay */}
      <ShareModal
        post={post}
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />

      {/* Render Nested Comments section */}
      {showComments && (
        <PostComments postId={post.id} comments={post.comments} />
      )}
    </article>
  );
}
