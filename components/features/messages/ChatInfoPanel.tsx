"use client";

import { X, Bell, BellOff, Download, Trash2, Copy, Check, ExternalLink } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useChatStore } from "@/store/chatStore";

type Props = {
  onClose: () => void;
};

export default function ChatInfoPanel({ onClose }: Props) {
  const [activeTab, setActiveTab] = useState("images");
  const [isMuted, setIsMuted] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [copiedPinnedIndex, setCopiedPinnedIndex] = useState<number | null>(null);
  const { conversations, activeConversationId, clearConversationMessages } = useChatStore();

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );

  useEffect(() => {
    if (!activeConversation) return;
    try {
      const mutedList = JSON.parse(localStorage.getItem("muted_conversations") || "[]");
      setIsMuted(mutedList.includes(activeConversation.id));
    } catch {
      // ignore
    }
  }, [activeConversation?.id]);

  const handleToggleMute = () => {
    if (!activeConversation) return;
    const next = !isMuted;
    setIsMuted(next);
    try {
      const mutedList: string[] = JSON.parse(localStorage.getItem("muted_conversations") || "[]");
      const updated = next
        ? [...mutedList, activeConversation.id]
        : mutedList.filter((id) => id !== activeConversation.id);
      localStorage.setItem("muted_conversations", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleCopyPinned = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedPinnedIndex(index);
    setTimeout(() => setCopiedPinnedIndex(null), 2000);
  };

  const handleExportChat = () => {
    if (!activeConversation) return;
    const history = {
      conversationWith: activeConversation.name,
      exportedAt: new Date().toISOString(),
      messages: activeConversation.messages,
    };
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-history-${activeConversation.name.toLowerCase().replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearChat = () => {
    if (!activeConversationId) return;
    clearConversationMessages(activeConversationId);
    setShowClearConfirm(false);
  };

  const tabs = ["images", "videos", "links", "pinned"];

  if (!activeConversation) return null;

  return (
    <aside className="w-80 border-l border-[#1f2937] bg-[#111827] transition-all duration-300 animate-in slide-in-from-right flex flex-col h-full shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-[#1f2937] shrink-0">
        <h2 className="font-semibold text-white">Chat Info</h2>

        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <X size={18} />
        </button>
      </div>

      {/* Profile */}
      <div className="flex flex-col items-center py-6 shrink-0 border-b border-[#1f2937]/50">
        <div className="relative h-20 w-20 overflow-hidden rounded-full">
          <Image
            src={activeConversation.avatar}
            alt={activeConversation.name}
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>

        <h3 className="mt-3 text-white font-semibold">{activeConversation.name}</h3>

        <p className={`text-xs mt-1 font-medium ${activeConversation.online ? "text-green-400" : "text-slate-500"}`}>
          {activeConversation.online ? "Online" : "Offline"}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#1f2937] shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              flex-1 py-3 text-sm capitalize
              transition
              ${
                activeTab === tab
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-slate-400 hover:text-slate-200"
              }
            `}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 overflow-y-auto flex-1">
        {activeTab === "images" && (
          <div className="grid grid-cols-3 gap-2">
            {[
              "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=200",
              "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=200",
              "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=200",
              "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=200",
              "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=200",
              "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200"
            ].map((src, index) => (
              <div
                key={index}
                className="aspect-square rounded-lg bg-[#1f2937] relative overflow-hidden group cursor-pointer border border-[#374151]/20"
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover transition duration-350 group-hover:scale-110"
                />
              </div>
            ))}
          </div>
        )}

        {activeTab === "videos" && (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-24 rounded-lg bg-[#1f2937]/50 border border-[#374151]/30 flex items-center justify-center text-slate-500 hover:text-slate-400 transition cursor-pointer">
                <span className="text-xs">Mock Video Preview {item}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === "links" && (
          <div className="space-y-3">
            {[
              "https://github.com/facebook/react",
              "https://nextjs.org/docs",
              "https://tailwindcss.com"
            ].map((link) => (
              <a
                key={link}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-lg bg-[#1f2937]/50 border border-[#374151]/30 text-xs text-blue-400 hover:text-blue-300 hover:bg-[#1f2937] transition group cursor-pointer"
              >
                <span className="truncate mr-2">{link}</span>
                <ExternalLink size={13} className="shrink-0 text-slate-400 group-hover:text-blue-300" />
              </a>
            ))}
          </div>
        )}

        {activeTab === "pinned" && (
          <div className="space-y-3">
            {[
              "🚀 Launching the new UI today. Let me know if you hit any roadblocks.",
              "🔥 Remember to update the API docs with the new payload format."
            ].map((pinnedText, idx) => (
              <div
                key={idx}
                className="rounded-lg bg-[#1f2937]/50 border border-[#374151]/30 p-3.5 text-xs text-slate-300 leading-relaxed space-y-2 group"
              >
                <p>{pinnedText}</p>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleCopyPinned(pinnedText, idx)}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    {copiedPinnedIndex === idx ? (
                      <>
                        <Check size={12} className="text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat Options & Actions */}
      <div className="p-4 border-t border-[#1f2937] space-y-2 shrink-0 bg-[#0f172a]/60">
        <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
          Chat Options
        </h4>

        <button
          onClick={handleToggleMute}
          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#1f2937] text-xs text-slate-300 hover:text-white transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            {isMuted ? <BellOff size={15} className="text-amber-400" /> : <Bell size={15} className="text-slate-400" />}
            <span>{isMuted ? "Unmute Notifications" : "Mute Notifications"}</span>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${isMuted ? "bg-amber-500/20 text-amber-300" : "bg-slate-800 text-slate-400"}`}>
            {isMuted ? "Muted" : "Active"}
          </span>
        </button>

        <button
          onClick={handleExportChat}
          className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-[#1f2937] text-xs text-slate-300 hover:text-white transition cursor-pointer"
        >
          <Download size={15} className="text-slate-400" />
          <span>Export Chat History</span>
        </button>

        {showClearConfirm ? (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 space-y-2">
            <p className="text-[11px] text-rose-300 font-medium">
              Clear all messages in this conversation?
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-1 rounded-lg text-xs bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleClearChat}
                className="flex-1 py-1 rounded-lg text-xs bg-rose-600 hover:bg-rose-500 text-white font-semibold transition cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-rose-500/10 text-xs text-rose-400 hover:text-rose-300 transition cursor-pointer"
          >
            <Trash2 size={15} />
            <span>Clear Chat Messages</span>
          </button>
        )}
      </div>
    </aside>
  );
}
