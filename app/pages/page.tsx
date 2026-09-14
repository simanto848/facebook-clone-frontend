"use client";

import React, { useState, useEffect } from "react";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import { Flag, Plus, ThumbsUp, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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
  const [website, setWebsite] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

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
    if (!name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setCreateError(null);
    try {
      const res = await pageService.createPage({
        name: name.trim(),
        category,
        description: description.trim(),
        website: website.trim() || undefined,
        avatar: avatarUrl.trim() || undefined,
        cover: coverUrl.trim() || undefined,
      });
      const created = res.data || res;
      const newPage: BrandPage = {
        id: created.id || `p_${Date.now()}`,
        name: created.name || name.trim(),
        category,
        description: description.trim(),
        likes: 1,
        avatar: created.avatar || avatarUrl.trim() || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=200",
        cover: created.cover || coverUrl.trim() || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600",
        isLiked: true,
      };
      setPages((prev) => [newPage, ...prev]);
      setShowCreateModal(false);
      setName("");
      setDescription("");
      setWebsite("");
      setAvatarUrl("");
      setCoverUrl("");
    } catch (err: any) {
      console.error("Create page error:", err);
      setCreateError(err.response?.data?.message || err.message || "Failed to create page");
    } finally {
      setIsSubmitting(false);
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
                        <Link href={`/pages/${p.id}`} className="-mt-8 z-10 block cursor-pointer">
                          <Avatar src={p.avatar} name={p.name} size="lg" />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link href={`/pages/${p.id}`} className="hover:text-blue-400 transition cursor-pointer">
                            <h3 className="text-sm font-bold text-white truncate hover:underline">{p.name}</h3>
                          </Link>
                          <Badge variant="primary" size="sm" className="mt-0.5">{p.category}</Badge>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{p.description}</p>

                      <div className="flex items-center justify-between pt-2 border-t border-[#1f2937]/60">
                        <span className="text-xs text-slate-400 font-semibold">{(p.likes + (isLiked ? 1 : 0)).toLocaleString()} likes</span>
                        <div className="flex gap-2">
                          <Link
                            href={`/pages/${p.id}`}
                            className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-[#1f2937] bg-[#0f172a] hover:bg-[#1f2937] text-slate-300 transition"
                          >
                            <ExternalLink size={12} /> View
                          </Link>
                          <Button
                            variant={isLiked ? "primary" : "secondary"}
                            size="sm"
                            leftIcon={<ThumbsUp size={13} />}
                            onClick={() => handleToggleLike(p.id)}
                          >
                            {isLiked ? "Liked" : "Like Page"}
                          </Button>
                        </div>
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
          {createError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs">
              {createError}
            </div>
          )}

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
              { label: "Business & Startup", value: "Business & Startup" },
              { label: "Education & Learning", value: "Education & Learning" },
            ]}
          />

          <Input
            label="Website (Optional)"
            placeholder="https://yourbrand.io"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Avatar URL (Optional)"
              placeholder="https://images.unsplash.com/..."
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
            />
            <Input
              label="Cover Image URL (Optional)"
              placeholder="https://images.unsplash.com/..."
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
            />
          </div>

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
            <Button type="submit" variant="primary" loading={isSubmitting}>
              {isSubmitting ? "Creating Page..." : "Create Page"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
