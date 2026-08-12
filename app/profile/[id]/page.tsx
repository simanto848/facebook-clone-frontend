"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useUsers, followUser, unfollowUser } from "@/hooks/useUsers";
import { usePostStore } from "@/store/postStore";
import { useRouter } from "next/navigation";
import { UserPlus, UserCheck } from "lucide-react";
import PostCard from "@/components/features/post/PostCard";

export default function ProfilePage() {
  const router = useRouter();
  const pathParts = router.asPath.split("/").filter((p) => p);
  const userId = pathParts[pathParts.length - 1]; // last segment

  const { data: profile, isLoading, error } = useUsers(
    userId ? `/${userId}` : undefined
  );
  const { posts } = usePostStore();

  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");

  // Initialize isFollowing from profile data after mount
  useEffect(() => {
    if (profile?.user) {
      setIsFollowing(profile.isFollowing ?? false);
    }
  }, []); // Empty dependency array - runs once on mount

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="rounded-2xl border border-[#1f2937] bg-[#111827] p-8">
          <div className="h-20 w-20 rounded-full bg-[#1f2937] animate-pulse" />
          <div className="mt-4 text-sm text-slate-400">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f172a]">
        <p className="text-red-400">Error loading profile</p>
      </div>
    );
  }

  const user = profile?.user;
  const isCurrentUser = userId === "me";

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0f172a]">
        <p className="text-slate-400">User not found</p>
      </div>
    );
  }

  // Filter posts by this user
  const userPosts = posts.filter((p) => p.author.username === user.username);

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <div className="flex">
        {/* LEFT SIDEBAR */}
        <aside className="hidden lg:block w-72 shrink-0 bg-[#111827] border-r border-[#1f2937] p-6">
          <div className="space-y-6">

            {/* Profile Header */}
            <div className="flex flex-col items-center gap-6">
              <div className="relative w-full max-w-md">
                <Image
                  src={user.avatar}
                  alt={user.name}
                  className="rounded-full h-40 w-40 object-cover border border-[#1f2937]"
                />
              </div>

              <div className="flex flex-col items-center gap-3">
                <h1 className="text-3xl font-bold text-white">
                  {user.name || user.username}
                </h1>
                <p className="text-slate-400 text-sm">@{user.username}</p>

                {/* Follow/Unfollow buttons */}
                {!isCurrentUser && userId && (
                  <div className="flex gap-2">
                    {isFollowing ? (
                      <button
                        onClick={() => unfollowUser(userId).then(() => setIsFollowing(false))}
                        className="flex-1 rounded-xl px-4 py-2 text-sm font-medium transition
                          border border-[#1f2937] text-slate-300 hover:bg-[#111827]"
                      >
                        <UserCheck size={12} className="text-slate-300 mr-1 inline" />
                        Following
                      </button>
                    ) : (
                      <button
                        onClick={() => followUser(userId).then(() => setIsFollowing(true))}
                        className="flex-1 rounded-xl px-4 py-2 text-sm font-medium transition
                          bg-blue-600 text-white hover:bg-blue-700"
                      >
                        <UserPlus size={12} className="text-white mr-1 inline" />
                        Follow
                      </button>
                    )}
                  </div>
                )}

                {/* Edit profile button for current user */}
                {isCurrentUser && (
                  <a
                    href="/settings"
                    className="mt-3 flex items-center gap-2 text-blue-400 hover:underline text-sm"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 6v6l4 2" />
                    </svg>
                    Edit Profile
                  </a>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-3xl font-bold text-white">
                  {profile?.followersCount || 0}
                </p>
                <p className="text-xs text-slate-400">Followers</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">
                  {profile?.followingCount || 0}
                </p>
                <p className="text-xs text-slate-400">Following</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">
                  {user.postsCount || 0}
                </p>
                <p className="text-xs text-slate-400">Posts</p>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-6">
          {/* Tabs */}
          <div className="border-b border-[#1f2937] pb-4 mb-6">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab("posts")}
                className={
                  activeTab === "posts"
                    ? "border-b-2 border-blue-600 text-blue-400"
                    : "border-b-2 text-transparent"
                }
              >
                Posts
              </button>
              <button
                onClick={() => setActiveTab("media")}
                className={
                  activeTab === "media"
                    ? "border-b-2 border-blue-600 text-blue-400"
                    : "border-b-2 text-transparent"
                }
              >
                Media
              </button>
              <button
                onClick={() => setActiveTab("reactions")}
                className={
                  activeTab === "reactions"
                    ? "border-b-2 border-blue-600 text-blue-400"
                    : "border-b-2 text-transparent"
                }
              >
                Reactions
              </button>
            </div>
          </div>

          {/* Posts Feed */}
          {activeTab === "posts" && userPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">
              {activeTab === "posts" ? (
                <p>No posts found</p>
              ) : (
                <p>No posts</p>
              )}
            </div>
          )}

          {/* Media Grid */}
          {activeTab === "media" && userPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userPosts.map((post) => {
                if (post.type === "image" || post.type === "video") {
                  return <PostCard key={post.id} post={post} />;
                }
                return null;
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">
              {activeTab === "media" ? (
                <p>No images/videos found</p>
              ) : (
                <p>No media</p>
              )}
            </div>
          )}

          {/* Reactions */}
          {activeTab === "reactions" ? (
            <div className="p-8 text-center text-slate-400">
              <p>Reaction stats not yet implemented</p>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}