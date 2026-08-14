"use client";

import React, { useState, useEffect } from "react";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import PostCard from "@/components/features/post/PostCard";
import { usePostStore } from "@/store/postStore";
import { Plus, Users, Compass, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { groupService } from "@/services/groupService";
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

interface Guild {
  id: string;
  name: string;
  avatar: string;
  cover: string;
  members: string;
  category: string;
  description: string;
}

const initialGuilds: Guild[] = [
  {
    id: "g1",
    name: "UI Brutalists",
    avatar: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=100",
    cover: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=500",
    members: "12.4k",
    category: "Design",
    description: "Designing the future of brutalist interfaces and heavy typography alignments.",
  },
  {
    id: "g2",
    name: "Core Infrastructure",
    avatar: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=100",
    cover: "https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?w=500",
    members: "8.2k",
    category: "Systems",
    description: "Low level architecture discussions, server performance, and Docker containers scaling.",
  },
  {
    id: "g3",
    name: "Tokyo Creative Club",
    avatar: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=100",
    cover: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=500",
    members: "3.5k",
    category: "Photography",
    description: "Tokyo street photographers sharing visual layouts, presets, and focal lengths.",
  },
];

export default function GroupsPage() {
  const { posts } = usePostStore();
  const [guilds, setGuilds] = useState<Guild[]>(initialGuilds);
  const [selectedGuild, setSelectedGuild] = useState<Guild | null>(null);
  const [joinedGuilds, setJoinedGuilds] = useState<Record<string, boolean>>({ g1: true });
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Guild Form
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Design");
  const [description, setDescription] = useState("");
  const [avatar, setAvatar] = useState("");

  const fetchBackendGroups = async () => {
    try {
      const res = await groupService.getJoinedGroups();
      const items = res.data || res || [];
      if (Array.isArray(items) && items.length > 0) {
        const fetched: Guild[] = items.map((g: any) => ({
          id: g.id,
          name: g.name,
          avatar: g.avatar || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=100",
          cover: g.cover || "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=500",
          members: `${g._count?.members || 1}`,
          category: g.category || "Community",
          description: g.description || "",
        }));
        setGuilds(fetched);
        const joinedMap: Record<string, boolean> = {};
        fetched.forEach((g) => (joinedMap[g.id] = true));
        setJoinedGuilds(joinedMap);
      }
    } catch (err) {
      console.error("Using local fallback groups:", err);
    }
  };

  useEffect(() => {
    fetchBackendGroups();
  }, []);

  const handleCreateGuild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const res = await groupService.createGroup({
        name,
        description,
        category,
        avatar: avatar || undefined,
      });
      const created = res.data || res;
      const newGuild: Guild = {
        id: created.id || `g_${Date.now()}`,
        name: created.name || name,
        avatar: avatar || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=100",
        cover: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=500",
        members: "1",
        category,
        description,
      };

      setGuilds((prev) => [newGuild, ...prev]);
      setJoinedGuilds((prev) => ({ ...prev, [newGuild.id]: true }));
      setName("");
      setDescription("");
      setAvatar("");
      setShowCreateModal(false);
    } catch (err) {
      console.error("Create group error:", err);
    }
  };

  const toggleJoin = async (guildId: string) => {
    const isJoined = joinedGuilds[guildId];
    setJoinedGuilds((prev) => ({ ...prev, [guildId]: !isJoined }));

    try {
      if (isJoined) {
        await groupService.leaveGroup(guildId);
      } else {
        await groupService.joinGroup(guildId);
      }
    } catch (err) {
      console.error("Group join/leave API error:", err);
    }
  };

  const getGuildPosts = (guildName: string) => {
    if (guildName === "UI Brutalists") {
      return posts.filter((p) => p.content.toLowerCase().includes("brutalis") || p.author.username === "sarahc");
    }
    if (guildName === "Core Infrastructure") {
      return posts.filter((p) => p.content.toLowerCase().includes("websock") || p.content.toLowerCase().includes("server") || p.author.username === "elena");
    }
    if (guildName === "Tokyo Creative Club") {
      return posts.filter((p) => p.content.toLowerCase().includes("neon") || p.author.username === "davidk");
    }
    return posts.slice(0, 2);
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
              title="Guilds & Groups Hub"
              description="Explore communities, design hubs, and developer guilds."
              icon={<Users size={22} />}
              actions={
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus size={14} />}
                  onClick={() => setShowCreateModal(true)}
                >
                  Create Guild
                </Button>
              }
            />

            {selectedGuild ? (
              /* INDIVIDUAL GUILD VIEW */
              <div className="space-y-6">
                {/* Cover Banner */}
                <div className="relative h-48 rounded-2xl overflow-hidden border border-[#1f2937] shadow-xl">
                  <Image src={selectedGuild.cover} fill sizes="100vw" className="object-cover" alt={selectedGuild.name} />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute top-4 left-4 z-10">
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<ArrowLeft size={14} />}
                      onClick={() => setSelectedGuild(null)}
                    >
                      Back to Browse
                    </Button>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar src={selectedGuild.avatar} name={selectedGuild.name} size="xl" />
                      <div>
                        <h2 className="text-xl font-bold text-white leading-tight">{selectedGuild.name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="primary" size="sm">{selectedGuild.members} members</Badge>
                          <Badge variant="outline" size="sm">{selectedGuild.category}</Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant={joinedGuilds[selectedGuild.id] ? "secondary" : "primary"}
                      size="sm"
                      onClick={() => toggleJoin(selectedGuild.id)}
                    >
                      {joinedGuilds[selectedGuild.id] ? "Joined" : "Join Guild"}
                    </Button>
                  </div>
                </div>

                {/* About and Feed split */}
                <div className="space-y-4">
                  <Card>
                    <CardContent className="space-y-1">
                      <span className="font-bold text-white block text-sm">About Guild</span>
                      <p className="text-xs text-slate-300 leading-relaxed">{selectedGuild.description}</p>
                    </CardContent>
                  </Card>

                  <div className="space-y-6">
                    {getGuildPosts(selectedGuild.name).map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* BROWSE GUILDS GRID */
              <div className="space-y-6">
                {/* Joined Guilds Drawer */}
                <div className="space-y-3">
                  <span className="text-xs font-bold tracking-wider uppercase text-slate-400 block">Your Joined Guilds</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {guilds
                      .filter((g) => joinedGuilds[g.id])
                      .map((guild) => (
                        <Card
                          key={guild.id}
                          hover
                          onClick={() => setSelectedGuild(guild)}
                          className="cursor-pointer"
                        >
                          <CardContent className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                              <Avatar src={guild.avatar} name={guild.name} size="lg" />
                              <div className="space-y-0.5">
                                <p className="text-sm font-bold text-white truncate max-w-[140px]">{guild.name}</p>
                                <p className="text-xs text-slate-400">{guild.members} members</p>
                              </div>
                            </div>
                            <Badge variant="primary" size="sm">Open</Badge>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>

                {/* Explore Guilds Grid */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-[#1f2937] pb-3">
                    <Compass size={16} className="text-blue-400" />
                    <span className="text-xs font-bold tracking-wider uppercase text-slate-400">Suggested Communities</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {guilds.map((guild) => (
                      <Card key={guild.id} hover className="flex flex-col justify-between">
                        <CardContent className="space-y-3">
                          <div className="flex items-start gap-3">
                            <Avatar src={guild.avatar} name={guild.name} size="lg" />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-white text-sm leading-tight truncate">{guild.name}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" size="sm">{guild.category}</Badge>
                                <span className="text-xs text-slate-400">{guild.members} members</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{guild.description}</p>
                        </CardContent>

                        <div className="px-5 py-3 border-t border-[#1f2937]/60 flex gap-2">
                          <Button
                            variant={joinedGuilds[guild.id] ? "secondary" : "primary"}
                            fullWidth
                            size="sm"
                            onClick={() => toggleJoin(guild.id)}
                          >
                            {joinedGuilds[guild.id] ? "Joined" : "Join Guild"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedGuild(guild)}
                          >
                            View
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="hidden xl:block w-80 shrink-0">
          <RightSidebar />
        </aside>
      </div>

      {/* CREATE GUILD MODAL DIALOG */}
      <Dialog
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Guild"
      >
        <form onSubmit={handleCreateGuild} className="space-y-4">
          <Input
            label="Guild Name"
            placeholder="e.g. Rust Enthusiasts"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={[
              { label: "Design", value: "Design" },
              { label: "Systems", value: "Systems" },
              { label: "Photography", value: "Photography" },
              { label: "Gaming", value: "Gaming" },
            ]}
          />

          <Input
            label="Avatar URL"
            placeholder="https://images.unsplash.com/..."
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
          />

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 block">Description</label>
            <textarea
              placeholder="What is this guild about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              Start Guild
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
