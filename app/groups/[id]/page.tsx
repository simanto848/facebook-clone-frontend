"use client";

import React, { useState, useEffect, use } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users, Shield, Plus } from "lucide-react";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import PostCard from "@/components/features/post/PostCard";
import { usePostStore } from "@/store/postStore";
import { groupService } from "@/services/groupService";
import {
  Button,
  Badge,
  Card,
  CardContent,
  Avatar,
  Loader,
} from "@/components/ui";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function GroupDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  const { posts } = usePostStore();
  const [group, setGroup] = useState<any>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroup = async () => {
      setLoading(true);
      try {
        const res = await groupService.getGroupById(id);
        const data = res.data || res;
        if (data) {
          setGroup(data);
          setIsJoined(Boolean(data.isMember));
        }
      } catch (err) {
        console.error("Fetch group detail error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGroup();
  }, [id]);

  const toggleJoin = async () => {
    const nextJoined = !isJoined;
    setIsJoined(nextJoined);
    try {
      if (nextJoined) {
        await groupService.joinGroup(id);
      } else {
        await groupService.leaveGroup(id);
      }
    } catch (err) {
      console.error("Group toggle join error:", err);
    }
  };

  const groupPosts = posts.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <div className="flex">
        {/* LEFT SIDEBAR */}
        <aside className="hidden lg:block w-72 shrink-0">
          <LeftSidebar />
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 flex justify-center">
          <div className="w-full max-w-3xl px-6 py-6 space-y-6">
            {loading ? (
              <div className="py-20 text-center">
                <Loader label="Loading group details..." />
              </div>
            ) : group ? (
              <div className="space-y-6">
                {/* Cover Banner */}
                <div className="relative h-52 rounded-3xl overflow-hidden border border-[#1f2937] shadow-2xl">
                  <Image
                    src={group.cover || "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=800"}
                    fill
                    sizes="100vw"
                    className="object-cover"
                    alt={group.name}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />

                  <div className="absolute top-4 left-4 z-10">
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<ArrowLeft size={14} />}
                      onClick={() => router.back()}
                    >
                      Back
                    </Button>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between z-10">
                    <div className="flex items-center gap-4">
                      <Avatar
                        src={group.avatar || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=120"}
                        name={group.name}
                        size="xl"
                      />
                      <div>
                        <h1 className="text-2xl font-bold text-white leading-tight drop-shadow-md">{group.name}</h1>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="primary" size="sm">{group.category || "Community"}</Badge>
                          <span className="text-xs text-slate-300 font-semibold">{group._count?.members || 12} members</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant={isJoined ? "secondary" : "primary"}
                      size="sm"
                      onClick={toggleJoin}
                      className={isJoined ? "" : "bg-blue-600 hover:bg-blue-500"}
                    >
                      {isJoined ? "Joined" : "Join Group"}
                    </Button>
                  </div>
                </div>

                {/* About Guild */}
                <Card>
                  <CardContent className="space-y-2 p-5">
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      <Shield size={16} className="text-blue-400" />
                      About this Group
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {group.description || "Welcome to our group community! Share code snippets, designs, and developer discussions."}
                    </p>
                  </CardContent>
                </Card>

                {/* Group Timeline Feed */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-white">Group Feed</h3>
                    <Button variant="primary" size="sm" leftIcon={<Plus size={14} />}>
                      New Post
                    </Button>
                  </div>

                  {groupPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-20 text-center space-y-3">
                <Users size={40} className="mx-auto text-slate-500" />
                <h3 className="text-lg font-bold text-white">Group Not Found</h3>
                <Button variant="secondary" onClick={() => router.push("/groups")}>
                  Return to Groups Hub
                </Button>
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
