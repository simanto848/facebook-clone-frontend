import React, { useState } from "react";
import { Images, Smile, Video, BarChart2, BookOpen, Trash2, Plus, X } from "lucide-react";
import Image from "next/image";
import { usePostStore } from "@/store/postStore";
import PostVisibilitySelect from "./PostVisibilitySelect";

export default function CreatePost() {
  const { createPost } = usePostStore();
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
        name: "Alex Morgan",
        username: "alex",
        avatar: "https://images.unsplash.com/photo-1779040622687-42bb00790c67?w=500",
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

  const handleMockImageUpload = () => {
    const mockImages = [
      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600",
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=600",
      "https://images.unsplash.com/photo-1778192391493-7436d746b128?w=600",
    ];
    // Select one randomly and add
    const randomImg = mockImages[Math.floor(Math.random() * mockImages.length)];
    setImages([...images, randomImg]);
  };

  return (
    <div className="bg-[#111827] border border-[#1f2937] rounded-2xl overflow-hidden shadow-xl">
      {/* Top Header Row with Visibility */}
      <div className="flex items-center justify-between p-4 bg-[#111827]/40 border-b border-[#1f2937]">
        <span className="text-xs font-semibold text-slate-400">Create Post</span>
        <PostVisibilitySelect value={visibility} onChange={setVisibility} />
      </div>

      <div className="flex gap-4 p-5">
        <div className="h-12 w-12 rounded-full overflow-hidden shrink-0 border border-[#1f2937]">
          <Image
            src="https://images.unsplash.com/photo-1779040622687-42bb00790c67?w=500"
            alt="Alex Morgan"
            width={48}
            height={48}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 space-y-4">
          <textarea
            placeholder={`What's on your mind, Alex?`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-20 resize-none bg-transparent text-white placeholder:text-slate-400 outline-none text-sm leading-relaxed"
          />

          {/* Dynamic Post Type Render Formats */}
          {type === "image" && (
            <div className="rounded-xl border border-[#1f2937] bg-[#0f172a]/50 p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-300">Images Gallery ({images.length}/10)</span>
                <button
                  type="button"
                  onClick={handleMockImageUpload}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                >
                  <Plus size={12} /> Add Mock Image
                </button>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-5 gap-2">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-[#1f2937]">
                      <Image src={img} alt={`Mock upload ${idx}`} fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => setImages(images.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 rounded-full bg-red-600 p-0.5 text-white hover:bg-red-700 transition"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
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
              <span className="text-xs font-bold text-slate-300">LinkedIn Article Setup</span>
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
            onClick={() => setType("image")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
              type === "image" ? "bg-[#7aa2ff]/20 text-[#7aa2ff]" : "text-slate-400 hover:bg-[#1f2937]"
            }`}
          >
            <Images className="w-4 h-4 text-[#7aa2ff]" />
            <span>Gallery</span>
          </button>

          <button
            type="button"
            onClick={() => setType("video")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
              type === "video" ? "bg-[#ffb088]/20 text-[#ffb088]" : "text-slate-400 hover:bg-[#1f2937]"
            }`}
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
          {type !== "text" && (
            <button
              type="button"
              onClick={() => setType("text")}
              className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-2 transition"
            >
              Cancel Form
            </button>
          )}

          <button
            onClick={handlePost}
            className="bg-blue-600 text-white font-semibold text-xs px-6 py-2.5 rounded-full hover:bg-blue-700 transition shadow-lg shadow-blue-600/10"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}
