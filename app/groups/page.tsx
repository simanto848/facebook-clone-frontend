"use client";

import React, { useState } from "react";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import PostCard from "@/components/features/post/PostCard";
import { usePostStore } from "@/store/postStore";
import { Plus, X, Users, Compass, ShieldAlert, Sparkles } from "lucide-react";
import Image from "next/image";

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
  const [joinedGuilds, setJoinedGuilds] = useState<Record<string, boolean>>({ g1: true }); // Mock UI Brutalists joined initially
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Guild Form
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Design");
  const [description, setDescription] = useState("");
  const [avatar, setAvatar] = useState("");

  const handleCreateGuild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newGuild: Guild = {
      id: `g_${Math.random().toString(36).substring(7)}`,
      name,
      avatar: avatar || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=100",
      cover: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=500",
      members: "1",
      category,
      description,
    };

    setGuilds([...guilds, newGuild]);
    setJoinedGuilds((prev) => ({ ...prev, [newGuild.id]: true }));
    setShowCreateModal(false);

    // Reset
    setName("");
    setDescription("");
    setAvatar("");
  };

  const toggleJoin = (guildId: string) => {
    setJoinedGuilds((prev) => ({
      ...prev,
      [guildId]: !prev[guildId],
    }));
  };

  // Get posts relevant to the active guild
  const getGuildPosts = (guildName: string) => {
    // If the post matches tags, author, or content keyword related to the guild
    if (guildName === "UI Brutalists") {
      return posts.filter((p) => p.content.toLowerCase().includes("brutalis") || p.author.username === "sarahc");
    }
    if (guildName === "Core Infrastructure") {
      return posts.filter((p) => p.content.toLowerCase().includes("websock") || p.content.toLowerCase().includes("server") || p.author.username === "elena");
    }
    if (guildName === "Tokyo Creative Club") {
      return posts.filter((p) => p.content.toLowerCase().includes("neon") || p.author.username === "davidk");
    }
    return posts.slice(0, 2); // Fallback mock posts for newly created guilds
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <div className="flex">
        {/* LEFT SIDEBAR */}
        <aside className="w-72 shrink-0">
          <LeftSidebar />
        </aside>

        {/* MAIN FEED */}
        <main className="flex-1 flex justify-center">
          <div className="w-full max-w-3xl px-6 py-6 space-y-6">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-[#1f2937] pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-400">
                  <Users size={20} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Guilds & Groups Hub</h1>
                  <p className="text-xs text-slate-400">Explore and participate in developer communities</p>
                </div>
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-xs font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-600/10"
              >
                <Plus size={14} />
                <span>Create Guild</span>
              </button>
            </div>

            {selectedGuild ? (
              /* INDIVIDUAL GUILD VIEW */
              <div className="space-y-6">
                {/* Cover Banner */}
                <div className="relative h-44 rounded-2xl overflow-hidden border border-[#1f2937]">
                  <Image src={selectedGuild.cover} fill className="object-cover" alt={selectedGuild.name} />
                  <div className="absolute inset-0 bg-black/50" />
                  <button
                    onClick={() => setSelectedGuild(null)}
                    className="absolute top-4 left-4 z-10 px-3 py-1 bg-black/60 hover:bg-black/80 text-xs font-semibold rounded-full border border-slate-700 transition"
                  >
                    ← Back to Browse
                  </button>
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 rounded-xl overflow-hidden border-2 border-white/20">
                        <Image src={selectedGuild.avatar} fill className="object-cover" alt="Guild avatar" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white leading-tight">{selectedGuild.name}</h2>
                        <p className="text-[10px] text-slate-300 mt-0.5">{selectedGuild.members} members • {selectedGuild.category}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleJoin(selectedGuild.id)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                        joinedGuilds[selectedGuild.id] ? "bg-slate-800 text-slate-300" : "bg-blue-600 text-white"
                      }`}
                    >
                      {joinedGuilds[selectedGuild.id] ? "Joined" : "Join Guild"}
                    </button>
                  </div>
                </div>

                {/* About and Feed split */}
                <div className="space-y-4">
                  <div className="rounded-xl border border-[#1f2937] bg-[#111827] p-4 text-xs text-slate-400 leading-relaxed">
                    <span className="font-bold text-slate-200 block mb-1">About Guild</span>
                    {selectedGuild.description}
                  </div>

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
                  <span className="text-xs font-bold tracking-wider uppercase text-slate-400 block">Your Guilds</span>
                  <div className="grid grid-cols-2 gap-4">
                    {guilds
                      .filter((g) => joinedGuilds[g.id])
                      .map((guild) => (
                        <div
                          key={guild.id}
                          onClick={() => setSelectedGuild(guild)}
                          className="flex items-center justify-between p-4 rounded-xl border border-[#1f2937] bg-[#111827]/40 hover:bg-[#1f2937]/80 hover:cursor-pointer transition duration-150"
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 rounded-xl overflow-hidden">
                              <Image src={guild.avatar} fill className="object-cover" alt={guild.name} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-white truncate max-w-[120px]">{guild.name}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{guild.members} members</p>
                            </div>
                          </div>
                          <span className="text-[10px] text-blue-400 font-bold">Open</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Explore/Suggested Guilds Grid */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-[#1f2937] pb-3">
                    <Compass size={16} className="text-blue-400" />
                    <span className="text-xs font-bold tracking-wider uppercase text-slate-400">Suggested Communities</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {guilds.map((guild) => {
                      const isJoined = !!joinedGuilds[guild.id];
                      return (
                        <div
                          key={guild.id}
                          className="rounded-2xl border border-[#1f2937] bg-[#111827] overflow-hidden flex flex-col justify-between"
                        >
                          <div className="relative h-20 w-full">
                            <Image src={guild.cover} fill className="object-cover" alt="cover" />
                            <div className="absolute inset-0 bg-black/40" />
                          </div>
                          <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                            <div className="flex gap-3 items-start">
                              <div className="relative h-9 w-9 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-[#0f172a] -mt-8 z-10">
                                <Image src={guild.avatar} fill className="object-cover" alt="avatar" />
                              </div>
                              <div>
                                <h3
                                  onClick={() => setSelectedGuild(guild)}
                                  className="text-sm font-bold text-white hover:underline hover:cursor-pointer transition"
                                >
                                  {guild.name}
                                </h3>
                                <span className="text-[9px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full mt-1 inline-block">
                                  {guild.category}
                                </span>
                              </div>
                            </div>

                            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{guild.description}</p>

                            <div className="flex justify-between items-center pt-2">
                              <span className="text-[10px] text-slate-500">{guild.members} members</span>
                              <button
                                onClick={() => toggleJoin(guild.id)}
                                className={`rounded-full px-4 py-1.5 text-[10px] font-bold transition ${
                                  isJoined ? "bg-slate-800 text-slate-300" : "bg-blue-600 text-white"
                                }`}
                              >
                                {isJoined ? "Joined" : "Join"}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="w-80 shrink-0">
          <RightSidebar />
        </aside>
      </div>

      {/* CREATE GUILD MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setShowCreateModal(false)} />
          <form
            onSubmit={handleCreateGuild}
            className="relative z-10 w-full max-w-md rounded-2xl border border-[#1f2937] bg-[#111827] p-6 shadow-2xl space-y-4 text-white"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">Create Guild</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-[#1f2937] hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300">Guild Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rust Enthusiasts"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-[#1f2937] bg-[#0f172a] px-3.5 py-2.5 outline-none focus:border-blue-500 transition"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-11 rounded-xl border border-[#1f2937] bg-[#0f172a] px-3.5 outline-none focus:border-blue-500 transition"
                >
                  <option value="Design">Design</option>
                  <option value="Systems">Systems</option>
                  <option value="Photography">Photography</option>
                  <option value="Gaming">Gaming</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300">Logo/Avatar URL</label>
                <input
                  type="text"
                  placeholder="Image URL..."
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full rounded-xl border border-[#1f2937] bg-[#0f172a] px-3.5 py-2.5 outline-none focus:border-blue-500 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300">Description</label>
                <textarea
                  placeholder="What is this guild about?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-20 rounded-xl border border-[#1f2937] bg-[#0f172a] p-3 outline-none resize-none focus:border-blue-500 transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-lg shadow-blue-600/10"
            >
              Start Guild
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
