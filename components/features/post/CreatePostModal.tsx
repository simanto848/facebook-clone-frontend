"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { UploadCloud, X, Image as ImageIcon, Video, Loader2, Globe, Lock, Users, Hash, Sparkles, Trash2, Smile, Palette, CalendarClock } from "lucide-react";
import { Dialog, Button } from "@/components/ui";
import { compressImageFile, createMediaPreview, revokeMediaPreview, type MediaPreview } from "@/lib/mediaUpload";
import { postService } from "@/services/postService";
import { mentionService } from "@/services/mentionService";
import { usePostStore } from "@/store/postStore";
import { useAuthStore } from "@/store/authStore";

const BG_THEMES = [
  { id: "none", label: "Default", class: "bg-[#0f172a] border border-[#374151]" },
  { id: "sunset", label: "Sunset", class: "bg-linear-to-r from-orange-500 via-rose-500 to-purple-600 border-none" },
  { id: "ocean", label: "Ocean", class: "bg-linear-to-r from-blue-600 via-cyan-500 to-teal-400 border-none" },
  { id: "neon", label: "Neon", class: "bg-linear-to-r from-emerald-500 to-teal-600 border-none" },
  { id: "fire", label: "Fire", class: "bg-linear-to-r from-red-600 via-orange-500 to-amber-400 border-none" },
  { id: "cosmic", label: "Cosmic", class: "bg-linear-to-r from-purple-800 via-violet-600 to-indigo-900 border-none" },
];

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: "text" | "gallery" | "video";
}

export function CreatePostModal({ isOpen, onClose, initialType = "gallery" }: CreatePostModalProps) {
  const [content, setContent] = useState("");
  const [privacy, setPrivacy] = useState<"PUBLIC" | "FRIENDS" | "ONLY_ME">("PUBLIC");
  const [feeling, setFeeling] = useState<{ emoji: string; label: string } | null>(null);
  const [showFeelingPicker, setShowFeelingPicker] = useState(false);
  const [selectedBg, setSelectedBg] = useState("none");
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);
  const [previews, setPreviews] = useState<MediaPreview[]>([]);
  const [compressing, setCompressing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mentionSuggestions, setMentionSuggestions] = useState<any[]>([]);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("post_composer_draft");
      if (saved) {
        setContent(saved);
      }
    }
  }, []);

  const handleClearDraft = () => {
    setContent("");
    if (typeof window !== "undefined") {
      localStorage.removeItem("post_composer_draft");
    }
  };

  const handleAddHashtag = (tag: string) => {
    const next = content ? `${content} ${tag} ` : `${tag} `;
    setContent(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("post_composer_draft", next);
    }
  };

  const handleContentChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("post_composer_draft", val);
    }

    const cursor = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursor);
    const match = textBeforeCursor.match(/@([a-zA-Z0-9_]*)$/);

    if (match) {
      const query = match[1];
      setMentionQuery(query);
      try {
        const res = await mentionService.getSuggestions(query, 5);
        const list = res?.data || res || [];
        if (Array.isArray(list) && list.length > 0) {
          setMentionSuggestions(list);
        } else {
          setMentionSuggestions([
            { id: "u_sarah", username: "sarahw", name: "Sarah Wilson", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" },
            { id: "u_alex", username: "alexj", name: "Alex Johnson", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" },
            { id: "u_emma", username: "emmab", name: "Emma Brown", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100" },
          ].filter((u) => u.username.toLowerCase().includes(query.toLowerCase()) || u.name.toLowerCase().includes(query.toLowerCase())));
        }
      } catch {
        setMentionSuggestions([
          { id: "u_sarah", username: "sarahw", name: "Sarah Wilson", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" },
          { id: "u_alex", username: "alexj", name: "Alex Johnson", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" },
        ]);
      }
    } else {
      setMentionSuggestions([]);
      setMentionQuery(null);
    }
  };

  const handleSelectMention = (u: any) => {
    if (mentionQuery === null) return;
    const handle = u.username || u.name?.replace(/\s+/g, "").toLowerCase() || "user";
    const replaced = content.replace(new RegExp(`@${mentionQuery}$`), `@${handle} `);
    setContent(replaced);
    setMentionSuggestions([]);
    setMentionQuery(null);
  };

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
      const finalContent = feeling
        ? `${content.trim() ? `${content.trim()}\n\n` : ""}— feeling ${feeling.label} ${feeling.emoji}`
        : content;

      await postService.createPost({
        content: finalContent,
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
        content: finalContent,
        images: mediaUrls,
      });

      // Reset state
      previews.forEach(revokeMediaPreview);
      setPreviews([]);
      setContent("");
      setFeeling(null);
      setShowFeelingPicker(false);
      setScheduledDate("");
      setShowSchedulePicker(false);
      if (typeof window !== "undefined") {
        localStorage.removeItem("post_composer_draft");
      }
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
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="font-bold text-xs text-white">{user?.displayName || user?.username || "You"}</h4>
              {feeling && (
                <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
                  <span>{feeling.emoji}</span>
                  <span>is feeling {feeling.label}</span>
                  <button
                    type="button"
                    onClick={() => setFeeling(null)}
                    className="hover:text-white ml-0.5 cursor-pointer"
                  >
                    <X size={10} />
                  </button>
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <select
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value as any)}
                className="bg-[#0f172a] text-[10px] text-slate-300 border border-[#374151] rounded-lg px-2 py-0.5 outline-none cursor-pointer"
              >
                <option value="PUBLIC">🌐 Public</option>
                <option value="FRIENDS">👥 Friends</option>
                <option value="ONLY_ME">🔒 Only Me</option>
              </select>

              <button
                type="button"
                onClick={() => {
                  setShowFeelingPicker((prev) => !prev);
                  setShowBgPicker(false);
                }}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-semibold transition cursor-pointer ${
                  showFeelingPicker || feeling
                    ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                    : "bg-[#0f172a] border-[#374151] text-slate-300 hover:text-white"
                }`}
                title="Add feeling or activity"
              >
                <Smile size={11} className="text-amber-400" />
                <span>{feeling ? `${feeling.emoji} ${feeling.label}` : "Feeling"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowBgPicker((prev) => !prev);
                  setShowFeelingPicker(false);
                }}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-semibold transition cursor-pointer ${
                  showBgPicker || selectedBg !== "none"
                    ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                    : "bg-[#0f172a] border-[#374151] text-slate-300 hover:text-white"
                }`}
                title="Choose background gradient"
              >
                <Palette size={11} className="text-purple-400" />
                <span>Theme</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowSchedulePicker((prev) => !prev);
                  setShowFeelingPicker(false);
                  setShowBgPicker(false);
                }}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-semibold transition cursor-pointer ${
                  showSchedulePicker || scheduledDate
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                    : "bg-[#0f172a] border-[#374151] text-slate-300 hover:text-white"
                }`}
                title="Schedule post for later"
              >
                <CalendarClock size={11} className="text-emerald-400" />
                <span>{scheduledDate ? "Scheduled" : "Schedule"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Schedule Post Drawer */}
        {showSchedulePicker && (
          <div className="p-3 rounded-xl border border-slate-700 bg-slate-900/90 shadow-xl space-y-2 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Schedule for later publication</span>
              <button
                type="button"
                onClick={() => setShowSchedulePicker(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={12} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="datetime-local"
                value={scheduledDate}
                min={new Date().toISOString().slice(0, 16)}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full text-xs bg-[#0f172a] border border-[#374151] rounded-lg px-3 py-1.5 text-white outline-none focus:border-emerald-500"
              />
              {scheduledDate && (
                <button
                  type="button"
                  onClick={() => setScheduledDate("")}
                  className="px-2 py-1.5 text-[11px] text-red-400 hover:text-red-300 bg-red-500/10 rounded-lg shrink-0 transition"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="text-[10px] text-slate-400">Quick presets:</span>
              <button
                type="button"
                onClick={() => {
                  const d = new Date(Date.now() + 60 * 60 * 1000);
                  setScheduledDate(d.toISOString().slice(0, 16));
                }}
                className="text-[10px] bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded text-slate-200 transition"
              >
                In 1 hour
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
                  d.setHours(9, 0, 0, 0);
                  setScheduledDate(d.toISOString().slice(0, 16));
                }}
                className="text-[10px] bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded text-slate-200 transition"
              >
                Tomorrow 9:00 AM
              </button>
            </div>
          </div>
        )}

        {/* Background Theme Swatches */}
        {showBgPicker && (
          <div className="p-2.5 rounded-xl border border-slate-700 bg-slate-900/90 shadow-xl space-y-1.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Select post background theme</span>
              <button
                type="button"
                onClick={() => setShowBgPicker(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={12} />
              </button>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {BG_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => {
                    setSelectedBg(theme.id);
                  }}
                  className={`w-8 h-8 rounded-lg ${theme.class} shrink-0 transition-transform cursor-pointer ${
                    selectedBg === theme.id ? "scale-110 ring-2 ring-white ring-offset-2 ring-offset-slate-950" : "opacity-80 hover:opacity-100"
                  }`}
                  title={theme.label}
                />
              ))}
            </div>
          </div>
        )}

        {/* Feeling / Activity Drawer */}
        {showFeelingPicker && (
          <div className="p-3 rounded-xl border border-slate-700 bg-slate-900/90 shadow-xl space-y-2 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span>How are you feeling right now?</span>
              <button
                type="button"
                onClick={() => setShowFeelingPicker(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={12} />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { emoji: "😊", label: "Happy" },
                { emoji: "🔥", label: "Motivated" },
                { emoji: "💻", label: "Coding" },
                { emoji: "🚀", label: "Launching" },
                { emoji: "🎉", label: "Celebrating" },
                { emoji: "☕", label: "Caffeinated" },
                { emoji: "📚", label: "Learning" },
                { emoji: "🎧", label: "Listening" },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setFeeling(item);
                    setShowFeelingPicker(false);
                  }}
                  className={`flex items-center gap-1.5 p-1.5 rounded-lg border transition text-left cursor-pointer ${
                    feeling?.label === item.label
                      ? "bg-amber-500/20 border-amber-400/50 text-amber-300 font-bold"
                      : "bg-slate-800/80 border-slate-700/60 hover:bg-slate-800 text-slate-200"
                  }`}
                >
                  <span className="text-sm">{item.emoji}</span>
                  <span className="text-[10px] truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content Textarea with Mention Autocomplete */}
        <div className="relative">
          <textarea
            value={content}
            onChange={handleContentChange}
            placeholder={`What's on your mind, ${user?.displayName?.split(" ")[0] || "Alex"}? (Type @ to mention friends)`}
            className={`w-full rounded-xl p-3 text-white outline-none resize-none transition ${
              selectedBg !== "none" && previews.length === 0
                ? `${BG_THEMES.find((t) => t.id === selectedBg)?.class || ""} h-36 text-base font-bold text-center placeholder:text-white/70 shadow-lg flex items-center justify-center`
                : "h-24 text-xs bg-[#0f172a] border border-[#374151] focus:border-blue-500"
            }`}
          />

          {mentionQuery !== null && mentionSuggestions.length > 0 && (
            <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-xl border border-[#1f2937] bg-[#111827] shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="p-2 border-b border-[#1f2937] bg-[#1a2233] text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Mention user
              </div>
              <div className="max-h-40 overflow-y-auto divide-y divide-[#1f2937]">
                {mentionSuggestions.map((u) => (
                  <button
                    key={u.id || u.username}
                    type="button"
                    onClick={() => handleSelectMention(u)}
                    className="w-full flex items-center gap-2.5 p-2 text-left hover:bg-blue-600/20 transition cursor-pointer"
                  >
                    <div className="relative h-6 w-6 rounded-full overflow-hidden shrink-0 border border-[#374151] bg-slate-800">
                      {u.avatar ? (
                        <Image src={u.avatar} fill className="object-cover" alt={u.name || u.username} />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-[10px] text-white">
                          {(u.name || u.username)?.[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-white truncate">{u.name || u.username}</p>
                      <p className="text-[10px] text-slate-400 truncate">@{u.username || "user"}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Hashtag Chips & Draft Indicator */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 pt-0.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-slate-500 font-medium flex items-center gap-0.5">
              <Hash size={11} className="text-blue-400" /> Tags:
            </span>
            {["#tech", "#community", "#updates", "#lifestyle", "#ideas"].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleAddHashtag(tag)}
                className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 hover:bg-blue-600 hover:text-white border border-slate-700 transition"
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {content.length > 0 && (
              <button
                type="button"
                onClick={handleClearDraft}
                className="text-[10px] text-rose-400 hover:text-rose-300 transition cursor-pointer flex items-center gap-1"
                title="Clear saved draft"
              >
                <Trash2 size={11} />
                Clear draft
              </button>
            )}
            <span className="text-[10px] text-slate-500 font-mono">
              {content.length} chars
            </span>
          </div>
        </div>

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
            {scheduledDate ? "Schedule Post" : "Post to Feed"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
