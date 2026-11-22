import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Sparkles, Share2 } from "lucide-react";
import { Dialog, Badge, Avatar, Button } from "@/components/ui";

export interface MemoryData {
  id: string;
  type: "post" | "friendship";
  yearsAgo: number;
  dateStr: string;
  content: string;
  mediaUrl?: string;
  authorName?: string;
  authorAvatar?: string;
  friendName?: string;
  friendAvatar?: string;
}

export interface ShareMemoryModalProps {
  memory: MemoryData | null;
  onClose: () => void;
  onShare: (memory: MemoryData, caption: string) => void | Promise<void>;
  isSharing?: boolean;
}

export default function ShareMemoryModal({
  memory,
  onClose,
  onShare,
  isSharing = false,
}: ShareMemoryModalProps) {
  const [customCaption, setCustomCaption] = useState("");

  useEffect(() => {
    if (!memory) {
      setCustomCaption("");
    }
  }, [memory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memory) return;
    onShare(memory, customCaption);
  };

  return (
    <Dialog
      isOpen={!!memory}
      onClose={onClose}
      title="Share Memory to Your Feed"
      description="Add your thoughts looking back on this moment before sharing with friends."
    >
      {memory && (
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Memory Card Preview */}
          <div className="p-3.5 rounded-2xl border border-purple-500/30 bg-purple-500/10 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-purple-300">
              <div className="flex items-center gap-2">
                <Sparkles size={14} />
                <span>
                  {memory.yearsAgo} Year{memory.yearsAgo > 1 ? "s" : ""} Ago Today • {memory.dateStr}
                </span>
              </div>
              <Badge
                variant="primary"
                size="sm"
                className="bg-purple-600/30 text-purple-300 border-purple-400/30 text-[10px]"
              >
                {memory.type === "friendship" ? "Friendship" : "Past Post"}
              </Badge>
            </div>

            <div className="flex gap-3 items-start">
              {memory.type === "friendship" && memory.friendAvatar ? (
                <div className="relative shrink-0">
                  <Avatar
                    src={memory.friendAvatar}
                    name={memory.friendName || "Friend"}
                    size="md"
                  />
                  <span className="absolute -bottom-1 -right-1 text-xs">❤️</span>
                </div>
              ) : memory.mediaUrl ? (
                <div className="relative h-16 w-24 rounded-xl overflow-hidden shrink-0 border border-purple-500/20">
                  <Image
                    src={memory.mediaUrl}
                    alt="Memory Media"
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </div>
              ) : null}

              <p className="text-xs text-slate-200 leading-relaxed italic flex-1">
                &quot;{memory.content}&quot;
              </p>
            </div>
          </div>

          {/* Custom Caption Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Add a note or reflection (Optional)
              </label>
              <span className="text-[10px] text-slate-400">
                {customCaption.length}/280
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={280}
              placeholder="What are you thinking looking back on this today?..."
              value={customCaption}
              onChange={(e) => setCustomCaption(e.target.value)}
              className="w-full rounded-xl border border-[#374151] bg-[#1f2937] p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500 transition resize-none"
            />
          </div>

          {/* Live Feed Output Preview */}
          {customCaption.trim() && (
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Preview on Feed
              </span>
              <p className="text-xs text-slate-100 whitespace-pre-line">
                {customCaption}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-[#1f2937]">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              variant="primary"
              loading={isSharing}
              disabled={isSharing}
              leftIcon={<Share2 size={13} />}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isSharing ? "Sharing..." : "Share to Feed"}
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
