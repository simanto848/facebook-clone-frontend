"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

type Props = {
  onClose: () => void;
};

export default function ChatInfoPanel({ onClose }: Props) {
  const [activeTab, setActiveTab] = useState("images");

  const tabs = ["images", "videos", "links", "pinned"];

  return (
    <aside className="w-80 border-l border-[#1f2937] bg-[#111827] transition-all duration-300 animate-in slide-in-from-right">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-[#1f2937]">
        <h2 className="font-semibold text-white">Chat Info</h2>

        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <X size={18} />
        </button>
      </div>

      {/* Profile */}
      <div className="flex flex-col items-center py-6">
        <div className="relative h-20 w-20 overflow-hidden rounded-full">
          <Image
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300"
            alt=""
            fill
            className="object-cover"
          />
        </div>

        <h3 className="mt-3 text-white font-semibold">Sarah Wilson</h3>

        <p className="text-sm text-green-400">Online</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#1f2937]">
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
                  : "text-slate-400"
              }
            `}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 overflow-y-auto h-[calc(100%-220px)]">
        {activeTab === "images" && (
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="aspect-square rounded-lg bg-[#1f2937]"
              />
            ))}
          </div>
        )}

        {activeTab === "videos" && (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-24 rounded-lg bg-[#1f2937]" />
            ))}
          </div>
        )}

        {activeTab === "links" && (
          <div className="space-y-3">
            <div className="rounded-lg bg-[#1f2937] p-3">
              https://github.com
            </div>

            <div className="rounded-lg bg-[#1f2937] p-3">
              https://vercel.com
            </div>
          </div>
        )}

        {activeTab === "pinned" && (
          <div className="space-y-3">
            <div className="rounded-lg bg-[#1f2937] p-4 text-slate-300">
              🚀 Launching the new UI today.
            </div>

            <div className="rounded-lg bg-[#1f2937] p-4 text-slate-300">
              🔥 Remember to update the API docs.
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
