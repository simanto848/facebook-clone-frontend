"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, Type, Image as ImageIcon, Video } from "lucide-react";
import { usePostStore, StoryType } from "@/store/postStore";
import { useAuthStore } from "@/store/authStore";
import { storyService } from "@/services/storyService";
import { StoryViewerModal } from "./StoryViewerModal";
import { Dialog, Button, Input, Select, Avatar } from "@/components/ui";

export default function Stories() {
  const { stories, addStory, deleteStory, viewStory, reactStory } = usePostStore();
  const { user: authUser } = useAuthStore();
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newStoryType, setNewStoryType] = useState<"text" | "image" | "video">("text");
  const [newStoryText, setNewStoryText] = useState("");
  const [newStoryMedia, setNewStoryMedia] = useState("");
  const [isSubmittingStory, setIsSubmittingStory] = useState(false);
  const [storyError, setStoryError] = useState<string | null>(null);
  const [storyToDelete, setStoryToDelete] = useState<string | null>(null);
  const [isDeletingStory, setIsDeletingStory] = useState(false);

  const handleDeleteStory = async (storyId: string) => {
    try {
      await storyService.deleteStory(storyId);
    } catch {
      // ignore network errors if mock/offline
    }
    deleteStory(storyId);
    if (activeStoryIndex !== null) {
      if (stories.length <= 1) {
        setActiveStoryIndex(null);
      } else if (activeStoryIndex >= stories.length - 1) {
        setActiveStoryIndex(Math.max(0, stories.length - 2));
      }
    }
  };

  const fetchBackendStories = async () => {
    try {
      const res = await storyService.getActiveStories();
      const items = res.data || res || [];
      if (Array.isArray(items) && items.length > 0) {
        items.forEach((item: any) => {
          const isVideo = item.mediaUrl?.match(/\.(mp4|webm|mov)$/i) || item.mediaType === "VIDEO";
          addStory({
            id: item.id,
            author: {
              name: item.user?.displayName || item.user?.username || "Story Creator",
              avatar: item.user?.avatarUrl || item.user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
            },
            type: isVideo ? "video" : item.mediaUrl ? "image" : "text",
            content: item.mediaUrl || item.caption || "Story content",
          });
        });
      }
    } catch {
      // Fall back to clean default state when API is unavailable
    }
  };

  useEffect(() => {
    fetchBackendStories();
  }, []);

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    setStoryError(null);

    const mediaUrl =
      newStoryType === "text"
        ? "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600"
        : newStoryMedia.trim();

    if (!mediaUrl) {
      setStoryError("Media URL is required for your story.");
      return;
    }

    setIsSubmittingStory(true);
    let createdStoryId = `story_${Date.now()}`;

    try {
      const res = await storyService.createStory({
        mediaUrl,
        caption: newStoryText.trim() || undefined,
        mediaType: newStoryType === "video" ? "VIDEO" : "IMAGE",
      });
      const data = res.data || res;
      if (data?.id) createdStoryId = data.id;
    } catch (err: any) {
      console.error("Failed to persist story to backend:", err);
    } finally {
      setIsSubmittingStory(false);
    }

    addStory({
      id: createdStoryId,
      author: {
        name: authUser?.displayName || authUser?.username || "You",
        avatar: authUser?.avatar || "https://images.unsplash.com/photo-1779040622687-42bb00790c67?w=500",
      },
      type: newStoryType,
      content: newStoryType === "text" ? newStoryText : mediaUrl,
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
              src={authUser?.avatar || "https://images.unsplash.com/photo-1779040622687-42bb00790c67?w=500"}
              fill
              sizes="112px"
              className="object-cover group-hover:scale-105 transition duration-300"
              alt={authUser?.displayName || "My Avatar"}
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
          onDelete={(id) => setStoryToDelete(id)}
        />
      )}

      {/* Delete Story Confirmation Dialog */}
      <Dialog
        isOpen={!!storyToDelete}
        onClose={() => setStoryToDelete(null)}
        title="Delete Story?"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Are you sure you want to delete this story? It will disappear immediately from your friends' story feeds.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStoryToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              loading={isDeletingStory}
              onClick={async () => {
                if (!storyToDelete) return;
                setIsDeletingStory(true);
                await handleDeleteStory(storyToDelete);
                setIsDeletingStory(false);
                setStoryToDelete(null);
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </Dialog>

      {/* CREATE STORY DIALOG */}
      <Dialog
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Story"
      >
        <form onSubmit={handleCreateStory} className="space-y-4">
          {storyError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs">
              {storyError}
            </div>
          )}

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
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">Story Text</label>
                <textarea
                  placeholder="What is on your mind?"
                  value={newStoryText}
                  onChange={(e) => setNewStoryText(e.target.value)}
                  className="w-full h-24 rounded-xl border border-[#374151] bg-[#1f2937] p-3 text-xs text-white outline-none resize-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Text Card Preview */}
              {newStoryText.trim() && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Card Preview</span>
                  <div className="h-28 rounded-xl bg-linear-to-br from-indigo-900 via-purple-900 to-slate-900 p-3 flex items-center justify-center text-center">
                    <p className="text-xs font-bold text-white line-clamp-3">{newStoryText}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <Input
                label={newStoryType === "image" ? "Image URL *" : "Video URL *"}
                placeholder="https://images.unsplash.com/..."
                value={newStoryMedia}
                onChange={(e) => setNewStoryMedia(e.target.value)}
                required
              />

              {/* Preset Image Suggestions */}
              {newStoryType === "image" && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Quick Presets:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: "Night City", url: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=800" },
                      { label: "Workspace", url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800" },
                      { label: "Cyberpunk", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800" },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setNewStoryMedia(preset.url)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] border border-slate-700 transition"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Media Thumbnail Preview */}
              {newStoryMedia.trim() && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Media Preview</span>
                  <div className="relative h-28 w-full rounded-xl overflow-hidden bg-black border border-slate-700">
                    {newStoryType === "video" ? (
                      <video src={newStoryMedia} className="h-full w-full object-cover" />
                    ) : (
                      <img
                        src={newStoryMedia}
                        alt="Preview"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    )}
                  </div>
                </div>
              )}

              <Input
                label="Caption (Optional)"
                placeholder="Add a short caption..."
                value={newStoryText}
                onChange={(e) => setNewStoryText(e.target.value)}
              />
            </div>
          )}

          {/* Upload Progress Indicator */}
          {isSubmittingStory && (
            <div className="space-y-1.5 p-3 rounded-xl bg-blue-600/10 border border-blue-500/20">
              <div className="flex justify-between text-xs font-semibold text-blue-400">
                <span>Publishing story to friends...</span>
                <span>Uploading...</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-blue-500 animate-pulse rounded-full w-4/5 transition-all duration-500" />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-[#1f2937]">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={isSubmittingStory}>
              Share Story
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
