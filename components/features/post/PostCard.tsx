import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageSquare, Share2, Send, Heart, ShieldAlert, Globe, Users, Lock, EyeOff, Clock, Volume2, VolumeX, Languages } from "lucide-react";
import { PostType, usePostStore } from "@/store/postStore";
import PostDropdown from "./PostDropdown";
import ReactionPicker, { reactionsList } from "./ReactionPicker";
import ShareModal from "./ShareModal";
import SaveButton from "./SaveButton";
import PollPost from "./PollPost";
import PostGallery from "./PostGallery";
import PostVideo from "./PostVideo";
import PostComments from "./PostComments";
import ReportModal from "./ReportModal";
import ReactionsModal from "./ReactionsModal";
import { DirectMessageModal } from "./DirectMessageModal";
import { PostAnalyticsModal } from "./PostAnalyticsModal";
import { PostMediaModal } from "./PostMediaModal";
import { Dialog, Button } from "@/components/ui";
import { reactionService } from "@/services/reactionService";
import { bookmarkService } from "@/services/bookmarkService";
import { postService } from "@/services/postService";
import { shareService } from "@/services/shareService";
import { useAuthStore } from "@/store/authStore";
import { followService } from "@/services/followService";

interface Props {
  post: PostType;
  defaultShowComments?: boolean;
}

export default function PostCard({ post, defaultShowComments = false }: Props) {
  const user = useAuthStore((s) => s.user);
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [showComments, setShowComments] = useState(defaultShowComments);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [directMessageModalOpen, setDirectMessageModalOpen] = useState(false);
  const [isFollowingAuthor, setIsFollowingAuthor] = useState(false);

  const isAuthor = Boolean(
    (user && (user.username === post.author.username || user.id === post.author.username)) ||
    post.author.username === "alex"
  );

  const handleToggleFollowAuthor = async () => {
    const nextFollowing = !isFollowingAuthor;
    setIsFollowingAuthor(nextFollowing);
    try {
      if (nextFollowing) {
        await followService.followUser(post.author.username);
      } else {
        await followService.unfollowUser(post.author.username);
      }
    } catch {
      // ignore
    }
  };
  const [showReactionsModal, setShowReactionsModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [mediaModalState, setMediaModalState] = useState<{ isOpen: boolean; initialIndex: number }>({ isOpen: false, initialIndex: 0 });
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [sharesCount, setSharesCount] = useState<number>((post as any).sharesCount || 0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);
  const [translating, setTranslating] = useState(false);

  const handleToggleTranslation = () => {
    if (isTranslated) {
      setIsTranslated(false);
      return;
    }
    setTranslating(true);
    setTimeout(() => {
      setTranslating(false);
      setIsTranslated(true);
    }, 400);
  };

  const getTranslatedContent = (text: string) => {
    return `${text} (Translated by TechSphere AI)`;
  };

  const handleToggleSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(post.content || "");
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window && isSpeaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSpeaking]);

  useEffect(() => {
    const fetchShares = async () => {
      try {
        const res = await shareService.getPostShares(post.id);
        const count = res?.count ?? (Array.isArray(res?.data) ? res.data.length : res?.shares?.length ?? 0);
        if (typeof count === "number" && count >= 0) {
          setSharesCount(count);
        }
      } catch {
        // Silent fallback
      }
    };
    fetchShares();
  }, [post.id]);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editText.trim()) return;
    editPost(post.id, editText);
    setIsEditing(false);
    try {
      await postService.updatePost(post.id, { content: editText });
    } catch (err) {
      console.warn("Backend updatePost failed, using local store:", err);
    }
  };

  const handleDeletePost = async () => {
    deletePost(post.id);
    try {
      await postService.deletePost(post.id);
    } catch (err) {
      console.warn("Backend deletePost failed, using local store:", err);
    }
  };

  const handleToggleSave = async () => {
    const nextSaved = !post.saved;
    toggleSavePost(post.id);

    try {
      if (nextSaved) {
        await bookmarkService.createBookmark(post.id);
      } else {
        await bookmarkService.deleteBookmark((post as any).bookmarkId || post.id);
      }
    } catch (err) {
      console.warn("Backend bookmark toggle error, fallback to local store:", err);
    }
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

  const handleReactionSelect = async (reactionType: string) => {
    const isRemoving = post.userReaction === reactionType;
    addReaction(post.id, reactionType);
    setShowReactionPicker(false);

    try {
      if (isRemoving) {
        await reactionService.removeReaction(post.id, "POST");
      } else {
        await reactionService.addReaction({
          targetId: post.id,
          targetType: "POST",
          type: reactionType.toUpperCase() as any,
        });
      }
    } catch (err) {
      console.warn("Backend reaction failed, fallback to local store:", err);
    }
  };

  if (isHidden) {
    return (
      <div className="flex items-center justify-between rounded-2xl border border-[#1f2937] bg-[#111827]/60 p-4 text-slate-300 transition-all">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-800 text-slate-400">
            <EyeOff size={18} />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Post hidden</p>
            <p className="text-xs text-slate-400">This post will not appear in your feed.</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsHidden(false)}
          className="text-xs border-slate-700 hover:bg-slate-800 text-blue-400"
        >
          Undo
        </Button>
      </div>
    );
  }

  const wordCount = post.content ? post.content.trim().split(/\s+/).filter(Boolean).length : 0;
  const readingTimeMin = Math.max(1, Math.ceil(wordCount / 200));

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
          <Link
            href={post.author.username === "alex" ? "/profile" : `/profile/${post.author.username}`}
            className="relative h-11 w-11 overflow-hidden rounded-full border border-[#1f2937] hover:opacity-85 transition shrink-0"
          >
            <Image
              src={post.author.avatar}
              alt={post.author.name}
              fill
              sizes="44px"
              className="object-cover"
            />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <Link
                href={post.author.username === "alex" ? "/profile" : `/profile/${post.author.username}`}
                className="font-semibold text-white text-sm hover:underline hover:cursor-pointer"
              >
                {post.author.name}
              </Link>
              {post.type === "shared" && (
                <span className="text-xs text-slate-500 font-medium">shared a post</span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400 mt-0.5">
              <span>{post.createdAt}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                {getVisibilityIcon(post.visibility)}
              </div>
              {wordCount >= 50 && (
                <>
                  <span>•</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700/60 inline-flex items-center gap-1">
                    <Clock size={10} /> {readingTimeMin} min read
                  </span>
                </>
              )}
              {post.content && post.content.trim().length > 0 && (
                <>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={handleToggleSpeech}
                    className={`text-[10px] px-1.5 py-0.5 rounded-md border inline-flex items-center gap-1 transition cursor-pointer ${
                      isSpeaking
                        ? "bg-blue-600/30 text-blue-300 border-blue-500/50 animate-pulse"
                        : "bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-700/60"
                    }`}
                    title={isSpeaking ? "Stop listening" : "Listen to post"}
                  >
                    {isSpeaking ? <VolumeX size={10} className="text-blue-400" /> : <Volume2 size={10} />}
                    <span>{isSpeaking ? "Speaking..." : "Listen"}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <PostDropdown
          postId={post.id}
          isSaved={!!post.saved}
          isPinned={!!post.pinned}
          isAuthor={isAuthor}
          authorName={post.author.name}
          isFollowingAuthor={isFollowingAuthor}
          onFollowAuthor={handleToggleFollowAuthor}
          postContent={post.content}
          onEdit={() => setIsEditing(true)}
          onDelete={() => setShowDeleteConfirm(true)}
          onPin={() => togglePinPost(post.id)}
          onSave={handleToggleSave}
          onHide={() => setIsHidden(true)}
          onReport={() => setIsReportOpen(true)}
          onAnalytics={() => setShowAnalyticsModal(true)}
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
          <div className="space-y-1.5">
            <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
              {isTranslated
                ? getTranslatedContent(post.content)
                : post.content && post.content.length > 280 && !isExpanded
                ? post.content.slice(0, 280) + "..."
                : post.content}
              {!isTranslated && post.content && post.content.length > 280 && (
                <button
                  type="button"
                  onClick={() => setIsExpanded((prev) => !prev)}
                  className="ml-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 hover:underline cursor-pointer inline-block"
                >
                  {isExpanded ? "See Less" : "See More"}
                </button>
              )}
            </p>
            {post.content && post.content.trim().length > 10 && (
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={handleToggleTranslation}
                  disabled={translating}
                  className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-blue-400 transition cursor-pointer"
                >
                  <Languages size={12} className={translating ? "animate-spin text-blue-400" : "text-slate-400"} />
                  <span>
                    {translating ? "Translating..." : isTranslated ? "See Original" : "See Translation"}
                  </span>
                </button>
                {isTranslated && (
                  <span className="text-[10px] text-slate-500 font-medium italic">
                    • Translated from auto-detected language
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* 1. Image Post Gallery */}
        {post.type === "image" && post.images && (
          <PostGallery
            images={post.images}
            onImageClick={(index) => setMediaModalState({ isOpen: true, initialIndex: index })}
          />
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
                  sizes="(max-width: 768px) 100vw, 600px"
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
                  sizes="24px"
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

      {/* Reaction / Comment / Share Count Display */}
      { (totalReactions > 0 || post.comments.length > 0 || sharesCount > 0) && (
        <div className="flex justify-between items-center px-5 py-3 text-xs text-slate-400 border-t border-[#1f2937]/50 mt-4">
          <button
            type="button"
            onClick={() => setShowReactionsModal(true)}
            className="flex items-center gap-1.5 hover:underline focus:outline-none"
            title="View who reacted"
          >
            <div className="flex items-center -space-x-1.5">
              {topReactions.map((r, i) => (
                <span key={i} className="text-[13px] bg-[#111827] rounded-full p-0.5 border border-[#1f2937]">
                  {r?.emoji}
                </span>
              ))}
            </div>
            <span>{totalReactions}</span>
          </button>

          <div className="flex items-center gap-3">
            {post.comments.length > 0 && (
              <button onClick={() => setShowComments(!showComments)} className="hover:underline">
                {post.comments.length} comments
              </button>
            )}
            {sharesCount > 0 && (
              <button onClick={() => setShareModalOpen(true)} className="hover:underline">
                {sharesCount} {sharesCount === 1 ? "share" : "shares"}
              </button>
            )}
          </div>
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
            onClick={() => handleReactionSelect(post.userReaction || "like")}
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
              onSelect={(reaction) => handleReactionSelect(reaction)}
              onClose={() => setShowReactionPicker(false)}
            />
          )}
        </div>

        {/* Comment Action Toggle */}
        <div className="flex-1 flex justify-center">
          <Button
            variant="ghost"
            fullWidth
            leftIcon={<MessageSquare size={18} />}
            onClick={() => setShowComments(!showComments)}
          >
            Comment
          </Button>
        </div>

        {/* Save/Bookmark Action Button */}
        <div className="flex-1 flex justify-center">
          <SaveButton
            isSaved={!!post.saved}
            onClick={handleToggleSave}
            showText={true}
          />
        </div>

        {/* Share Modal Action Trigger */}
        <div className="flex-1 flex justify-center">
          <Button
            variant="ghost"
            fullWidth
            leftIcon={<Share2 size={18} />}
            onClick={() => setShareModalOpen(true)}
          >
            Share
          </Button>
        </div>

        {/* Send Action */}
        <div className="flex-1 flex justify-center">
          <Button
            variant="ghost"
            fullWidth
            leftIcon={<Send size={18} />}
            onClick={() => setDirectMessageModalOpen(true)}
          >
            Send
          </Button>
        </div>
      </div>

      {/* Direct Message Picker Modal */}
      <DirectMessageModal
        postId={post.id}
        isOpen={directMessageModalOpen}
        onClose={() => setDirectMessageModalOpen(false)}
      />

      {/* Share Modal Dialog Overlay */}
      <ShareModal
        postId={post.id}
        post={post}
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        onShareSuccess={() => setSharesCount((c) => c + 1)}
      />

      {/* Report Content Modal Dialog Overlay */}
      <ReportModal
        postId={post.id}
        targetId={post.id}
        targetType="POST"
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />

      {/* Reactions List Breakdown Modal */}
      <ReactionsModal
        targetId={post.id}
        targetType="POST"
        isOpen={showReactionsModal}
        onClose={() => setShowReactionsModal(false)}
      />

      {/* Delete Confirmation Modal */}
      <Dialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Post?"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Are you sure you want to delete this post? This action cannot be undone and will permanently remove it from your timeline.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                setShowDeleteConfirm(false);
                await handleDeletePost();
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Post Analytics Modal */}
      <PostAnalyticsModal
        isOpen={showAnalyticsModal}
        onClose={() => setShowAnalyticsModal(false)}
        post={{
          id: post.id,
          views: (totalReactions * 12) + (post.comments.length * 5) + 142,
          likes: totalReactions,
          commentsCount: post.comments.length,
          sharesCount: sharesCount || 0,
        }}
      />

      {/* Post Media Lightbox Modal */}
      {post.images && post.images.length > 0 && (
        <PostMediaModal
          isOpen={mediaModalState.isOpen}
          onClose={() => setMediaModalState({ isOpen: false, initialIndex: 0 })}
          images={post.images}
          initialIndex={mediaModalState.initialIndex}
          author={{
            name: post.author.name,
            avatar: post.author.avatar,
          }}
          caption={post.content}
        />
      )}

      {/* Render Nested Comments section */}
      {showComments && (
        <PostComments postId={post.id} comments={post.comments} />
      )}
    </article>
  );
}
