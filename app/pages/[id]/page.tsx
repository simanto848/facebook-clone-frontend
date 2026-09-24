"use client";

import React, { useState, useEffect, use } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Flag, ThumbsUp, Plus, Globe, Send, MessageSquare, Image as ImageIcon, X, FileText, Info, ExternalLink, ShieldCheck, Mail, Share2, Check, Star, Clock, Phone } from "lucide-react";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import PostCard from "@/components/features/post/PostCard";
import ReportModal from "@/components/features/post/ReportModal";
import { pageService } from "@/services/pageService";
import { mapBackendPostToPostType, PostType, usePostStore } from "@/store/postStore";
import { useChatStore } from "@/store/chatStore";
import { useAuthStore } from "@/store/authStore";
import {
  Button,
  Badge,
  Card,
  CardContent,
  Avatar,
  Loader,
  EmptyState,
} from "@/components/ui";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function BrandPageDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  const { openChat } = useChatStore();
  const { user } = useAuthStore();

  const [page, setPage] = useState<any>(null);
  const [pagePosts, setPagePosts] = useState<PostType[]>([]);
  const [activeTab, setActiveTab] = useState<"posts" | "about" | "reviews">("posts");
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [postContent, setPostContent] = useState("");
  const [postImageUrl, setPostImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);
  const [postCategory, setPostCategory] = useState<"Announcement" | "Update" | "Discussion">("Announcement");
  const [posting, setPosting] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState([
    {
      id: "rev-1",
      author: "Alex Morgan",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
      rating: 5,
      comment: "Outstanding updates and transparent communication with the community. Highly recommended!",
      date: "2 days ago",
    },
    {
      id: "rev-2",
      author: "David Chen",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
      rating: 5,
      comment: "Great quality content, prompt answers to messages and very helpful resources.",
      date: "1 week ago",
    },
    {
      id: "rev-3",
      author: "Sarah Jenkins",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
      rating: 4,
      comment: "Really enjoy following this brand page. Looking forward to upcoming event meetups!",
      date: "2 weeks ago",
    },
  ]);
  const [newRating, setNewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | null>(null);

  const filteredReviews = selectedRatingFilter
    ? reviews.filter((r) => r.rating === selectedRatingFilter)
    : reviews;

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewComment.trim()) return;
    const newRev = {
      id: `rev-${Date.now()}`,
      author: user?.displayName || user?.username || "Community Member",
      avatar: user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
      rating: newRating,
      comment: newReviewComment.trim(),
      date: "Just now",
    };
    setReviews([newRev, ...reviews]);
    setNewReviewComment("");
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 3000);
  };

  useEffect(() => {
    const fetchPageData = async () => {
      setLoading(true);
      try {
        const res = await pageService.getPageById(id);
        const data = res.data || res;
        if (data) {
          setPage(data);
          setIsLiked(Boolean(data.isLiked));
          setLikesCount(data._count?.likes || data.likes || 0);
        }

        const postsRes = await pageService.getPagePosts(id);
        const pItems = postsRes.data?.posts || postsRes.data || postsRes.posts || postsRes || [];
        if (Array.isArray(pItems) && pItems.length > 0) {
          setPagePosts(pItems.map(mapBackendPostToPostType));
        }
      } catch (err) {
        console.error("Fetch page detail error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, [id]);

  const handleToggleLike = async () => {
    if (likeLoading) return;
    const prevLiked = isLiked;
    const prevCount = likesCount;

    const nextLiked = !prevLiked;
    setIsLiked(nextLiked);
    setLikesCount(nextLiked ? prevCount + 1 : Math.max(0, prevCount - 1));
    setLikeLoading(true);

    try {
      await pageService.toggleLike(id);
    } catch (err) {
      console.error("Toggle page like error:", err);
      // Revert on error
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
    } finally {
      setLikeLoading(false);
    }
  };

  const [copied, setCopied] = useState(false);

  const handleSharePage = async () => {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err) {
      console.error("Failed to copy page link:", err);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim() || posting) return;

    setPosting(true);
    setPostError(null);
    const trimmed = postContent.trim();
    const finalContent = postCategory !== "Update" ? `[${postCategory}] ${trimmed}` : trimmed;
    const media = postImageUrl.trim() ? [postImageUrl.trim()] : [];

    try {
      const res = await pageService.createPagePost(id, finalContent);
      const newP = res?.data || res;
      let createdPost: PostType;
      if (newP && newP.id) {
        createdPost = mapBackendPostToPostType({
          ...newP,
          mediaUrls: media.length > 0 ? media : newP.mediaUrls,
        });
      } else {
        // Optimistic entry
        createdPost = {
          id: Math.random().toString(36).substring(7),
          author: {
            name: page?.name || "Page Admin",
            username: page?.name?.toLowerCase().replace(/\s+/g, "") || "page",
            avatar: page?.avatar || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=200",
          },
          content: finalContent,
          images: media,
          createdAt: "Just now",
          visibility: "public",
          type: media.length > 0 ? "image" : "text",
          reactions: { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 },
          comments: [],
        };
      }
      setPagePosts((prev) => [createdPost, ...prev]);
      try {
        const currentStorePosts = usePostStore.getState().posts;
        usePostStore.getState().setPosts([createdPost, ...currentStorePosts]);
      } catch {
        // ignore
      }
      setPostContent("");
      setPostImageUrl("");
      setShowImageInput(false);
      setPostSuccess(true);
      setTimeout(() => setPostSuccess(false), 3500);
    } catch (err: any) {
      console.error("Create page post error:", err);
      setPostError(err.response?.data?.message || err.message || "Failed to publish page post");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <div className="flex">
        {/* LEFT SIDEBAR */}
        <aside className="hidden lg:block w-72 shrink-0">
          <LeftSidebar />
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 flex justify-center">
          <div className="w-full max-w-3xl px-6 py-6 space-y-6">
            {loading ? (
              <div className="py-24 text-center">
                <Loader label="Loading Page details..." />
              </div>
            ) : !page ? (
              <div className="space-y-4">
                <button
                  onClick={() => router.back()}
                  className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition"
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <EmptyState
                  icon={<Flag size={36} className="text-slate-400" />}
                  title="Page Not Found"
                  description="This official page or brand community does not exist or has been removed."
                />
              </div>
            ) : (
              <>
                {/* Header Back Button */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => router.back()}
                    className="h-9 w-9 rounded-full border border-[#1f2937] bg-[#111827]/60 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Official Page
                  </span>
                </div>

                {/* Page Cover & Profile Card */}
                <div className="rounded-3xl border border-[#1f2937] bg-[#111827] overflow-hidden shadow-xl">
                  {/* Cover Photo */}
                  <div className="relative h-56 w-full bg-slate-800">
                    <Image
                      src={page.cover || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200"}
                      alt={page.name}
                      fill
                      priority
                      sizes="100vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-[#111827] via-transparent to-black/30" />
                  </div>

                  {/* Profile Header Details */}
                  <div className="p-6 pt-0 relative">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-14 mb-4">
                      <div className="flex items-end gap-4">
                        <div className="relative h-24 w-24 rounded-2xl overflow-hidden border-4 border-[#111827] bg-[#0f172a] shrink-0 shadow-lg">
                          <Image
                            src={page.avatar || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=200"}
                            alt={page.name}
                            fill
                            sizes="96px"
                            className="object-cover"
                          />
                        </div>
                        <div className="mb-1">
                          <h1 className="text-2xl font-black text-white">{page.name}</h1>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="primary">{page.category || "Official Brand"}</Badge>
                            <span className="text-xs text-slate-400">
                              {likesCount.toLocaleString()} followers
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                        <Button
                          variant="secondary"
                          size="md"
                          leftIcon={copied ? <Check size={16} className="text-emerald-400" /> : <Share2 size={16} />}
                          onClick={handleSharePage}
                          className="border border-[#1f2937] text-slate-200 hover:text-white"
                        >
                          {copied ? "Copied!" : "Share"}
                        </Button>

                        <Button
                          variant="secondary"
                          size="md"
                          leftIcon={<Flag size={16} className="text-amber-400" />}
                          onClick={() => setIsReportOpen(true)}
                          className="border border-[#1f2937] text-slate-200 hover:text-white"
                        >
                          Report
                        </Button>

                        <Button
                          variant={isLiked ? "secondary" : "primary"}
                          size="md"
                          leftIcon={<ThumbsUp size={16} className={isLiked ? "text-blue-400 fill-blue-400" : ""} />}
                          loading={likeLoading}
                          onClick={handleToggleLike}
                          className="flex-1 sm:flex-none"
                        >
                          {isLiked ? "Following Page" : "Follow Page"}
                        </Button>
                        {page.website && (
                          <a
                            href={page.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#0f172a] border border-[#1f2937] hover:border-slate-600 text-xs font-semibold text-slate-200 transition"
                          >
                            <Globe size={14} />
                            <span>Website</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {page.description && (
                      <p className="text-xs text-slate-300 leading-relaxed max-w-2xl mt-3">
                        {page.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex items-center gap-2 border-b border-[#1f2937] pb-1">
                  {[
                    { key: "posts", label: "Posts & Updates", icon: FileText },
                    { key: "reviews", label: "Reviews & Ratings", icon: Star },
                    { key: "about", label: "About & Info", icon: Info },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.key;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as any)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isActive
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                            : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                        }`}
                      >
                        <Icon size={14} />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {activeTab === "posts" && (
                  <>
                    {/* Page Post Creation Form */}
                    <div className="rounded-2xl border border-[#1f2937] bg-[#111827] p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar
                            src={page.avatar || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=200"}
                            name={page.name}
                            size="sm"
                          />
                          <div>
                            <span className="text-xs font-bold text-white block">Post as {page.name}</span>
                            <span className="text-[10px] text-slate-400">Official Page Administrator</span>
                          </div>
                        </div>

                        {/* Category selection tag */}
                        <div className="flex items-center gap-1 bg-[#0f172a] p-1 rounded-lg border border-[#1f2937]">
                          {(["Announcement", "Update", "Discussion"] as const).map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setPostCategory(cat)}
                              className={`px-2 py-0.5 rounded text-[10px] font-medium transition ${
                                postCategory === cat
                                  ? "bg-blue-600 text-white shadow-xs"
                                  : "text-slate-400 hover:text-white"
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>

                      {postSuccess && (
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
                          <Check size={14} />
                          <span>Page post published successfully!</span>
                        </div>
                      )}

                      {postError && (
                        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs">
                          {postError}
                        </div>
                      )}

                      <form onSubmit={handleCreatePost} className="space-y-3">
                        <div>
                          <textarea
                            rows={3}
                            placeholder={`Share an official ${postCategory.toLowerCase()} or news update for ${page.name}...`}
                            value={postContent}
                            onChange={(e) => setPostContent(e.target.value)}
                            className="w-full rounded-xl border border-[#1f2937] bg-[#0f172a] px-3.5 py-2.5 text-xs text-white outline-none placeholder:text-slate-500 focus:border-blue-500 transition resize-none"
                          />
                          <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500 px-1">
                            <span>Markdown & links supported</span>
                            <span>{postContent.length}/1000</span>
                          </div>
                        </div>

                        {showImageInput && (
                          <div className="flex items-center gap-2 p-2 rounded-xl bg-[#0f172a] border border-[#1f2937]">
                            <ImageIcon size={14} className="text-slate-400 ml-1" />
                            <input
                              type="text"
                              placeholder="Image URL (e.g. https://images.unsplash.com/...)"
                              value={postImageUrl}
                              onChange={(e) => setPostImageUrl(e.target.value)}
                              className="flex-1 bg-transparent text-xs text-white outline-none placeholder:text-slate-500"
                            />
                            {postImageUrl && (
                              <div className="flex items-center gap-2">
                                <div className="relative h-7 w-7 rounded overflow-hidden border border-blue-500 shrink-0">
                                  <Image src={postImageUrl} alt="preview" fill sizes="28px" className="object-cover" />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setPostImageUrl("")}
                                  className="text-slate-400 hover:text-red-400 p-1"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1 border-t border-[#1f2937]/50">
                          <button
                            type="button"
                            onClick={() => setShowImageInput(!showImageInput)}
                            className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition ${
                              showImageInput || postImageUrl
                                ? "border-blue-500/50 bg-blue-500/10 text-blue-400"
                                : "border-[#1f2937] bg-[#0f172a] text-slate-400 hover:text-white"
                            }`}
                          >
                            <ImageIcon size={13} />
                            <span>{showImageInput ? "Hide Photo URL" : "Attach Image"}</span>
                          </button>

                          <Button
                            type="submit"
                            variant="primary"
                            size="sm"
                            disabled={posting || !postContent.trim()}
                            loading={posting}
                            leftIcon={<Send size={13} />}
                          >
                            {posting ? "Publishing..." : "Publish Post"}
                          </Button>
                        </div>
                      </form>
                    </div>

                    {/* Page Timeline Posts */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                        Page Timeline
                      </h3>
                      {pagePosts.length === 0 ? (
                        <EmptyState
                          icon={<MessageSquare size={36} className="text-slate-500" />}
                          title="No posts yet"
                          description="Be the first to publish an official update to this page timeline."
                        />
                      ) : (
                        pagePosts.map((post) => <PostCard key={post.id} post={post} />)
                      )}
                    </div>
                  </>
                )}

                {activeTab === "about" && (
                  <Card>
                    <CardContent className="space-y-5 p-6">
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
                          <ShieldCheck size={16} className="text-blue-400" />
                          About {page.name}
                        </h3>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {page.description || `This is the official page for ${page.name}. Follow to stay up to date with product releases, news, and official announcements.`}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#1f2937]/80 text-xs">
                        <div className="space-y-1">
                          <span className="text-slate-400 text-[11px]">Category</span>
                          <p className="text-white font-medium">{page.category || "Official Brand"}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-slate-400 text-[11px]">Audience</span>
                          <p className="text-white font-medium">{likesCount.toLocaleString()} Followers</p>
                        </div>
                        {page.website && (
                          <div className="space-y-1">
                            <span className="text-slate-400 text-[11px]">Official Website</span>
                            <a
                              href={page.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:underline flex items-center gap-1.5 font-medium"
                            >
                              <Globe size={13} />
                              <span className="truncate">{page.website.replace(/^https?:\/\//, "")}</span>
                              <ExternalLink size={11} />
                            </a>
                          </div>
                        )}
                        <div className="space-y-1">
                          <span className="text-slate-400 text-[11px]">Page Transparency</span>
                          <p className="text-emerald-400 font-medium flex items-center gap-1">
                            <ShieldCheck size={13} /> Verified Page
                          </p>
                        </div>
                      </div>

                      {/* Business Hours & Operating Status */}
                      <div className="pt-4 border-t border-[#1f2937]/80 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Clock size={14} className="text-blue-400" />
                            Business Hours & Operation
                          </h4>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Open Now
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="p-3 rounded-xl bg-[#0f172a] border border-[#1f2937] space-y-1.5">
                            <div className="flex justify-between text-slate-300">
                              <span>Monday – Friday:</span>
                              <span className="font-semibold text-white">9:00 AM – 6:00 PM</span>
                            </div>
                            <div className="flex justify-between text-slate-300">
                              <span>Saturday:</span>
                              <span className="font-semibold text-white">10:00 AM – 4:00 PM</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                              <span>Sunday:</span>
                              <span className="text-rose-400 font-medium">Closed</span>
                            </div>
                          </div>

                          <div className="p-3 rounded-xl bg-[#0f172a] border border-[#1f2937] space-y-2">
                            <div className="flex items-center gap-2 text-slate-300">
                              <Phone size={13} className="text-blue-400 shrink-0" />
                              <span className="text-[11px]">+1 (555) 019-2834</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-300">
                              <Mail size={13} className="text-blue-400 shrink-0" />
                              <span className="text-[11px]">contact@{page.handle || "page"}.org</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                              <Clock size={13} className="text-amber-400 shrink-0" />
                              <span>Typically replies within 1 hour</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[#1f2937]/80 flex items-center justify-between">
                        <span className="text-xs text-slate-400">Need support or have inquiries?</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<MessageSquare size={14} />}
                          onClick={() => openChat({
                            id: page.ownerId || page.id,
                            name: page.name,
                            avatar: page.avatar || "",
                          })}
                          className="border border-[#1f2937] text-blue-400 hover:bg-blue-600/10 text-xs"
                        >
                          Message Page
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeTab === "reviews" && (
                  <div className="space-y-6">
                    {/* Rating Overview Card */}
                    <Card>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                          <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-[#1f2937] pb-4 md:pb-0">
                            <span className="text-4xl font-extrabold text-white">4.8</span>
                            <div className="flex items-center gap-1 my-2">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  size={18}
                                  className={s <= 5 ? "text-amber-400 fill-amber-400" : "text-slate-600"}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-slate-400">Based on {reviews.length} community reviews</span>
                          </div>

                          <div className="col-span-2 space-y-2">
                            {[
                              { stars: 5, pct: 85 },
                              { stars: 4, pct: 15 },
                              { stars: 3, pct: 0 },
                              { stars: 2, pct: 0 },
                              { stars: 1, pct: 0 },
                            ].map((row) => (
                              <div key={row.stars} className="flex items-center gap-3 text-xs">
                                <span className="w-12 text-slate-400 flex items-center gap-1">
                                  {row.stars} <Star size={11} className="text-amber-400 fill-amber-400" />
                                </span>
                                <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                                  <div
                                    className="h-full bg-linear-to-r from-amber-400 to-amber-500 rounded-full"
                                    style={{ width: `${row.pct}%` }}
                                  />
                                </div>
                                <span className="w-8 text-right text-slate-500 font-mono text-[10px]">{row.pct}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Write a Review Card */}
                    <Card>
                      <CardContent className="p-5 space-y-4">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <Star size={16} className="text-amber-400 fill-amber-400" />
                          Share your experience with {page.name}
                        </h4>

                        {reviewSubmitted && (
                          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
                            <Check size={14} />
                            <span>Thank you! Your review has been added to the page.</span>
                          </div>
                        )}

                        <form onSubmit={handleAddReview} className="space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">Rating:</span>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <button
                                  type="button"
                                  key={s}
                                  onClick={() => setNewRating(s)}
                                  className="cursor-pointer p-0.5 hover:scale-110 transition-transform"
                                >
                                  <Star
                                    size={18}
                                    className={
                                      s <= newRating
                                        ? "text-amber-400 fill-amber-400"
                                        : "text-slate-600 hover:text-slate-400"
                                    }
                                  />
                                </button>
                              ))}
                            </div>
                          </div>

                          <textarea
                            value={newReviewComment}
                            onChange={(e) => setNewReviewComment(e.target.value)}
                            placeholder={`What do you think of ${page.name}? Write your feedback or review here...`}
                            rows={3}
                            className="w-full rounded-xl bg-[#0f172a] border border-[#1f2937] p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-blue-500 transition resize-none"
                          />

                          <div className="flex justify-end">
                            <Button
                              type="submit"
                              size="sm"
                              variant="primary"
                              disabled={!newReviewComment.trim()}
                            >
                              Submit Review
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>

                    {/* Community Reviews List */}
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Community Reviews ({filteredReviews.length})
                        </h4>
                        {/* Rating Filter Chips */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => setSelectedRatingFilter(null)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                              selectedRatingFilter === null
                                ? "bg-blue-600 text-white shadow-xs"
                                : "bg-[#0f172a] border border-[#1f2937] text-slate-400 hover:text-white"
                            }`}
                          >
                            All ({reviews.length})
                          </button>
                          {[5, 4, 3, 2, 1].map((rating) => {
                            const count = reviews.filter((r) => r.rating === rating).length;
                            return (
                              <button
                                key={rating}
                                type="button"
                                onClick={() => setSelectedRatingFilter(selectedRatingFilter === rating ? null : rating)}
                                className={`px-2 py-1 rounded-lg text-[11px] font-medium inline-flex items-center gap-1 transition ${
                                  selectedRatingFilter === rating
                                    ? "bg-amber-500/20 border border-amber-500/50 text-amber-300 shadow-xs"
                                    : "bg-[#0f172a] border border-[#1f2937] text-slate-400 hover:text-white"
                                }`}
                              >
                                <span>{rating}</span>
                                <Star size={10} className="text-amber-400 fill-amber-400" />
                                <span className="text-[10px] text-slate-500">({count})</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {filteredReviews.length === 0 ? (
                        <div className="p-6 text-center rounded-xl bg-[#0f172a] border border-[#1f2937] text-slate-400 text-xs">
                          No reviews found with {selectedRatingFilter} stars.
                        </div>
                      ) : (
                        filteredReviews.map((rev) => (
                          <Card key={rev.id}>
                            <CardContent className="p-4 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                  <Avatar src={rev.avatar} name={rev.author} size="sm" />
                                  <div>
                                    <span className="text-xs font-semibold text-white block">{rev.author}</span>
                                    <span className="text-[10px] text-slate-400">{rev.date}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-0.5">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                      key={s}
                                      size={13}
                                      className={s <= rev.rating ? "text-amber-400 fill-amber-400" : "text-slate-700"}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-xs text-slate-300 leading-relaxed pl-10">
                                {rev.comment}
                              </p>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Report Page Modal */}
            <ReportModal
              isOpen={isReportOpen}
              onClose={() => setIsReportOpen(false)}
              targetId={page?.id || id}
              targetType="PAGE"
            />
          </div>
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="hidden xl:block w-80 shrink-0">
          <RightSidebar />
        </aside>
      </div>
    </div>
  );
}
