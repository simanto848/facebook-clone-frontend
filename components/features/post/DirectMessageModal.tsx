"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Send, Check, Search, MessageSquare, X } from "lucide-react";
import { Dialog, Button } from "@/components/ui";
import { useChatStore } from "@/store/chatStore";

interface DirectMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postSnippet?: string;
}

export function DirectMessageModal({
  isOpen,
  onClose,
  postId,
  postSnippet,
}: DirectMessageModalProps) {
  const { conversations, sendDirectMessage } = useChatStore();
  const [selectedConvId, setSelectedConvId] = useState<string>("");
  const [customMessage, setCustomMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const filteredConversations = conversations.filter((c) => {
    const title = c.name || "Chat";
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleSend = () => {
    if (!selectedConvId) return;
    setSending(true);

    const postUrl = typeof window !== "undefined" ? `${window.location.origin}/post/${postId}` : `/post/${postId}`;
    const payload = customMessage.trim()
      ? `${customMessage.trim()}\n\nCheck out this post: ${postUrl}`
      : `Check out this post: ${postUrl}`;

    sendDirectMessage(selectedConvId, payload);

    setSending(false);
    setSent(true);

    setTimeout(() => {
      setSent(false);
      setSelectedConvId("");
      setCustomMessage("");
      onClose();
    }, 1200);
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Send in Direct Message">
      <div className="space-y-4 pt-2">
        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search conversations or friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#0f172a] border border-[#1f2937] text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Conversations List */}
        <div className="max-h-48 overflow-y-auto space-y-1 divide-y divide-[#1f2937]/40 pr-1 custom-scrollbar">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">
              No matching conversations found.
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const name = conv.name || "Direct Chat";
              const avatar = conv.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100";
              const isSelected = selectedConvId === conv.id;

              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition ${
                    isSelected
                      ? "bg-blue-600/20 border border-blue-500/40"
                      : "hover:bg-[#1f2937]/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative h-9 w-9 rounded-full overflow-hidden shrink-0 border border-[#1f2937]">
                      <Image src={avatar} alt={name} fill className="object-cover" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">{name}</p>
                      <p className="text-[10px] text-slate-400">
                        {conv.online ? "Online" : "Direct message"}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? "border-blue-500 bg-blue-600 text-white"
                        : "border-[#374151]"
                    }`}
                  >
                    {isSelected && <Check size={10} />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Optional Custom Message Note */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Add a note (optional)
          </label>
          <input
            type="text"
            placeholder="Say something about this post..."
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-[#0f172a] border border-[#1f2937] text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1f2937]">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={sending}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSend}
            disabled={!selectedConvId || sending || sent}
            leftIcon={sent ? <Check size={14} className="text-emerald-400" /> : <Send size={14} />}
          >
            {sent ? "Sent!" : sending ? "Sending..." : "Send Message"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
