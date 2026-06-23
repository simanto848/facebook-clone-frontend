import React, { useState } from "react";
import Image from "next/image";
import { Plus, X, Eye, Heart, Type, Image as ImageIcon, Video } from "lucide-react";
import { usePostStore, StoryType } from "@/store/postStore";

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Stories() {
  const { stories, addStory, viewStory, reactStory } = usePostStore();
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newStoryType, setNewStoryType] = useState<"text" | "image" | "video">("text");
  const [newStoryText, setNewStoryText] = useState("");
  const [newStoryMedia, setNewStoryMedia] = useState("");
  const [progress, setProgress] = useState(0);

  const activeStory = activeStoryIndex !== null ? stories[activeStoryIndex] : null;

  const handleCreateStory = (e: React.FormEvent) => {
    e.preventDefault();
    const content = newStoryType === "text" ? newStoryText : newStoryMedia;
    if (!content.trim()) return;

    addStory({
      author: {
        name: "Alex Morgan",
        avatar: "https://images.unsplash.com/photo-1779040622687-42bb00790c67?w=500",
      },
      type: newStoryType,
      content,
    });

    // Reset
    setNewStoryText("");
    setNewStoryMedia("");
    setShowCreateModal(false);
  };

  const handleOpenStory = (index: number) => {
    setActiveStoryIndex(index);
    viewStory(stories[index].id);
  };

  const handleNextStory = () => {
    if (activeStoryIndex !== null) {
      if (activeStoryIndex < stories.length - 1) {
        setActiveStoryIndex(activeStoryIndex + 1);
        viewStory(stories[activeStoryIndex + 1].id);
      } else {
        setActiveStoryIndex(null);
      }
    }
  };

  const handlePrevStory = () => {
    if (activeStoryIndex !== null && activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
      viewStory(stories[activeStoryIndex - 1].id);
    }
  };

  const handleReactStory = (storyId: string) => {
    reactStory(storyId);
  };

  const loadMockMedia = (mediaType: "image" | "video") => {
    if (mediaType === "image") {
      setNewStoryMedia("https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500");
    } else {
      setNewStoryMedia("https://assets.mixkit.co/videos/preview/mixkit-downtown-tokyo-by-night-14022-large.mp4");
    }
  };

  // Story Auto-Advance Effect
  useEffect(() => {
    if (activeStoryIndex === null) return;
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNextStory();
          return 0;
        }
        return prev + 2; // reaches 100% in 5 seconds (5000ms / 100ms * 2% = 100%)
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeStoryIndex]);

  return (
    <div className="flex items-center gap-5">
      {/* Add Story Button */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="flex flex-col items-center group shrink-0"
      >
        <div className="h-14 w-14 bg-[#1f2937]/50 border border-[#374151] rounded-full flex justify-center items-center group-hover:border-blue-500 transition-all duration-200">
          <Plus className="w-5 h-5 text-slate-300 group-hover:text-blue-400" />
        </div>
        <span className="text-slate-400 text-xs mt-2 font-medium">Add Story</span>
      </button>

      {/* Stories Carousel */}
      <div className="flex gap-4 overflow-x-auto py-1 no-scrollbar">
        {stories.map((story, index) => (
          <button
            key={story.id}
            onClick={() => handleOpenStory(index)}
            className="flex flex-col items-center shrink-0"
          >
            <div className="p-0.5 rounded-full bg-linear-to-tr from-yellow-400 via-pink-500 to-purple-600">
              <div className="h-14 w-14 rounded-full overflow-hidden bg-[#111827] p-0.5 relative">
                <Image
                  src={story.author.avatar}
                  alt={story.author.name}
                  width={56}
                  height={56}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
            <span className="text-slate-300 text-xs mt-2 font-semibold">{story.author.name.split(" ")[0]}</span>
          </button>
        ))}
      </div>

      {/* Story Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-xs" onClick={() => setShowCreateModal(false)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-[#1f2937] bg-[#111827] p-6 shadow-2xl text-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Create Story</h3>
              <button onClick={() => setShowCreateModal(false)} className="rounded-full p-1 text-slate-400 hover:bg-[#1f2937] hover:text-white transition">
                <X size={20} />
              </button>
            </div>

            {/* Type selector */}
            <div className="flex gap-3 mb-6">
              {[
                { id: "text", label: "Text", icon: Type },
                { id: "image", label: "Image", icon: ImageIcon },
                { id: "video", label: "Video", icon: Video },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setNewStoryType(t.id as any);
                      setNewStoryText("");
                      setNewStoryMedia("");
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-semibold transition ${
                      newStoryType === t.id
                        ? "bg-blue-600 border-blue-500 text-white"
                        : "border-[#1f2937] text-slate-400 hover:bg-[#1f2937]"
                    }`}
                  >
                    <Icon size={14} />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleCreateStory} className="space-y-4">
              {newStoryType === "text" ? (
                <textarea
                  placeholder="Type your text story..."
                  value={newStoryText}
                  onChange={(e) => setNewStoryText(e.target.value)}
                  className="w-full h-24 rounded-xl border border-[#1f2937] bg-[#0f172a] p-3 text-sm text-white outline-none resize-none placeholder:text-slate-400 focus:border-blue-500"
                  required
                />
              ) : (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder={`Paste story ${newStoryType} URL...`}
                    value={newStoryMedia}
                    onChange={(e) => setNewStoryMedia(e.target.value)}
                    className="w-full rounded-xl border border-[#1f2937] bg-[#0f172a] px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => loadMockMedia(newStoryType as any)}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl transition text-slate-300"
                  >
                    Load Mock {newStoryType === "image" ? "Image" : "Video"}
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-lg shadow-blue-600/10"
              >
                Share Story
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Story Viewer Modal */}
      {activeStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setActiveStoryIndex(null)} />
          
          {/* Main Viewer Wrapper */}
          <div className="relative z-10 flex items-center gap-4">
            
            {/* Desktop Left Button */}
            {activeStoryIndex !== null && activeStoryIndex > 0 && (
              <button
                onClick={handlePrevStory}
                className="hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition shrink-0"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            {/* Main Phone Card Container */}
            <div className="relative w-full max-w-sm rounded-2xl overflow-hidden bg-[#111827] border border-[#1f2937] shadow-2xl flex flex-col h-[560px] text-white">
              
              {/* Progress Bars */}
              <div className="absolute top-3 left-4 right-4 z-20 flex gap-1">
                {stories.map((_, idx) => (
                  <div key={idx} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-100 ease-linear"
                      style={{
                        width: idx < activeStoryIndex ? "100%" : idx === activeStoryIndex ? `${progress}%` : "0%",
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Header info */}
              <div className="absolute top-6 left-0 right-0 z-10 bg-linear-to-b from-black/80 to-transparent p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="relative h-8 w-8 rounded-full overflow-hidden border border-white/25">
                    <Image src={activeStory.author.avatar} fill className="object-cover" alt="Author" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">{activeStory.author.name}</h4>
                    <span className="text-[9px] text-slate-400">{activeStory.createdAt}</span>
                  </div>
                </div>
                <button onClick={() => setActiveStoryIndex(null)} className="rounded-full p-1 text-slate-400 hover:bg-white/10 hover:text-white transition">
                  <X size={18} />
                </button>
              </div>

              {/* Story Content Area */}
              <div className="flex-1 relative flex items-center justify-center bg-black">
                
                {/* Touch Zones for Mobile Navigation */}
                <div className="absolute inset-y-0 left-0 w-1/3 z-20 cursor-pointer" onClick={handlePrevStory} />
                <div className="absolute inset-y-0 right-0 w-1/3 z-20 cursor-pointer" onClick={handleNextStory} />

                {activeStory.type === "text" && (
                  <div className="p-8 text-center text-lg font-bold bg-linear-to-tr from-indigo-500 via-purple-500 to-pink-500 h-full w-full flex items-center justify-center px-6">
                    {activeStory.content}
                  </div>
                )}

                {activeStory.type === "image" && (
                  <div className="relative w-full h-full">
                    <Image src={activeStory.content} fill className="object-contain" alt="Story content" />
                  </div>
                )}

                {activeStory.type === "video" && (
                  <video src={activeStory.content} autoPlay loop playsInline className="w-full h-full object-contain" />
                )}
              </div>

              {/* Footer views/reactions */}
              <div className="p-4 bg-[#111827] border-t border-[#1f2937]/50 flex justify-between items-center text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Eye size={14} />
                  <span>{activeStory.views} views</span>
                </div>
                <button
                  onClick={() => handleReactStory(activeStory.id)}
                  className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-full transition font-semibold"
                >
                  <Heart size={14} className="fill-red-400" />
                  <span>{activeStory.reactions}</span>
                </button>
              </div>
            </div>

            {/* Desktop Right Button */}
            {activeStoryIndex !== null && activeStoryIndex < stories.length - 1 && (
              <button
                onClick={handleNextStory}
                className="hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition shrink-0"
              >
                <ChevronRight size={24} />
              </button>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
