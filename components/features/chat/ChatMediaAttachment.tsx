"use client";

import React, { useState } from "react";
import { Paperclip, Image as ImageIcon, Smile, Mic, FileText } from "lucide-react";
import { Popover, Button } from "@/components/ui";

interface ChatMediaAttachmentProps {
  onSelectMedia: (fileUrl: string, type: "image" | "file" | "voice") => void;
  onSelectEmoji: (emoji: string) => void;
}

export function ChatMediaAttachment({
  onSelectMedia,
  onSelectEmoji,
}: ChatMediaAttachmentProps) {
  const [isRecording, setIsRecording] = useState(false);

  const sampleEmojis = ["👍", "❤️", "😂", "🔥", "🚀", "🎉", "👏", "💯"];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "file") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fakeUrl = URL.createObjectURL(file);
    onSelectMedia(fakeUrl, type);
  };

  const handleRecordVoice = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      onSelectMedia("https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3", "voice");
    }, 2000);
  };

  return (
    <div className="flex items-center gap-1">
      {/* File Attachment Button */}
      <label className="cursor-pointer p-1.5 text-slate-400 hover:text-white transition rounded-lg hover:bg-[#1f2937]">
        <Paperclip size={16} />
        <input
          type="file"
          className="hidden"
          onChange={(e) => handleFileUpload(e, "file")}
        />
      </label>

      {/* Image Upload Button */}
      <label className="cursor-pointer p-1.5 text-slate-400 hover:text-white transition rounded-lg hover:bg-[#1f2937]">
        <ImageIcon size={16} />
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileUpload(e, "image")}
        />
      </label>

      {/* Voice Record Button */}
      <button
        type="button"
        onClick={handleRecordVoice}
        className={`p-1.5 transition rounded-lg ${
          isRecording ? "text-red-400 animate-pulse bg-red-500/10" : "text-slate-400 hover:text-white hover:bg-[#1f2937]"
        }`}
        title="Record voice memo"
      >
        <Mic size={16} />
      </button>

      {/* Emoji Picker Popover */}
      <Popover
        trigger={
          <button type="button" className="p-1.5 text-slate-400 hover:text-white transition rounded-lg hover:bg-[#1f2937]">
            <Smile size={16} />
          </button>
        }
      >
        <div className="grid grid-cols-4 gap-2 p-2 w-36">
          {sampleEmojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onSelectEmoji(emoji)}
              className="text-lg hover:scale-125 transition-transform p-1"
            >
              {emoji}
            </button>
          ))}
        </div>
      </Popover>
    </div>
  );
}
