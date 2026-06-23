"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useChatStore } from "@/store/chatStore";

type Props = {
  onClose: () => void;
};

export default function ChatInfoPanel({ onClose }: Props) {
  const [activeTab, setActiveTab] = useState("images");
  const { conversations, activeConversationId } = useChatStore();

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );

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
            <div className="rounded-lg bg-[#1f2937]/50 border border-[#374151]/30 p-3 text-sm text-blue-400 hover:underline cursor-pointer">
              https://github.com/facebook/react
            </div>

            <div className="rounded-lg bg-[#1f2937]/50 border border-[#374151]/30 p-3 text-sm text-blue-400 hover:underline cursor-pointer">
              https://nextjs.org/docs
            </div>
          </div>
        )}

        {activeTab === "pinned" && (
          <div className="space-y-3">
            <div className="rounded-lg bg-[#1f2937]/50 border border-[#374151]/30 p-4 text-xs text-slate-300 leading-relaxed">
              🚀 Launching the new UI today. Let me know if you hit any roadblocks.
            </div>

            <div className="rounded-lg bg-[#1f2937]/50 border border-[#374151]/30 p-4 text-xs text-slate-300 leading-relaxed">
              🔥 Remember to update the API docs with the new payload format.
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
