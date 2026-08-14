"use client";

import React, { useState, useEffect } from "react";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import { Sparkles, Calendar, Share2 } from "lucide-react";
import Image from "next/image";
import { memoryService } from "@/services/memoryService";
import {
  PageHeader,
  Card,
  CardContent,
  Button,
  Badge,
  EmptyState,
  Loader,
} from "@/components/ui";

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
            <PageHeader
              title="On This Day - Memories"
              description="Look back on special moments, technical achievements, and posts from previous years."
              icon={<Sparkles size={22} className="text-purple-400" />}
              badge={<Badge variant="primary">{memories.length} Memories</Badge>}
            />

            {loading ? (
              <div className="py-16 text-center">
                <Loader label="Looking up memories..." />
              </div>
            ) : memories.length === 0 ? (
              <EmptyState
                icon={<Sparkles size={36} className="text-purple-400" />}
                title="No memories today"
                description="Check back tomorrow to see your past activity and timeline posts!"
              />
            ) : (
              <div className="space-y-6">
                {memories.map((m) => (
                  <Card key={m.id} hover>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between border-b border-[#1f2937]/60 pb-3">
                        <div className="flex items-center gap-2">
                          <Calendar size={15} className="text-purple-400" />
                          <span className="text-xs font-bold text-purple-400">{m.yearsAgo} Years Ago Today</span>
                          <span className="text-xs text-slate-500">• {m.dateStr}</span>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          leftIcon={<Share2 size={13} />}
                          onClick={() => alert("Shared memory to feed!")}
                        >
                          Share Memory
                        </Button>
                      </div>

                      <p className="text-sm text-slate-200 leading-relaxed">{m.content}</p>

                      {m.mediaUrl && (
                        <div className="relative h-64 rounded-xl overflow-hidden border border-[#1f2937] shadow-md">
                          <Image src={m.mediaUrl} fill sizes="100vw" className="object-cover" alt="Memory media" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
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
