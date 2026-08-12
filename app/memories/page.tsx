"use client";

import React, { useState, useEffect } from "react";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import { Sparkles, Calendar, Share2 } from "lucide-react";
import Image from "next/image";
import { memoryService } from "@/services/memoryService";

interface MemoryItem {
  id: string;
  yearsAgo: number;
  dateStr: string;
  content: string;
  mediaUrl?: string;
}

const fallbackMemories: MemoryItem[] = [
  {
    id: "m1",
    yearsAgo: 2,
    dateStr: "August 12, 2024",
    content: "Launched the initial version of our WebGL spatial layout framework!",
    mediaUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600",
  },
  {
    id: "m2",
    yearsAgo: 1,
    dateStr: "August 12, 2025",
    content: "Attended React Conf in San Francisco. Unforgettable experience!",
    mediaUrl: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=600",
  },
];

export default function MemoriesPage() {
  const [memories, setMemories] = useState<MemoryItem[]>(fallbackMemories);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMemories = async () => {
      setLoading(true);
      try {
        const res = await memoryService.getMemories();
        const items = res.data || res || [];
        if (Array.isArray(items) && items.length > 0) {
          const parsed: MemoryItem[] = items.map((m: any, idx: number) => ({
            id: m.id || `m_${idx}`,
            yearsAgo: m.yearsAgo || 1,
            dateStr: m.dateStr || "1 year ago today",
            content: m.content || m.post?.content || "Memorable moment",
            mediaUrl: m.mediaUrl || m.post?.mediaUrl,
          }));
          setMemories(parsed);
        }
      } catch (err) {
        console.error("Using fallback memories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMemories();
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <div className="flex">
        {/* LEFT SIDEBAR */}
        <aside className="hidden lg:block w-72 shrink-0">
          <LeftSidebar />
        </aside>

        {/* MAIN FEED */}
        <main className="flex-1 flex justify-center">
          <div className="w-full max-w-3xl px-6 py-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-[#1f2937] pb-4">
              <div className="h-10 w-10 rounded-full bg-purple-600/10 flex items-center justify-center text-purple-400">
                <Sparkles size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">On This Day - Memories</h1>
                <p className="text-xs text-slate-400">Look back on moments and posts from previous years</p>
              </div>
            </div>

            {loading ? (
              <p className="text-xs text-slate-400 text-center py-8">Looking up memories...</p>
            ) : memories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 rounded-2xl border border-dashed border-[#1f2937] bg-[#111827]/40">
                <p className="text-slate-400 font-semibold text-sm">No memories today</p>
                <p className="text-xs text-slate-500 max-w-xs">Check back tomorrow to see your past activity and posts!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {memories.map((m) => (
                  <div key={m.id} className="rounded-2xl border border-[#1f2937] bg-[#111827] p-5 shadow-xl space-y-4">
                    <div className="flex items-center justify-between border-b border-[#1f2937] pb-3">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-purple-400" />
                        <span className="text-xs font-bold text-purple-400">{m.yearsAgo} Years Ago Today</span>
                        <span className="text-[10px] text-slate-500">• {m.dateStr}</span>
                      </div>
                      <button className="flex items-center gap-1 bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 px-3 py-1 rounded-full text-xs font-bold transition">
                        <Share2 size={12} /> Share Memory
                      </button>
                    </div>

                    <p className="text-sm text-slate-200 leading-relaxed">{m.content}</p>

                    {m.mediaUrl && (
                      <div className="relative h-64 rounded-xl overflow-hidden border border-[#1f2937]">
                        <Image src={m.mediaUrl} fill className="object-cover" alt="Memory media" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="hidden xl:block w-80 shrink-0">
          <RightSidebar />
        </aside>
      </div>
    </div>
  );
}
