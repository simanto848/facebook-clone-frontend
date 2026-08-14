"use client";

import React, { useState, useEffect } from "react";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import { Flag, Plus, ThumbsUp } from "lucide-react";
import Image from "next/image";
import { pageService } from "@/services/pageService";
import {
  PageHeader,
  Card,
  CardContent,
  Button,
  Badge,
  Dialog,
  Input,
  Select,
  Avatar,
} from "@/components/ui";

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
            <PageHeader
              title="Pages & Brands Hub"
              description="Discover official developer pages, technology blogs, and brand channels."
              icon={<Flag size={22} />}
              actions={
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus size={14} />}
                  onClick={() => setShowCreateModal(true)}
                >
                  Create Page
                </Button>
              }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pages.map((p) => {
                const isLiked = likedMap[p.id] ?? p.isLiked;
                return (
                  <Card key={p.id} hover className="flex flex-col justify-between">
                    <div className="relative h-24 w-full overflow-hidden">
                      <Image src={p.cover} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" alt="cover" />
                      <div className="absolute inset-0 bg-black/40" />
                    </div>

                    <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="flex gap-3 items-start">
                        <div className="-mt-8 z-10">
                          <Avatar src={p.avatar} name={p.name} size="lg" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-white truncate">{p.name}</h3>
                          <Badge variant="primary" size="sm" className="mt-0.5">{p.category}</Badge>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{p.description}</p>

                      <div className="flex items-center justify-between pt-2 border-t border-[#1f2937]/60">
                        <span className="text-xs text-slate-400 font-semibold">{(p.likes + (isLiked ? 1 : 0)).toLocaleString()} likes</span>
                        <Button
                          variant={isLiked ? "primary" : "secondary"}
                          size="sm"
                          leftIcon={<ThumbsUp size={13} />}
                          onClick={() => handleToggleLike(p.id)}
                        >
                          {isLiked ? "Liked" : "Like Page"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
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

      <Dialog
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Brand Page"
      >
        <form onSubmit={handleCreatePage} className="space-y-4">
          <Input
            label="Page Name"
            placeholder="e.g. NextJS Developers"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={[
              { label: "Software & Technology", value: "Software & Technology" },
              { label: "Design & Arts", value: "Design & Arts" },
              { label: "Community", value: "Community" },
            ]}
          />

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="About this page..."
              className="w-full h-24 rounded-xl border border-[#374151] bg-[#1f2937] p-3 text-xs text-white outline-none resize-none focus:border-blue-500 transition"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#1f2937]">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Page
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
