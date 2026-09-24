"use client";

import React, { useState } from "react";
import { Images, Video, BarChart2, BookOpen, Trash2, Plus, X, Loader2, Smile, Clock, Bold, Italic, Code, Quote, Link2 } from "lucide-react";
import Image from "next/image";
import { usePostStore } from "@/store/postStore";
import { useAuthStore } from "@/store/authStore";
import { postService } from "@/services/postService";
import PostVisibilitySelect from "./PostVisibilitySelect";
import { CreatePostModal } from "./CreatePostModal";

export default function CreatePost() {
  const { createPost } = usePostStore();
  const user = useAuthStore((state) => state.user);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<"public" | "friends" | "private">("public");
  const [type, setType] = useState<"text" | "image" | "video" | "poll" | "shared" | "article">("text");
  const [feeling, setFeeling] = useState<{ emoji: string; label: string } | null>(null);
  const [showFeelingPicker, setShowFeelingPicker] = useState(false);

  // Post type specific inputs
  const [images, setImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageFilter, setImageFilter] = useState("normal");
  const [videoUrl, setVideoUrl] = useState("");
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [pollDuration, setPollDuration] = useState<"1d" | "3d" | "7d" | "never">("1d");
  const [articleDetails, setArticleDetails] = useState({
    title: "",
    summary: "",
    thumbnail: "",
    url: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const handlePost = async () => {
    if (!content.trim() && type === "text") return;
    if (submitting) return;

    setSubmitting(true);

    const rawContent = content || (type === "poll" ? pollQuestion : "");
    const postContent = feeling ? `${rawContent} — feeling ${feeling.emoji} ${feeling.label}`.trim() : rawContent;
    const mediaUrls = type === "image" && images.length > 0 ? images : (type === "video" && videoUrl ? [videoUrl] : []);

    let backendId: string | undefined;

    try {
      const res = await postService.createPost({
        content: postContent,
        mediaUrls,
        privacy: visibility === "public" ? "PUBLIC" : visibility === "friends" ? "FRIENDS" : "ONLY_ME",
      });
      const data = res?.data || res;
      if (data?.id) backendId = data.id;
    } catch (err) {
      console.warn("Backend createPost failed, falling back to local optimistic state:", err);
    }

    const postPayload: any = {
      id: backendId || Math.random().toString(36).substring(7),
      author: {
        name: user?.displayName || user?.username || "You",
        username: user?.username || "you",
        avatar: user?.avatar || "https://images.unsplash.com/photo-1779040622687-42bb00790c67?w=500",
      },
      visibility,
      type,
      content: postContent,
    };

    if (type === "image" && images.length > 0) {
      postPayload.images = images;
    } else if (type === "video") {
      postPayload.video = {
        url: videoUrl || "https://assets.mixkit.co/videos/preview/mixkit-downtown-tokyo-by-night-14022-large.mp4",
        duration: "0:15",
        views: 0,
      };
    } else if (type === "poll" && pollQuestion) {
      postPayload.poll = {
        question: pollQuestion,
        duration: pollDuration,
        options: pollOptions
          .filter((opt) => opt.trim() !== "")
          .map((opt, i) => ({ id: `opt_${i}`, text: opt, votes: 0 })),
      };
    } else if (type === "article") {
      postPayload.article = {
        title: articleDetails.title || "Untitled Article",
        summary: articleDetails.summary || "No summary provided.",
        thumbnail: articleDetails.thumbnail || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600",
        url: articleDetails.url || "https://example.com",
      };
    }

    createPost(postPayload);

    // Reset forms
    setContent("");
    setType("text");
    setFeeling(null);
    setImages([]);
    setImageFilter("normal");
    setVideoUrl("");
    setPollQuestion("");
    setPollOptions(["", ""]);
    setPollDuration("1d");
    setArticleDetails({ title: "", summary: "", thumbnail: "", url: "" });
    setSubmitting(false);
  };

  const handleAddImage = () => {
    setImageError(null);
    const url = imageUrlInput.trim();
    if (!url) return;
    if (images.length >= 10) {
      setImageError("Maximum 10 images allowed per post.");
      return;
    }
    if (!/^https?:\/\/.+/i.test(url)) {
      setImageError("Please enter a valid HTTP/HTTPS image URL.");
      return;
    }
    setImages((prev) => [...prev, url]);
    setImageUrlInput("");
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addPollOption = () => {
    setPollOptions([...pollOptions, ""]);
  };

  const removePollOption = (index: number) => {
    setPollOptions(pollOptions.filter((_, i) => i !== index));
  };

  const applyFormat = (prefix: string, suffix: string = prefix, placeholder: string = "text") => {
    setContent((prev) => {
      if (!prev) return `${prefix}${placeholder}${suffix}`;
      return `${prev} ${prefix}${placeholder}${suffix}`;
    });
  };

  return (
    <>
      <div className="bg-[#111827] border border-[#1f2937] rounded-2xl overflow-hidden shadow-xl">
        {/* Top Header Row with Visibility */}
        <div className="flex items-center justify-between p-4 bg-[#111827]/40 border-b border-[#1f2937]">
          <span className="text-xs font-semibold text-slate-400">Create Post</span>
          <PostVisibilitySelect value={visibility} onChange={setVisibility} />
        </div>

        <div className="flex gap-4 p-5">
          <div className="h-12 w-12 rounded-full overflow-hidden shrink-0 border border-[#1f2937]">
            <Image
              src={user?.avatar || "https://images.unsplash.com/photo-1779040622687-42bb00790c67?w=500"}
              alt={user?.displayName || "Alex Morgan"}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 space-y-3">
            {feeling && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium">
                <span>is feeling {feeling.emoji} {feeling.label}</span>
                <button
                  type="button"
                  onClick={() => setFeeling(null)}
                  className="hover:text-white transition ml-0.5 cursor-pointer"
                  title="Remove feeling"
                >
                  <X size={12} />
                </button>
              </div>
            )}

            {/* Markdown Text Formatting Toolbar */}
            <div className="flex items-center gap-1 py-1 px-2 rounded-lg bg-[#0f172a] border border-[#1f2937]/70">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1">Format:</span>
              <button
                type="button"
                onClick={() => applyFormat("**", "**", "bold text")}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="Bold (**text**)"
              >
                <Bold size={13} />
              </button>
              <button
                type="button"
                onClick={() => applyFormat("*", "*", "italic text")}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="Italic (*text*)"
              >
                <Italic size={13} />
              </button>
              <button
                type="button"
                onClick={() => applyFormat("`", "`", "code")}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="Inline Code (`code`)"
              >
                <Code size={13} />
              </button>
              <button
                type="button"
                onClick={() => applyFormat("> ", "", "quoted text")}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="Blockquote (> text)"
              >
                <Quote size={13} />
              </button>
              <button
                type="button"
                onClick={() => applyFormat("[", "](https://)", "link title")}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="Insert Link ([title](url))"
              >
                <Link2 size={13} />
              </button>
            </div>

            <textarea
              placeholder={`What's on your mind, ${user?.displayName?.split(" ")[0] || "Alex"}?`}
              value={content}
              onClick={() => setIsModalOpen(true)}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-20 resize-none bg-transparent text-white placeholder:text-slate-400 outline-none text-sm leading-relaxed cursor-pointer"
            />

            {/* Dynamic Post Type Render Formats */}
            {type === "image" && (
              <div className="rounded-xl border border-[#1f2937] bg-[#0f172a]/50 p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-300">Images Gallery ({images.length}/10)</span>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 cursor-pointer"
                  >
                    <Plus size={12} /> Upload Media
                  </button>
                </div>

                {/* Paste Image URL field */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Paste image link (https://...)"
                    value={imageUrlInput}
                    onChange={(e) => {
                      setImageUrlInput(e.target.value);
                      if (imageError) setImageError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddImage();
                      }
                    }}
                    className="flex-1 rounded-lg border border-[#1f2937] bg-[#111827] px-3 py-1.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    disabled={!imageUrlInput.trim()}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-xs font-semibold text-white transition cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {imageError && (
                  <p className="text-[11px] text-rose-400 font-medium">{imageError}</p>
                )}

                {/* Attached Images Grid */}
                {images.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mr-1">Filter:</span>
                      {[
                        { id: "normal", label: "Normal" },
                        { id: "noir", label: "Noir" },
                        { id: "vintage", label: "Vintage" },
                        { id: "vivid", label: "Vivid" },
                        { id: "warm", label: "Warm" },
                        { id: "cool", label: "Cool" },
                      ].map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setImageFilter(preset.id)}
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition cursor-pointer ${
                            imageFilter === preset.id
                              ? "bg-blue-600 text-white shadow-xs"
                              : "bg-[#111827] text-slate-400 border border-[#1f2937] hover:text-white"
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {images.map((img, idx) => {
                        const filterCss: Record<string, string> = {
                          normal: "none",
                          noir: "grayscale(100%) contrast(120%)",
                          vintage: "sepia(70%) contrast(90%) brightness(95%)",
                          vivid: "saturate(160%) contrast(115%)",
                          warm: "sepia(35%) saturate(135%) brightness(105%)",
                          cool: "hue-rotate(180deg) saturate(120%)",
                        };
                        return (
                          <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-700 group bg-slate-900">
                            <img
                              src={img}
                              alt=""
                              style={{ filter: filterCss[imageFilter] || "none" }}
                              className="h-full w-full object-cover transition-all duration-300"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="absolute top-1 right-1 p-1 rounded-full bg-black/75 hover:bg-rose-600 text-white transition cursor-pointer shadow-md"
                              title="Remove image"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {type === "video" && (
              <div className="rounded-xl border border-[#1f2937] bg-[#0f172a]/50 p-4 space-y-3">
                <span className="text-xs font-bold text-slate-300">Video Upload</span>
                <input
                  type="text"
                  placeholder="Paste mp4 video URL (or leave blank for mock video)..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full rounded-lg border border-[#1f2937] bg-[#111827] px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                />
              </div>
            )}

            {type === "poll" && (
              <div className="rounded-xl border border-[#1f2937] bg-[#0f172a]/50 p-4 space-y-3">
                <span className="text-xs font-bold text-slate-300">Create a Poll</span>
                <input
                  type="text"
                  placeholder="Question (e.g. Which framework do you prefer?)"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  className="w-full rounded-lg border border-[#1f2937] bg-[#111827] px-3 py-2 text-xs text-white outline-none focus:border-blue-500 font-semibold"
                />
                <div className="space-y-2">
                  {pollOptions.map((opt, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder={`Option ${idx + 1}`}
                        value={opt}
                        onChange={(e) => {
                          const nextOpts = [...pollOptions];
                          nextOpts[idx] = e.target.value;
                          setPollOptions(nextOpts);
                        }}
                        className="flex-1 rounded-lg border border-[#1f2937] bg-[#111827] px-3 py-1.5 text-xs text-slate-200 outline-none"
                      />
                      {pollOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removePollOption(idx)}
                          className="text-red-400 hover:text-red-500 p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={addPollOption}
                    className="flex items-center gap-1 text-[11px] font-bold text-blue-400 hover:text-blue-500"
                  >
                    <Plus size={12} /> Add Option
                  </button>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {pollOptions.filter((o) => o.trim()).length} options configured
                  </span>
                </div>

                <div className="pt-2 border-t border-[#1f2937]/70 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-300">
                      <Clock size={12} className="text-blue-400" /> Poll Duration:
                    </span>
                    <span className="text-[10px] text-blue-400 font-medium">
                      {pollDuration === "1d" && "Ends in 24 hours"}
                      {pollDuration === "3d" && "Ends in 3 days"}
                      {pollDuration === "7d" && "Ends in 7 days"}
                      {pollDuration === "never" && "No expiration"}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: "1d", label: "24 Hours" },
                      { id: "3d", label: "3 Days" },
                      { id: "7d", label: "1 Week" },
                      { id: "never", label: "No Limit" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setPollDuration(item.id as any)}
                        className={`py-1 px-2 rounded-lg text-[10px] font-semibold transition-all text-center ${
                          pollDuration === item.id
                            ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                            : "bg-[#111827] text-slate-400 hover:text-slate-200 border border-[#1f2937]"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {type === "article" && (
              <div className="rounded-xl border border-[#1f2937] bg-[#0f172a]/50 p-4 space-y-3">
                <span className="text-xs font-bold text-slate-300">Article Setup</span>
                <input
                  type="text"
                  placeholder="Article Title..."
                  value={articleDetails.title}
                  onChange={(e) => setArticleDetails({ ...articleDetails, title: e.target.value })}
                  className="w-full rounded-lg border border-[#1f2937] bg-[#111827] px-3 py-2 text-xs text-white outline-none focus:border-blue-500 font-semibold"
                />
                <input
                  type="text"
                  placeholder="Article Thumbnail Image URL..."
                  value={articleDetails.thumbnail}
                  onChange={(e) => setArticleDetails({ ...articleDetails, thumbnail: e.target.value })}
                  className="w-full rounded-lg border border-[#1f2937] bg-[#111827] px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                />
                <textarea
                  placeholder="Summary/Intro description..."
                  value={articleDetails.summary}
                  onChange={(e) => setArticleDetails({ ...articleDetails, summary: e.target.value })}
                  className="w-full h-16 rounded-lg border border-[#1f2937] bg-[#111827] px-3 py-2 text-xs text-white outline-none focus:border-blue-500 resize-none"
                />
              </div>
            )}
          </div>
        </div>

        <hr className="border-[#1f2937]" />

        <div className="flex items-center justify-between p-4 bg-[#111827]/10">
          {/* Post Type Selector Tabs */}
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-[#1f2937] transition"
            >
              <Images className="w-4 h-4 text-[#7aa2ff]" />
              <span>Gallery</span>
            </button>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-[#1f2937] transition"
            >
              <Video className="w-4 h-4 text-[#ffb088]" />
              <span>Video</span>
            </button>

            <button
              type="button"
              onClick={() => setType("poll")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                type === "poll" ? "bg-green-500/20 text-green-400" : "text-slate-400 hover:bg-[#1f2937]"
              }`}
            >
              <BarChart2 className="w-4 h-4 text-green-400" />
              <span>Poll</span>
            </button>

            <button
              type="button"
              onClick={() => setType("article")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                type === "article" ? "bg-purple-500/20 text-purple-400" : "text-slate-400 hover:bg-[#1f2937]"
              }`}
            >
              <BookOpen className="w-4 h-4 text-purple-400" />
              <span>Article</span>
            </button>

            {/* Feeling / Mood Picker */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowFeelingPicker((prev) => !prev)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  feeling ? "bg-amber-500/20 text-amber-400" : "text-slate-400 hover:bg-[#1f2937]"
                }`}
                title="Add how you're feeling"
              >
                <Smile className="w-4 h-4 text-[#ffd166]" />
                <span className="hidden sm:inline">{feeling ? `${feeling.emoji} ${feeling.label}` : "Feeling"}</span>
              </button>

              {showFeelingPicker && (
                <div className="absolute left-0 bottom-full mb-2 w-56 rounded-2xl border border-[#1f2937] bg-[#111827] shadow-2xl p-2.5 z-30 animate-in fade-in zoom-in-95 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                    How are you feeling?
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { emoji: "😊", label: "Happy" },
                      { emoji: "🚀", label: "Excited" },
                      { emoji: "☕", label: "Relaxed" },
                      { emoji: "🎯", label: "Focused" },
                      { emoji: "🎉", label: "Celebrating" },
                      { emoji: "💡", label: "Inspired" },
                      { emoji: "💪", label: "Productive" },
                      { emoji: "🔥", label: "Motivated" },
                    ].map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => {
                          setFeeling(item);
                          setShowFeelingPicker(false);
                        }}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-[#1f2937] text-left text-xs text-slate-200 transition cursor-pointer"
                      >
                        <span className="text-base">{item.emoji}</span>
                        <span className="truncate">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handlePost}
              disabled={submitting}
              className="flex items-center gap-1.5 bg-blue-600 text-white font-semibold text-xs px-6 py-2.5 rounded-full hover:bg-blue-700 transition shadow-lg shadow-blue-600/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting && <Loader2 size={13} className="animate-spin" />}
              <span>{submitting ? "Posting..." : "Post"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* MULTI-MEDIA UPLOAD MODAL */}
      <CreatePostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
