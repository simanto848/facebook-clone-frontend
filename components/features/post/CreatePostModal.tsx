"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { UploadCloud, X, Image as ImageIcon, Video, Loader2, Globe, Lock, Users } from "lucide-react";
import { Dialog, Button } from "@/components/ui";
import { compressImageFile, createMediaPreview, revokeMediaPreview, type MediaPreview } from "@/lib/mediaUpload";
import { postService } from "@/services/postService";
import { usePostStore } from "@/store/postStore";
import { useAuthStore } from "@/store/authStore";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: "text" | "gallery" | "video";
}

export function CreatePostModal({ isOpen, onClose, initialType = "gallery" }: CreatePostModalProps) {
  const [content, setContent] = useState("");
  const [privacy, setPrivacy] = useState<"PUBLIC" | "FRIENDS" | "ONLY_ME">("PUBLIC");
  const [previews, setPreviews] = useState<MediaPreview[]>([]);
  const [compressing, setCompressing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const user = useAuthStore((state) => state.user);
  const createPost = usePostStore((state) => state.createPost);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setCompressing(true);

    try {
      const newPreviews: MediaPreview[] = [];

      for (const file of acceptedFiles) {
        const item = createMediaPreview(file);

        if (file.type.startsWith("image/")) {
          item.compressedFile = await compressImageFile(file);
        } else {
          item.compressedFile = file;
        }

        newPreviews.push(item);
      }

      setPreviews((prev) => [...prev, ...newPreviews]);
    } catch (err) {
      console.error("Compression error:", err);
    } finally {
      setCompressing(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif"],
      "video/*": [".mp4", ".webm", ".mov"],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const handleRemoveMedia = (id: string) => {
    setPreviews((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) revokeMediaPreview(target);
      return prev.filter((p) => p.id !== id);
    });
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && previews.length === 0) return;

    setSubmitting(true);

    try {
      const mediaUrls = previews.map((p) => p.previewUrl);

      await postService.createPost({
        content,
        mediaUrls,
        privacy,
      });

      createPost({
        author: {
          name: user?.displayName || user?.username || "You",
          username: user?.username || "you",
          avatar: user?.avatar || "https://images.unsplash.com/photo-1779040622687-42bb00790c67?w=500",
        },
        visibility: privacy === "PUBLIC" ? "public" : privacy === "FRIENDS" ? "friends" : "private",
        type: previews.length > 0 && previews[0].type === "video" ? "video" : mediaUrls.length > 0 ? "image" : "text",
        content,
        images: mediaUrls,
      });

      // Reset state
      previews.forEach(revokeMediaPreview);
      setPreviews([]);
      setContent("");
      onClose();
    } catch (err) {
      console.error("Failed to submit post:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-white font-bold">
          <ImageIcon className="text-blue-400" size={20} />
          <span>Create Post & Upload Media</span>
        </div>
      }
    >
      <form onSubmit={handlePostSubmit} className="space-y-4">
        {/* User Card */}
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 rounded-full overflow-hidden border border-[#1f2937] bg-slate-800">
            {user?.avatar ? (
              <Image src={user.avatar} fill className="object-cover" alt="User" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-xs font-bold text-white bg-blue-600">
                {user?.displayName?.[0] || "U"}
              </div>
            )}
          </div>
          <div>
            <h4 className="font-bold text-xs text-white">{user?.displayName || user?.username || "You"}</h4>
            <div className="flex items-center gap-1 mt-0.5">
              <select
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value as any)}
                className="bg-[#0f172a] text-[10px] text-slate-300 border border-[#374151] rounded-lg px-2 py-0.5 outline-none cursor-pointer"
              >
                <option value="PUBLIC">🌐 Public</option>
                <option value="FRIENDS">👥 Friends</option>
                <option value="ONLY_ME">🔒 Only Me</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Textarea */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`What's on your mind, ${user?.displayName?.split(" ")[0] || "Alex"}?`}
          className="w-full h-24 rounded-xl border border-[#374151] bg-[#0f172a] p-3 text-xs text-white outline-none resize-none focus:border-blue-500 transition"
        />

        {/* Drag & Drop Dropzone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
            isDragActive
              ? "border-blue-500 bg-blue-500/10 text-blue-400"
              : "border-[#374151] bg-[#0f172a]/50 text-slate-400 hover:border-slate-500 hover:bg-[#0f172a]"
          }`}
        >
          <input {...getInputProps()} />
          <UploadCloud size={32} className="mx-auto text-blue-400 mb-2" />
          <p className="text-xs font-semibold text-white">
            {isDragActive ? "Drop images or videos here..." : "Drag & drop photos or videos, or click to browse"}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">Supports PNG, JPG, WebP, MP4 (Max 50MB per file)</p>
        </div>

        {/* Compression Progress Indicator */}
        {compressing && (
          <div className="flex items-center gap-2 text-xs text-blue-400 bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
            <Loader2 size={16} className="animate-spin" />
            <span>Compressing and optimizing images...</span>
          </div>
        )}

        {/* Media Thumbnail Gallery Preview */}
        {previews.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold text-slate-400">Media Preview ({previews.length})</p>
            <div className="grid grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {previews.map((item) => (
                <div key={item.id} className="relative group rounded-xl overflow-hidden border border-[#374151] bg-slate-900 aspect-square">
                  {item.type === "video" ? (
                    <video src={item.previewUrl} className="h-full w-full object-cover" />
                  ) : (
                    <Image src={item.previewUrl} fill sizes="100px" className="object-cover" alt="Upload preview" />
                  )}

                  <button
                    type="button"
                    onClick={() => handleRemoveMedia(item.id)}
                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-red-600 transition"
                  >
                    <X size={14} />
                  </button>

                  <div className="absolute bottom-1 left-1 bg-black/60 px-1.5 py-0.5 rounded text-[9px] text-slate-300 font-mono">
                    {item.compressedFile ? `${(item.compressedFile.size / 1024).toFixed(0)}KB` : ""}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2 border-t border-[#1f2937]">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={submitting} disabled={compressing || (!content.trim() && previews.length === 0)}>
            Post to Feed
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
