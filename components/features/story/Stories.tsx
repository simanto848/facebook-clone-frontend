"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, Type, Image as ImageIcon, Video } from "lucide-react";
import { usePostStore, StoryType } from "@/store/postStore";
import { storyService } from "@/services/storyService";
import { StoryViewerModal } from "./StoryViewerModal";
import { Dialog, Button, Input, Select, Avatar } from "@/components/ui";

export default function Stories() {
  const { stories, addStory, viewStory, reactStory } = usePostStore();
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newStoryType, setNewStoryType] = useState<"text" | "image" | "video">("text");
  const [newStoryText, setNewStoryText] = useState("");
  const [newStoryMedia, setNewStoryMedia] = useState("");

  const fetchBackendStories = async () => {
    try {
      const res = await storyService.getStories();
      const items = res.data || res || [];
      if (Array.isArray(items) && items.length > 0) {
        items.forEach((item: any) => {
          addStory({
            id: item.id,
            author: {
              name: item.user?.username || "Story User",
              avatar: item.user?.profilePicture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
            },
            type: item.mediaType === "VIDEO" ? "video" : item.mediaType === "IMAGE" ? "image" : "text",
            content: item.mediaUrl || item.caption || "Story",
          });
        });
      }
    } catch (err) {
      console.error("Story API error, using fallback state:", err);
    }
  };

  useEffect(() => {
    fetchBackendStories();
  }, []);

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = newStoryType === "text" ? newStoryText : newStoryMedia;
    if (!content.trim()) return;

    try {
      await storyService.createStory({
        mediaUrl: content,
        mediaType: newStoryType === "video" ? "VIDEO" : "IMAGE",
        caption: newStoryText,
      });
    } catch (err) {
      console.error("Story API error, fallback to local state:", err);
    }

    addStory({
      author: {
        name: "Alex Morgan",
        avatar: "https://images.unsplash.com/photo-1779040622687-42bb00790c67?w=500",
      },
      type: newStoryType,
      content,
    });

    setNewStoryText("");
    setNewStoryMedia("");
    setShowCreateModal(false);
  };

  const formattedStories = stories.map((s) => ({
    id: s.id,
    author: s.author,
    type: s.type,
    content: s.content,
    views: s.views,
    likes: s.likes,
    hasLiked: s.hasLiked,
  }));

  return (
    <div className="relative w-full">
      <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-2 pt-1 select-none">
        {/* Create Story Card */}
        <div
          onClick={() => setShowCreateModal(true)}
          className="relative h-44 w-28 shrink-0 rounded-2xl border border-[#1f2937] bg-[#111827] overflow-hidden cursor-pointer hover:border-blue-500/50 hover:scale-[1.02] transition-all group"
        >
          <div className="relative h-32 w-full bg-[#1f2937]">
            <Image
              src="https://images.unsplash.com/photo-1779040622687-42bb00790c67?w=500"
              fill
              sizes="112px"
              className="object-cover group-hover:scale-105 transition duration-300"
              alt="My Avatar"
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>
          <div className="absolute top-26 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-blue-600 border-2 border-[#111827] flex items-center justify-center text-white shadow-lg">
            <Plus size={18} />
          </div>
          <div className="h-12 pt-4 text-center">
            <p className="text-[11px] font-bold text-white leading-tight">Create Story</p>
          </div>
        </div>

        {/* Stories List Cards */}
        {stories.map((story, index) => (
          <div
            key={story.id}
            onClick={() => setActiveStoryIndex(index)}
            className="relative h-44 w-28 shrink-0 rounded-2xl border border-[#1f2937] bg-[#111827] overflow-hidden cursor-pointer hover:border-blue-500 hover:scale-[1.02] transition-all group shadow-md"
          >
            {story.type === "text" ? (
              <div className="h-full w-full bg-linear-to-br from-indigo-900 via-purple-900 to-slate-900 p-3 flex items-center justify-center text-center">
                <p className="text-xs font-bold text-white line-clamp-4">{story.content}</p>
              </div>
            ) : story.type === "video" ? (
              <div className="relative h-full w-full bg-black">
                <video src={story.content} className="h-full w-full object-cover" />
              </div>
            ) : (
              <Image
                src={story.content}
                fill
                sizes="112px"
                className="object-cover group-hover:scale-105 transition duration-300"
                alt={story.author.name}
              />
            )}

            <div className="absolute inset-0 bg-linear-to-b from-black/50 via-transparent to-black/70 pointer-events-none" />

            {/* Author Avatar with Ring */}
            <div className="absolute top-2.5 left-2.5 z-10 ring-2 ring-blue-500 rounded-full">
              <Avatar src={story.author.avatar} name={story.author.name} size="xs" />
            </div>

            <div className="absolute bottom-2.5 left-2 right-2 z-10">
              <p className="text-[10px] font-bold text-white truncate drop-shadow-md">
                {story.author.name}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* STORY VIEWER MODAL */}
      {activeStoryIndex !== null && (
        <StoryViewerModal
          isOpen={activeStoryIndex !== null}
          onClose={() => setActiveStoryIndex(null)}
          stories={formattedStories}
          currentIndex={activeStoryIndex}
          onNavigate={(newIndex) => setActiveStoryIndex(newIndex)}
          onLike={(id) => reactStory(id)}
        />
      )}

      {/* CREATE STORY DIALOG */}
      <Dialog
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Story"
      >
        <form onSubmit={handleCreateStory} className="space-y-4">
          <Select
            label="Story Format"
            value={newStoryType}
            onChange={(e) => setNewStoryType(e.target.value as any)}
            options={[
              { label: "Text Status", value: "text" },
              { label: "Photo Image", value: "image" },
              { label: "Video Clip", value: "video" },
            ]}
          />

          {newStoryType === "text" ? (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 block">Story Caption</label>
              <textarea
                placeholder="What is on your mind?"
                value={newStoryText}
                onChange={(e) => setNewStoryText(e.target.value)}
                className="w-full h-24 rounded-xl border border-[#374151] bg-[#1f2937] p-3 text-xs text-white outline-none resize-none focus:border-blue-500"
                required
              />
            </div>
          ) : (
            <Input
              label={newStoryType === "image" ? "Image URL" : "Video URL"}
              placeholder="https://images.unsplash.com/..."
              value={newStoryMedia}
              onChange={(e) => setNewStoryMedia(e.target.value)}
              required
            />
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-[#1f2937]">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Share Story
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
