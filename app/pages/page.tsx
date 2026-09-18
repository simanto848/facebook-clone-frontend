"use client";

import React, { useState, useEffect } from "react";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import { Flag, Plus, ThumbsUp, ExternalLink, Share2, Check, Globe, Search, X } from "lucide-react";
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
  Tabs,
} from "@/components/ui";

interface BrandPage {
  id: string;
  name: string;
  category: string;
  description: string;
  likes: number;
  avatar: string;
  cover: string;
  website?: string;
  isLiked?: boolean;
  isOwner?: boolean;
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
    website: "https://react.dev",
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
  const [copiedPageId, setCopiedPageId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
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
      const [likedRes, ownedRes] = await Promise.allSettled([
        pageService.getLikedPages(),
        pageService.getOwnedPages(),
      ]);

      const likedItems =
        likedRes.status === "fulfilled" ? likedRes.value?.data || likedRes.value || [] : [];
      const ownedItems =
        ownedRes.status === "fulfilled" ? ownedRes.value?.data || ownedRes.value || [] : [];

      const pageMap = new Map<string, BrandPage>();

      if (Array.isArray(likedItems)) {
        likedItems.forEach((p: any) => {
          if (!p?.id) return;
          pageMap.set(p.id, {
            id: p.id,
            name: p.name,
            category: p.category || "Brand",
            description: p.description || "",
            likes: p._count?.likes || p.likes || 0,
            avatar: p.avatar || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=200",
            cover: p.cover || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600",
            isLiked: true,
          });
        });
      }

      if (Array.isArray(ownedItems)) {
        ownedItems.forEach((p: any) => {
          if (!p?.id) return;
          const existing = pageMap.get(p.id);
          pageMap.set(p.id, {
            id: p.id,
            name: p.name,
            category: p.category || existing?.category || "Brand",
            description: p.description || existing?.description || "",
            likes: p._count?.likes || p.likes || existing?.likes || 0,
            avatar: p.avatar || existing?.avatar || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=200",
            cover: p.cover || existing?.cover || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600",
            isLiked: existing?.isLiked ?? false,
            isOwner: true,
          });
        });
      }

      if (pageMap.size > 0) {
        setPages(Array.from(pageMap.values()));
        const initialLikes: Record<string, boolean> = {};
        pageMap.forEach((p) => {
          if (p.isLiked) initialLikes[p.id] = true;
        });
        setLikedMap((prev) => ({ ...initialLikes, ...prev }));
      }
    } catch (err) {
      console.error("Failed loading pages from API:", err);
    }
  };

  useEffect(() => {
    loadPages();
  }, []);

  const handleToggleLike = async (id: string) => {
    const prevPage = pages.find((p) => p.id === id);
    const currentlyLiked = likedMap[id] ?? prevPage?.isLiked ?? false;
    const nextLiked = !currentlyLiked;

    setLikedMap((prev) => ({ ...prev, [id]: nextLiked }));
    setPages((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              isLiked: nextLiked,
              likes: nextLiked ? p.likes + 1 : Math.max(0, p.likes - 1),
            }
          : p
      )
    );

    try {
      await pageService.toggleLike(id);
    } catch (e) {
      console.error("Page toggle like error rollback:", e);
      setLikedMap((prev) => ({ ...prev, [id]: currentlyLiked }));
      setPages((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                isLiked: currentlyLiked,
                likes: prevPage?.likes ?? p.likes,
              }
            : p
        )
      );
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

  const handleSharePage = (p: BrandPage) => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/pages/${p.id}`;
      navigator.clipboard.writeText(url);
      setCopiedPageId(p.id);
      setTimeout(() => setCopiedPageId(null), 2000);
    }
  };

  const pageTabs = [
    { id: "all", label: "All Pages" },
    { id: "liked", label: "Liked Pages" },
    { id: "owned", label: "Your Pages" },
    { id: "tech", label: "Technology" },
    { id: "design", label: "Design" },
  ];

  const filteredPages = pages.filter((p) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchCat = p.category.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchCat) return false;
    }
    if (activeFilter === "liked") return likedMap[p.id] ?? p.isLiked;
    if (activeFilter === "owned") return p.isOwner;
    if (activeFilter === "tech") return p.category.toLowerCase().includes("tech") || p.category.toLowerCase().includes("software");
    if (activeFilter === "design") return p.category.toLowerCase().includes("design") || p.category.toLowerCase().includes("art");
    return true;
  });

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

            {/* Search filter input */}
            <div className="relative">
              <Input
                placeholder="Search pages by name, category, or description..."
                leftIcon={<Search size={16} />}
                clearable
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#111827] border-[#1f2937] text-sm py-2.5"
              />
            </div>

            <Tabs
              tabs={pageTabs}
              activeTab={activeFilter}
              onChange={setActiveFilter}
              variant="line"
            />

            {filteredPages.length === 0 ? (
              <div className="py-16 text-center space-y-3 rounded-2xl border border-dashed border-[#1f2937] bg-[#111827]/40 p-8">
                <Flag size={36} className="mx-auto text-slate-500" />
                <h3 className="text-sm font-bold text-white">No pages found</h3>
                <p className="text-xs text-slate-400">
                  {searchQuery.trim()
                    ? `No pages matched your search for "${searchQuery}".`
                    : activeFilter === "liked"
                    ? "You haven't liked any pages yet. Discover and like pages to see them here!"
                    : activeFilter === "owned"
                    ? "You don't manage any brand pages yet. Click 'Create Page' to launch your first brand!"
                    : "No brand pages match the selected category filter."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPages.map((p) => {
                  const isLiked = likedMap[p.id] ?? p.isLiked;
                  return (
                    <Card key={p.id} hover className="flex flex-col justify-between group overflow-hidden">
                      <Link href={`/pages/${p.id}`} className="relative h-28 w-full overflow-hidden block">
                        <Image
                          src={p.cover}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          alt="cover"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
                        {p.isOwner && (
                          <div className="absolute top-2 right-2">
                            <Badge variant="success" size="sm">Admin</Badge>
                          </div>
                        )}
                      </Link>

                      <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div className="flex gap-3 items-start">
                          <Link href={`/pages/${p.id}`} className="-mt-8 z-10 block cursor-pointer">
                            <Avatar src={p.avatar} name={p.name} size="lg" className="border-2 border-[#111827] shadow-md" />
                          </Link>
                          <div className="flex-1 min-w-0">
                            <Link href={`/pages/${p.id}`} className="hover:text-blue-400 transition cursor-pointer">
                              <h3 className="text-sm font-bold text-white truncate hover:underline">{p.name}</h3>
                            </Link>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Badge variant="primary" size="sm">{p.category}</Badge>
                              {p.website && (
                                <a
                                  href={p.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-slate-400 hover:text-white transition"
                                  title={p.website}
                                >
                                  <Globe size={12} />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{p.description}</p>

                        <div className="flex items-center justify-between pt-2 border-t border-[#1f2937]/60">
                          <span className="text-xs text-slate-400 font-semibold">{p.likes.toLocaleString()} likes</span>
                          <div className="flex gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSharePage(p)}
                              className="text-slate-400 hover:text-white px-2"
                              title="Share Page Link"
                            >
                              {copiedPageId === p.id ? <Check size={13} className="text-emerald-400" /> : <Share2 size={13} />}
                            </Button>
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
            )}
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
