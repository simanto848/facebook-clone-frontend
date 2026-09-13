"use client";

import React, { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  UserCheck,
  MessageSquare,
  ArrowLeft,
  Grid,
  Image as ImageIcon,
  Users,
  MapPin,
  Calendar,
  Globe,
  Sparkles,
} from "lucide-react";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import PostCard from "@/components/features/post/PostCard";
import { userService } from "@/services/userService";
import { friendshipService } from "@/services/friendshipService";
import { usePostStore, mapBackendPostToPostType, PostType } from "@/store/postStore";
import { useAuthStore } from "@/store/authStore";
import { Button, Badge, Card, CardContent, Avatar, Loader, EmptyState } from "@/components/ui";

interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

export default function UserProfileDetailPage({ params }: ProfilePageProps) {
  const router = useRouter();
  const { id: rawId } = use(params);
  const { user: currentAuthUser } = useAuthStore();
  const { posts: storePosts } = usePostStore();

  const [user, setUser] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"posts" | "media" | "connections">("posts");
  const [friendStatus, setFriendStatus] = useState<"none" | "sent" | "friends">("none");
  const [isFollowing, setIsFollowing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        let userData: any = null;
        try {
          const res = await userService.getUserById(rawId);
          userData = res.data?.user || res.data || res;
        } catch {
          // If by ID fails, attempt by username
          const resUser = await userService.getUserByUsername(rawId);
          userData = resUser.data?.user || resUser.data || resUser;
        }

        if (userData) {
          setUser(userData);
          setIsFollowing(Boolean(userData.isFollowing));
          if (userData.isFriend) setFriendStatus("friends");
          else if (userData.hasPendingRequest) setFriendStatus("sent");

          // Fetch dynamic posts for this user
          try {
            const pRes = await userService.getUserPosts(userData.id);
            const items = pRes.data?.posts || pRes.data || pRes.posts || pRes || [];
            if (Array.isArray(items) && items.length > 0) {
              setUserPosts(items.map(mapBackendPostToPostType));
            } else {
              const matched = storePosts.filter(
                (p) => p.author.username === userData.username || (p.author as any).id === userData.id
              );
              setUserPosts(matched);
            }
          } catch {
            const matched = storePosts.filter(
              (p) => p.author.username === userData.username || (p.author as any).id === userData.id
            );
            setUserPosts(matched);
          }
        }
      } catch (err) {
        console.error("Fetch user profile error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [rawId, storePosts]);

  const handleFriendAction = async () => {
    if (!user?.id || actionLoading) return;
    setActionLoading(true);
    try {
      if (friendStatus === "none") {
        await friendshipService.sendFriendRequest(user.id);
        setFriendStatus("sent");
      } else if (friendStatus === "friends") {
        await friendshipService.unfriend(user.id);
        setFriendStatus("none");
      } else if (friendStatus === "sent") {
        setFriendStatus("none");
      }
    } catch (err) {
      console.error("Friend action error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!user?.id || actionLoading) return;
    setActionLoading(true);
    try {
      if (isFollowing) {
        await friendshipService.unfollowUser(user.id);
        setIsFollowing(false);
      } else {
        await friendshipService.followUser(user.id);
        setIsFollowing(true);
      }
    } catch (err) {
      console.error("Follow toggle error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center">
        <Loader label="Loading user profile..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white p-8">
        <EmptyState
          icon={<Users size={40} className="text-slate-500" />}
          title="User not found"
          description="The user profile you are looking for does not exist or has been deactivated."
          action={<Button onClick={() => router.push("/")}>Return to Feed</Button>}
        />
      </div>
    );
  }

  const isCurrentUser = currentAuthUser?.id === user.id || currentAuthUser?.username === user.username;
  const displayName = user.displayName || user.name || user.username;
  const avatarUrl = user.avatar || user.profilePicture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500";
  const coverPhoto = user.coverPhoto || "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=1800";

  const mediaPosts = userPosts.filter(
    (p) => p.type === "image" || p.type === "video" || (p.images && p.images.length > 0) || !!p.video
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <div className="flex">
        {/* LEFT SIDEBAR */}
        <aside className="hidden lg:block w-72 shrink-0">
          <LeftSidebar />
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 flex justify-center pb-12">
          <div className="w-full max-w-4xl px-6 py-6 space-y-6">
            {/* Top Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<ArrowLeft size={16} />}
                onClick={() => router.back()}
                className="text-slate-400 hover:text-white"
              >
                Back
              </Button>
            </div>

            {/* Profile Header Banner */}
            <div className="relative rounded-2xl overflow-hidden border border-[#1f2937] bg-[#111827] shadow-2xl">
              {/* Cover Photo */}
              <div className="relative h-60 w-full overflow-hidden">
                <Image
                  src={coverPhoto}
                  alt={displayName}
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40" />
              </div>

              {/* Profile Details Bar */}
              <div className="relative px-6 pb-6 pt-4 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                {/* Avatar overlapping */}
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16 sm:-mt-20">
                  <div className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-full overflow-hidden border-4 border-[#0f172a] shadow-xl bg-[#111827] shrink-0">
                    <Image
                      src={avatarUrl}
                      alt={displayName}
                      fill
                      sizes="128px"
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
                      {displayName}
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-400">@{user.username}</p>
                    {user.bio && (
                      <p className="text-xs text-slate-300 max-w-md pt-1 leading-relaxed">{user.bio}</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {!isCurrentUser && (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                      variant={friendStatus === "friends" ? "secondary" : "primary"}
                      size="sm"
                      leftIcon={friendStatus === "friends" ? <UserCheck size={14} /> : <UserPlus size={14} />}
                      onClick={handleFriendAction}
                      disabled={actionLoading}
                      className="flex-1 sm:flex-none"
                    >
                      {friendStatus === "friends"
                        ? "Friends"
                        : friendStatus === "sent"
                        ? "Request Sent"
                        : "Add Friend"}
                    </Button>

                    <Button
                      variant={isFollowing ? "secondary" : "ghost"}
                      size="sm"
                      onClick={handleFollowToggle}
                      disabled={actionLoading}
                      className="flex-1 sm:flex-none border border-[#1f2937]"
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<MessageSquare size={14} />}
                      onClick={() => router.push("/messages")}
                      className="border border-[#1f2937] text-blue-400 hover:bg-blue-600/10"
                    >
                      Message
                    </Button>
                  </div>
                )}
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 border-t border-[#1f2937]/80 bg-[#111827]/60 py-3 text-center text-xs">
                <div>
                  <p className="font-extrabold text-base text-white">{userPosts.length}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Posts</p>
                </div>
                <div>
                  <p className="font-extrabold text-base text-white">{user.followersCount || user._count?.followers || 0}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Followers</p>
                </div>
                <div>
                  <p className="font-extrabold text-base text-white">{user.followingCount || user._count?.following || 0}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Following</p>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-4 border-b border-[#1f2937] pb-2">
              <button
                onClick={() => setActiveTab("posts")}
                className={`flex items-center gap-1.5 pb-2 text-xs font-bold transition cursor-pointer ${
                  activeTab === "posts"
                    ? "border-b-2 border-blue-500 text-blue-400"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Grid size={14} />
                Posts ({userPosts.length})
              </button>
              <button
                onClick={() => setActiveTab("media")}
                className={`flex items-center gap-1.5 pb-2 text-xs font-bold transition cursor-pointer ${
                  activeTab === "media"
                    ? "border-b-2 border-blue-500 text-blue-400"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <ImageIcon size={14} />
                Media ({mediaPosts.length})
              </button>
              <button
                onClick={() => setActiveTab("connections")}
                className={`flex items-center gap-1.5 pb-2 text-xs font-bold transition cursor-pointer ${
                  activeTab === "connections"
                    ? "border-b-2 border-blue-500 text-blue-400"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Users size={14} />
                Connections
              </button>
            </div>

            {/* Tab Contents */}
            {activeTab === "posts" && (
              <div className="space-y-6">
                {userPosts.length === 0 ? (
                  <EmptyState
                    icon={<Grid size={36} className="text-slate-500" />}
                    title="No posts yet"
                    description={`${displayName} has not published any posts to their timeline.`}
                  />
                ) : (
                  userPosts.map((post) => <PostCard key={post.id} post={post} />)
                )}
              </div>
            )}

            {activeTab === "media" && (
              <div className="space-y-6">
                {mediaPosts.length === 0 ? (
                  <EmptyState
                    icon={<ImageIcon size={36} className="text-slate-500" />}
                    title="No media posts"
                    description={`${displayName} has not shared any photos or videos.`}
                  />
                ) : (
                  mediaPosts.map((post) => <PostCard key={post.id} post={post} />)
                )}
              </div>
            )}

            {activeTab === "connections" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { name: "Sarah Connor", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100", handle: "sarahc" },
                  { name: "Elena Rostova", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100", handle: "elena" },
                  { name: "David Kim", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100", handle: "davidk" },
                ].map((friend, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-[#111827] border border-[#1f2937]">
                    <div className="flex items-center gap-3">
                      <Avatar src={friend.avatar} name={friend.name} size="md" />
                      <div>
                        <p className="text-xs font-bold text-white">{friend.name}</p>
                        <p className="text-[10px] text-slate-400">@{friend.handle}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push("/messages")}
                      className="text-blue-400 hover:bg-blue-600/10 text-xs"
                    >
                      Message
                    </Button>
                  </div>
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