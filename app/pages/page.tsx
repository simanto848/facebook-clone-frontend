"use client";

import React, { useState, useEffect } from "react";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import { Flag, Plus, Heart, ThumbsUp, Globe, X } from "lucide-react";
import Image from "next/image";
import { pageService } from "@/services/pageService";

interface BrandPage {
  id: string;
  name: string;
  category: string;
  description: string;
  likes: number;
  avatar: string;
  cover: string;
  isLiked?: boolean;
}

const samplePages: BrandPage[] = [
  {
    id: "p1",
    name: "React Engineering Daily",
    category: "Software & Technology",
    description: "Daily insights into React Server Components, state management, and modern Web APIs.",
    likes: 42300,
    avatar: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=200",
    cover: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600",
  },
  {
    id: "p2",
    name: "Glassmorphism UI Labs",
    category: "Design & Arts",
    description: "Inspiration and code snippets for modern glass translucent UI components.",
    likes: 18900,
    avatar: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=200",
    cover: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600",
  },
];

export default function PagesHubPage() {
  const [pages, setPages] = useState<BrandPage[]>(samplePages);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Software & Technology");
  const [description, setDescription] = useState("");

  const loadPages = async () => {
    try {
      const res = await pageService.getLikedPages();
      const items = res.data || res || [];
      if (Array.isArray(items) && items.length > 0) {
        const fetched: BrandPage[] = items.map((p: any) => ({
          id: p.id,
          name: p.name,
          category: p.category || "Brand",
          description: p.description || "",
          likes: p._count?.likes || 0,
          avatar: p.avatar || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=200",
          cover: p.cover || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600",
          isLiked: true,
        }));
        setPages(fetched);
      }
    } catch (err) {
      console.error("Failed loading pages from API:", err);
    }
  };

  useEffect(() => {
    loadPages();
  }, []);

  const handleToggleLike = async (id: string) => {
    const current = !!likedMap[id];
    setLikedMap((prev) => ({ ...prev, [id]: !current }));
    try {
      await pageService.toggleLike(id);
    } catch (e) {
      console.error("Page toggle like error", e);
    }
  };

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const res = await pageService.createPage({ name, category, description });
      const created = res.data || res;
      const newPage: BrandPage = {
        id: created.id || `p_${Date.now()}`,
        name: created.name || name,
        category,
        description,
        likes: 1,
        avatar: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=200",
        cover: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600",
        isLiked: true,
      };
      setPages((prev) => [newPage, ...prev]);
    } catch (err) {
      console.error("Create page fallback", err);
    } finally {
      setShowCreateModal(false);
      setName("");
      setDescription("");
    }
  };

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
            <div className="flex items-center justify-between border-b border-[#1f2937] pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-400">
                  <Flag size={20} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Pages & Brands Hub</h1>
                  <p className="text-xs text-slate-400">Discover and manage official tech pages</p>
                </div>
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-xs font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-600/10"
              >
                <Plus size={14} />
                <span>Create Page</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pages.map((p) => {
                const isLiked = likedMap[p.id] ?? p.isLiked;
                return (
                  <div key={p.id} className="rounded-2xl border border-[#1f2937] bg-[#111827] overflow-hidden flex flex-col justify-between">
                    <div className="relative h-24 w-full">
                      <Image src={p.cover} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" alt="cover" />
                      <div className="absolute inset-0 bg-black/30" />
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="flex gap-3 items-start">
                        <div className="relative h-10 w-10 rounded-xl overflow-hidden shrink-0 border border-white/20 bg-[#0f172a] -mt-7 z-10">
                          <Image src={p.avatar} fill sizes="40px" className="object-cover" alt="avatar" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white">{p.name}</h3>
                          <span className="text-[9px] text-blue-400 font-semibold">{p.category}</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{p.description}</p>

                      <div className="flex items-center justify-between pt-2 border-t border-[#1f2937]/50">
                        <span className="text-[10px] text-slate-500">{(p.likes + (isLiked ? 1 : 0)).toLocaleString()} likes</span>
                        <button
                          onClick={() => handleToggleLike(p.id)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition ${
                            isLiked ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300 border border-[#1f2937]"
                          }`}
                        >
                          <ThumbsUp size={12} />
                          <span>{isLiked ? "Liked" : "Like Page"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="hidden xl:block w-80 shrink-0">
          <RightSidebar />
        </aside>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setShowCreateModal(false)} />
          <form onSubmit={handleCreatePage} className="relative z-10 w-full max-w-md rounded-2xl border border-[#1f2937] bg-[#111827] p-6 shadow-2xl space-y-4 text-white">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">Create Brand Page</h3>
              <button type="button" onClick={() => setShowCreateModal(false)} className="rounded-full p-1 text-slate-400 hover:bg-[#1f2937]">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300">Page Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. NextJS Developers"
                  className="w-full mt-1 rounded-xl border border-[#1f2937] bg-[#0f172a] px-3.5 py-2.5 outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="text-slate-300">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-11 mt-1 rounded-xl border border-[#1f2937] bg-[#0f172a] px-3.5 outline-none focus:border-blue-500"
                >
                  <option value="Software & Technology">Software & Technology</option>
                  <option value="Design & Arts">Design & Arts</option>
                  <option value="Community">Community</option>
                </select>
              </div>
              <div>
                <label className="text-slate-300">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="About this page..."
                  className="w-full h-20 mt-1 rounded-xl border border-[#1f2937] bg-[#0f172a] p-3 outline-none resize-none focus:border-blue-500"
                />
              </div>
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition">
              Create Page
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
