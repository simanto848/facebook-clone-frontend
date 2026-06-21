"use client";

import { useState } from "react";
import CreatePost from "@/components/features/post/CreatePost";
import PostCard from "@/components/features/post/PostCard";
import { usePostStore } from "@/store/postStore";
import {
  BadgeInfo,
  Pencil,
  Plus,
  Users,
  Grid,
  Image as ImageIcon,
  Heart,
  Bookmark,
  UserCheck,
} from "lucide-react";
import Image from "next/image";

export default function ProfilePage() {
  const { posts } = usePostStore();
  const [activeTab, setActiveTab] = useState<"posts" | "media" | "likes" | "saved" | "tagged">("posts");

  // User posts (Alex Rivers is 'alex')
  const userPosts = posts.filter((post) => post.author.username === "alex");

  // Media posts (images or videos)
  const mediaPosts = userPosts.filter((post) => post.type === "image" || post.type === "video");

  // Likes (posts user reacted to)
  const likedPosts = posts.filter((post) => !!post.userReaction);

  // Saved/Bookmarked posts
  const savedPosts = posts.filter((post) => post.saved);

  // Tagged posts (simulate tagged posts by choosing posts containing '@alex' or authored by others but visible on their tag wall)
  const taggedPosts = posts.filter(
    (post) => post.author.username !== "alex" && post.content.toLowerCase().includes("alex")
  );

  const renderActiveTabContent = () => {
    let list = userPosts;
    if (activeTab === "media") list = mediaPosts;
    else if (activeTab === "likes") list = likedPosts;
    else if (activeTab === "saved") list = savedPosts;
    else if (activeTab === "tagged") list = taggedPosts;

    if (list.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 rounded-2xl border border-dashed border-[#1f2937] bg-[#111827]/40">
          <p className="text-slate-400 font-semibold text-sm">No items found in this section</p>
          <p className="text-xs text-slate-500 max-w-xs">Items you post or interact with will display here.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {list.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    );
  };

  const tabs = [
    { id: "posts", label: "Posts", icon: Grid, count: userPosts.length },
    { id: "media", label: "Media", icon: ImageIcon, count: mediaPosts.length },
    { id: "likes", label: "Likes", icon: Heart, count: likedPosts.length },
    { id: "saved", label: "Saved", icon: Bookmark, count: savedPosts.length },
    { id: "tagged", label: "Tagged", icon: UserCheck, count: taggedPosts.length },
  ] as const;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* COVER + PROFILE HEADER */}
      <div className="relative">
        {/* Cover */}
        <div className="relative h-72 w-full overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=1800"
            alt="Cover"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Avatar */}
        <div className="absolute left-12 -bottom-16">
          <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-[#0f172a] shadow-[0_0_30px_rgba(59,130,246,0.4)] bg-[#111827]">
            <Image
              src="https://images.unsplash.com/photo-1779040622687-42bb00790c67?w=500"
              alt="Alex Morgan"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="px-12 pt-20 pb-4 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-white">Alex Morgan</h1>
          <p className="mt-1.5 text-md text-slate-400">
            @alex • Neo-Tokyo • Digital Architect
          </p>
        </div>

        <button className="flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-xs font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-600/10">
          <Pencil size={14} />
          Edit Profile
        </button>
      </div>

      {/* Profile Navigation Tabs Bar */}
      <div className="px-12 border-b border-[#1f2937]/80 bg-[#111827]/10 sticky top-0 z-30 backdrop-blur-xs">
        <div className="flex gap-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 py-4 px-1.5 border-b-2 text-xs font-bold transition-all relative
                  ${
                    isActive
                      ? "border-blue-500 text-blue-400 font-extrabold"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }
                `}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? "bg-blue-600/20 text-blue-400" : "bg-slate-800 text-slate-400"}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-4 md:px-12 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* LEFT SIDEBAR */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            {/* About */}
            <div className="rounded-2xl border border-[#1f2937] bg-[#111827] p-6 shadow-xl">
              <div className="mb-4 flex items-center gap-2">
                <BadgeInfo size={18} className="text-blue-400" />
                <h2 className="font-semibold">About</h2>
              </div>

              <p className="text-xs leading-6 text-slate-400">
                Designing the future of spatial interfaces. Obsessed with
                luminance, depth, and performance. Always exploring the
                intersection of brutalism and glassmorphism.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#1f2937] px-3 py-1 text-[10px] font-semibold text-slate-300">
                  UI/UX
                </span>
                <span className="rounded-full bg-[#1f2937] px-3 py-1 text-[10px] font-semibold text-slate-300">
                  WebGL
                </span>
                <span className="rounded-full bg-[#1f2937] px-3 py-1 text-[10px] font-semibold text-slate-300">
                  Systems
                </span>
              </div>
            </div>

            {/* Recent */}
            <div className="rounded-2xl border border-[#1f2937] bg-[#111827] p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-sm">Recent</h2>
                <button className="text-xs font-semibold text-blue-400">See All</button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="aspect-square rounded-xl bg-[#1f2937] relative overflow-hidden">
                  <Image src="https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=200" fill className="object-cover" alt="Recent 1" />
                </div>
                <div className="aspect-square rounded-xl bg-[#1f2937] relative overflow-hidden">
                  <Image src="https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=200" fill className="object-cover" alt="Recent 2" />
                </div>
                <div className="aspect-square rounded-xl bg-[#1f2937] relative overflow-hidden">
                  <Image src="https://images.unsplash.com/photo-1778192391493-7436d746b128?w=200" fill className="object-cover" alt="Recent 3" />
                </div>

                <button className="aspect-square rounded-xl bg-[#1f2937] flex items-center justify-center hover:bg-[#263247] transition">
                  <Plus />
                </button>
              </div>
            </div>
          </div>

          {/* CENTER */}
          <div className="col-span-12 lg:col-span-6 space-y-6">
            {activeTab === "posts" && <CreatePost />}
            {renderActiveTabContent()}
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            <div className="rounded-2xl border border-[#1f2937] bg-[#111827] p-6 shadow-xl">
              <div className="mb-5 flex items-center gap-2">
                <Users size={18} className="text-blue-400" />
                <h2 className="font-semibold">Top Connections</h2>
              </div>

              <div className="space-y-4">
                {[
                  { name: "Sarah Chen", avatar: "https://images.unsplash.com/photo-1780570589435-059359e813cc?q=80&w=100&auto=format&fit=crop" },
                  { name: "David Kim", avatar: "https://images.unsplash.com/photo-1780764895105-ea3037466236?q=80&w=100&auto=format&fit=crop" },
                  { name: "Elena Rostova", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" }
                ].map((user) => (
                  <div key={user.name} className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#1f2937] relative overflow-hidden border border-[#1f2937]">
                      <Image
                        src={user.avatar}
                        fill
                        className="object-cover"
                        alt={user.name}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Product Designer</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#1f2937] bg-[#111827] p-6 shadow-xl">
              <h2 className="mb-4 font-semibold text-sm">Guilds</h2>
              <div className="space-y-3 text-xs">
                <div className="rounded-xl bg-[#1f2937] p-3 font-semibold text-slate-300">UI Brutalists</div>
                <div className="rounded-xl bg-[#1f2937] p-3 font-semibold text-slate-300">
                  Core Infrastructure
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
