"use client";

import React, { useState } from "react";
import { Images, Video, BarChart2, BookOpen, Trash2, Plus, X } from "lucide-react";
import Image from "next/image";
import { usePostStore } from "@/store/postStore";
import { useAuthStore } from "@/store/authStore";
import PostVisibilitySelect from "./PostVisibilitySelect";
import { CreatePostModal } from "./CreatePostModal";

export default function CreatePost() {
  const { createPost } = usePostStore();
  const user = useAuthStore((state) => state.user);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<"public" | "friends" | "private">("public");
  const [type, setType] = useState<"text" | "image" | "video" | "poll" | "shared" | "article">("text");

  // Post type specific inputs
  const [images, setImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [articleDetails, setArticleDetails] = useState({
    title: "",
    summary: "",
    thumbnail: "",
    url: "",
  });

  const handlePost = () => {
    if (!content.trim() && type === "text") return;

    const postPayload: any = {
      author: {
        name: user?.displayName || user?.username || "Alex Morgan",
        username: user?.username || "alex",
        avatar: user?.avatar || "https://images.unsplash.com/photo-1779040622687-42bb00790c67?w=500",
      },
      visibility,
      type,
      content: content || (type === "poll" ? pollQuestion : ""),
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
    setImages([]);
    setVideoUrl("");
    setPollQuestion("");
    setPollOptions(["", ""]);
    setArticleDetails({ title: "", summary: "", thumbnail: "", url: "" });
  };

  const addPollOption = () => {
    setPollOptions([...pollOptions, ""]);
  };

  const removePollOption = (index: number) => {
    setPollOptions(pollOptions.filter((_, i) => i !== index));
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

          <div className="flex-1 space-y-4">
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
                    className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                  >
                    <Plus size={12} /> Upload Media
                  </button>
                </div>
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
                <button
                  type="button"
                  onClick={addPollOption}
                  className="flex items-center gap-1 text-[11px] font-bold text-blue-400 hover:text-blue-500"
                >
                  <Plus size={12} /> Add Option
                </button>
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
          </div>

          <div className="flex gap-2">
            <button
              onClick={handlePost}
              className="bg-blue-600 text-white font-semibold text-xs px-6 py-2.5 rounded-full hover:bg-blue-700 transition shadow-lg shadow-blue-600/10"
            >
              Post
            </button>
          </div>
        </div>
      </div>

      {/* MULTI-MEDIA UPLOAD MODAL */}
      <CreatePostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
