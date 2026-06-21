"use client";

import React, { useState, use } from "react";
import PostCard from "@/components/features/post/PostCard";
import { usePostStore } from "@/store/postStore";
import { useChatStore } from "@/store/chatStore";
import {
  BadgeInfo,
  Grid,
  Image as ImageIcon,
  Heart,
  UserCheck,
  MessageSquare,
  UserPlus,
  ArrowLeft,
  Users,
  Plus,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Mock database for specific users
const mockUsersDb: Record<
  string,
  {
    name: string;
    username: string;
    avatar: string;
    cover: string;
    bio: string;
    role: string;
    skills: string[];
  }
> = {
  sarahc: {
    name: "Sarah Chen",
    username: "sarahc",
    avatar: "https://images.unsplash.com/photo-1780570589435-059359e813cc?q=80&w=400",
    cover: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1800",
    bio: "Designing fluid systems and motion interfaces. Ex-Stripe, ex-Apple. Obsessed with high frame rates and micro-interactions.",
    role: "Fluid Systems Designer",
    skills: ["Figma", "Framer", "React", "Motion"],
  },
  davidk: {
    name: "David Kim",
    username: "davidk",
    avatar: "https://images.unsplash.com/photo-1780764895105-ea3037466236?q=80&w=400",
    cover: "https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?w=1800",
    bio: "Tokyo-based street photographer & 3D renderer. Catching contrast and neon lights in rain-slicked alleyways.",
    role: "Digital Artist & Photographer",
    skills: ["Photography", "Blender", "Lightroom", "Spline"],
  },
  elena: {
    name: "Elena Rostova",
    username: "elena",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    cover: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1800",
    bio: "Full stack software engineer and systems architect. Specializing in Node.js, database security, and cloud scalability.",
    role: "Core Infrastructure Lead",
    skills: ["Next.js", "Docker", "PostgreSQL", "Go"],
  },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function UserProfilePage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  const { posts } = usePostStore();
  const { openChat } = useChatStore();

  const [activeTab, setActiveTab] = useState<"posts" | "media" | "likes" | "tagged">("posts");
  const [isFollowing, setIsFollowing] = useState(false);

  // Fetch or fallback user info
  const profileUser = mockUsersDb[id] || {
    name: id.charAt(0).toUpperCase() + id.slice(1),
    username: id,
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400",
    cover: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=1800",
    bio: "Digital creator on Your World. Sharing layouts and digital snippets.",
    role: "Creator",
    skills: ["Creator", "Web3", "UI"],
  };

  // Filter posts authored by this specific user
  const userPosts = posts.filter((post) => post.author.username === id);

  // Media posts (images or videos)
  const mediaPosts = userPosts.filter((post) => post.type === "image" || post.type === "video");

  // Likes (posts where this user reacted, we can mock it by filtering some posts or likes)
  const likedPosts = posts.filter((post) => post.author.username !== id && post.reactions.like > 10);

  // Tagged posts (posts mentioning this username or written about them)
  const taggedPosts = posts.filter(
    (post) => post.author.username !== id && post.content.toLowerCase().includes(profileUser.name.toLowerCase())
  );

  const handleMessageClick = () => {
    openChat({
      id: id,
      name: profileUser.name,
      avatar: profileUser.avatar,
    });
  };

  const renderActiveTabContent = () => {
    let list = userPosts;
    if (activeTab === "media") list = mediaPosts;
    else if (activeTab === "likes") list = likedPosts;
    else if (activeTab === "tagged") list = taggedPosts;

    if (list.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 rounded-2xl border border-dashed border-[#1f2937] bg-[#111827]/40">
          <p className="text-slate-400 font-semibold text-sm">No posts to display</p>
          <p className="text-xs text-slate-500 max-w-xs">This user hasn't posted anything in this category yet.</p>
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
    { id: "tagged", label: "Tagged", icon: UserCheck, count: taggedPosts.length },
  ] as const;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* COVER + PROFILE HEADER */}
      <div className="relative">
        {/* Back navigation */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 z-40 h-9 w-9 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white backdrop-blur-xs transition"
        >
          <ArrowLeft size={16} />
        </button>

        {/* Cover */}
        <div className="relative h-72 w-full overflow-hidden">
          <Image
            src={profileUser.cover}
            alt="Cover"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Avatar */}
        <div className="absolute left-12 -bottom-16">
          <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-[#0f172a] shadow-[0_0_30px_rgba(59,130,246,0.3)] bg-[#111827]">
            <Image
              src={profileUser.avatar}
              alt={profileUser.name}
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* User Info & Actions */}
      <div className="px-12 pt-20 pb-4 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-white">{profileUser.name}</h1>
          <p className="mt-1.5 text-md text-slate-400">
            @{profileUser.username} • {profileUser.role}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setIsFollowing(!isFollowing)}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition shadow-lg ${
              isFollowing
                ? "bg-slate-800 border border-[#1f2937] text-slate-300 hover:bg-slate-700"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/10"
            }`}
          >
            {isFollowing ? (
              <>
                <UserCheck size={14} />
                <span>Following</span>
              </>
            ) : (
              <>
                <UserPlus size={14} />
                <span>Follow</span>
              </>
            )}
          </button>

          <button
            onClick={handleMessageClick}
            className="flex items-center gap-2 rounded-full bg-slate-800 border border-[#1f2937] px-5 py-2.5 text-xs font-bold hover:bg-slate-700 transition"
          >
            <MessageSquare size={14} />
            <span>Message</span>
          </button>
        </div>
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
      <div className="px-12 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* LEFT SIDEBAR */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            {/* About */}
            <div className="rounded-2xl border border-[#1f2937] bg-[#111827] p-6 shadow-xl">
              <div className="mb-4 flex items-center gap-2">
                <BadgeInfo size={18} className="text-blue-400" />
                <h2 className="font-semibold text-sm">About</h2>
              </div>

              <p className="text-xs leading-6 text-slate-400">{profileUser.bio}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                {profileUser.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-[#1f2937] px-3 py-1 text-[10px] font-semibold text-slate-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Recent Photos */}
            <div className="rounded-2xl border border-[#1f2937] bg-[#111827] p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-sm">Photos</h2>
                <button className="text-xs font-semibold text-blue-400">See All</button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="aspect-square rounded-xl bg-[#1f2937] relative overflow-hidden">
                  <Image src={profileUser.cover} fill className="object-cover" alt="Recent photo 1" />
                </div>
                <div className="aspect-square rounded-xl bg-[#1f2937] relative overflow-hidden">
                  <Image src={profileUser.avatar} fill className="object-cover" alt="Recent photo 2" />
                </div>
              </div>
            </div>
          </div>

          {/* CENTER FEED */}
          <div className="col-span-12 lg:col-span-6 space-y-6">
            {renderActiveTabContent()}
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            {/* Top Connections */}
            <div className="rounded-2xl border border-[#1f2937] bg-[#111827] p-6 shadow-xl">
              <div className="mb-5 flex items-center gap-2">
                <Users size={18} className="text-blue-400" />
                <h2 className="font-semibold text-sm">Top Connections</h2>
              </div>

              <div className="space-y-4">
                {["Alex Morgan", "Elena Rostova"].map((user) => (
                  <div key={user} className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#1f2937] relative overflow-hidden">
                      <Image
                        src={
                          user === "Alex Morgan"
                            ? "https://images.unsplash.com/photo-1779040622687-42bb00790c67?w=100"
                            : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
                        }
                        fill
                        className="object-cover"
                        alt={user}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Mutual Connection</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
