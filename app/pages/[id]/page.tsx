"use client";

import React, { useState, useEffect, use } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Flag, ThumbsUp, Plus, Globe, Send, MessageSquare, Image as ImageIcon, X, FileText, Info, ExternalLink, ShieldCheck, Mail, Share2, Check } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<"posts" | "about">("posts");
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
