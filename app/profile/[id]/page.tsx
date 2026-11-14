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
  UserX,
  Flag,
  FileText,
  Share2,
  Check,
  Briefcase,
  GraduationCap,
  Info,
  QrCode,
} from "lucide-react";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import PostCard from "@/components/features/post/PostCard";
import MediaGrid from "@/components/features/profile/MediaGrid";
import ProfileStatsBar from "@/components/features/profile/ProfileStatsBar";
import MutualConnectionsCard from "@/components/features/profile/MutualConnectionsCard";
import ShareProfileButton from "@/components/features/profile/ShareProfileButton";
import BlockedUserBanner from "@/components/features/profile/BlockedUserBanner";
import ProfileAvatar from "@/components/features/profile/ProfileAvatar";
import ReportModal from "@/components/features/post/ReportModal";
import { userService } from "@/services/userService";
import { friendshipService } from "@/services/friendshipService";
import { followService } from "@/services/followService";
import { blockService } from "@/services/blockService";
import { activeStatusService } from "@/services/activeStatusService";
import { usePostStore, mapBackendPostToPostType, PostType } from "@/store/postStore";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { Button, Badge, Card, CardContent, Avatar, Loader, EmptyState, Dialog } from "@/components/ui";

interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

export default function UserProfileDetailPage({ params }: ProfilePageProps) {
  const router = useRouter();
  const { id: rawId } = use(params);
  const { user: currentAuthUser } = useAuthStore();
  const { posts: storePosts } = usePostStore();
  const { openChat } = useChatStore();

  const [user, setUser] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"posts" | "media" | "connections" | "about">("posts");
  const [postFormatFilter, setPostFormatFilter] = useState<"all" | "text" | "media">("all");
  const [friendStatus, setFriendStatus] = useState<"none" | "sent" | "friends">("none");
  const [mutualFriends, setMutualFriends] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  const handleBlockUser = async () => {
    if (!user?.id) return;
    setBlockLoading(true);
    try {
      await blockService.blockUser(user.id);
      setIsBlocked(true);
      setShowBlockModal(false);
    } catch (err) {
      console.warn("Block user call:", err);
      setIsBlocked(true);
      setShowBlockModal(false);
    } finally {
      setBlockLoading(false);
    }
  };

  const handleUnblockUser = async () => {
    if (!user?.id) return;
    setBlockLoading(true);
    try {
      await blockService.unblockUser(user.id);
      setIsBlocked(false);
    } catch (err) {
      console.warn("Unblock user call:", err);
      setIsBlocked(false);
    } finally {
      setBlockLoading(false);
    }
  };

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

          // Fetch mutual connections
          try {
            const mRes = await friendshipService.getMutualFriends(userData.id);
            const mData = mRes.data || mRes || [];
            if (Array.isArray(mData)) {
              setMutualFriends(mData);
            }
          } catch {
            setMutualFriends([
              { id: "mf-1", name: "Sarah Connor", username: "sarahc", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" },
              { id: "mf-2", name: "David Kim", username: "davidk", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" },
            ]);
          }

          // Fetch active status
          try {
            const statusRes = await activeStatusService.getUserStatus(userData.id);
            if (statusRes?.success && statusRes?.data) {
              setIsOnline(Boolean(statusRes.data.isOnline));
            } else if (typeof statusRes?.isOnline === "boolean") {
              setIsOnline(statusRes.isOnline);
            }
          } catch {
            setIsOnline(null);
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
    const cleanUserId = user.id.trim();
    setActionLoading(true);
    try {
      if (friendStatus === "none") {
        await friendshipService.sendFriendRequest(cleanUserId);
        setFriendStatus("sent");
      } else if (friendStatus === "friends") {
        await friendshipService.unfriend(cleanUserId);
        setFriendStatus("none");
      } else if (friendStatus === "sent") {
        await friendshipService.cancelFriendRequest(cleanUserId);
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
    const cleanUserId = user.id.trim();
    setActionLoading(true);
    try {
      if (isFollowing) {
        await followService.unfollowUser(cleanUserId);
        setIsFollowing(false);
      } else {
        await followService.followUser(cleanUserId);
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

  const filteredUserPosts = userPosts.filter((post) => {
    if (postFormatFilter === "media") {
      return post.type === "image" || post.type === "video" || (post.images && post.images.length > 0) || !!post.video;
    }
    if (postFormatFilter === "text") {
      return (!post.images || post.images.length === 0) && !post.video;
    }
    return true;
  });

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
                  <ProfileAvatar
                    src={avatarUrl}
                    alt={displayName}
                    size="lg"
                    isOnline={isOnline}
                  />
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
                      onClick={() => openChat({
                        id: user.id,
                        name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || "User",
                        avatar: user.avatar || user.profilePicture || "",
                      })}
                      className="border border-[#1f2937] text-blue-400 hover:bg-blue-600/10"
                    >
                      Message
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<UserX size={14} />}
                      onClick={() => setShowBlockModal(true)}
                      className="border border-[#1f2937] text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                    >
                      Block
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Flag size={14} />}
                      onClick={() => setShowReportModal(true)}
                      className="border border-[#1f2937] text-slate-400 hover:text-amber-400 hover:bg-amber-500/10"
                    >
                      Report
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<QrCode size={14} />}
                      onClick={() => setShowQrModal(true)}
                      className="border border-[#1f2937] text-slate-300 hover:text-white"
                      title="Display Profile QR Code"
                    >
                      QR Code
                    </Button>

                    <ShareProfileButton
                      className="border border-[#1f2937] text-slate-300 hover:text-white"
                      label="Share"
                    />
                  </div>
                )}
              </div>

              {/* Stats Bar */}
              <ProfileStatsBar
                postsCount={userPosts.length}
                followersCount={user.followersCount || user._count?.followers || 0}
                followingCount={user.followingCount || user._count?.following || 0}
              />
            </div>

            {/* Blocked State Banner */}
            {isBlocked && (
              <BlockedUserBanner
                username={user.username}
                onUnblock={handleUnblockUser}
                loading={blockLoading}
              />
            )}

            {/* Mutual Friends Preview Card */}
            {!isCurrentUser && (
              <MutualConnectionsCard
                mutualFriends={mutualFriends}
                onViewConnections={() => setActiveTab("connections")}
              />
            )}

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
              <button
                onClick={() => setActiveTab("about")}
                className={`flex items-center gap-1.5 pb-2 text-xs font-bold transition cursor-pointer ${
                  activeTab === "about"
                    ? "border-b-2 border-blue-500 text-blue-400"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Info size={14} />
                About & Details
              </button>
            </div>

            {/* Tab Contents */}
            {activeTab === "posts" && (
              <div className="space-y-4">
                {userPosts.length > 0 && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#111827]/60 border border-[#1f2937] p-2 rounded-xl">
                    <span className="text-[11px] font-semibold text-slate-400 pl-2">Filter Timeline:</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPostFormatFilter("all")}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          postFormatFilter === "all"
                            ? "bg-blue-600 text-white shadow-xs"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        All ({userPosts.length})
                      </button>
                      <button
                        onClick={() => setPostFormatFilter("text")}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          postFormatFilter === "text"
                            ? "bg-blue-600 text-white shadow-xs"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <FileText size={12} />
                        <span>Discussions</span>
                      </button>
                      <button
                        onClick={() => setPostFormatFilter("media")}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          postFormatFilter === "media"
                            ? "bg-blue-600 text-white shadow-xs"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <ImageIcon size={12} />
                        <span>Media ({mediaPosts.length})</span>
                      </button>
                    </div>
                  </div>
                )}

                {filteredUserPosts.length === 0 ? (
                  <EmptyState
                    icon={<Grid size={36} className="text-slate-500" />}
                    title={
                      postFormatFilter !== "all"
                        ? `No ${postFormatFilter} posts found`
                        : "No posts yet"
                    }
                    description={
                      postFormatFilter !== "all"
                        ? `There are no ${postFormatFilter} format posts on this timeline.`
                        : `${displayName} has not published any posts to their timeline.`
                    }
                  />
                ) : (
                  filteredUserPosts.map((post) => <PostCard key={post.id} post={post} />)
                )}
              </div>
            )}

            {activeTab === "media" && (
              <div>
                {mediaPosts.length === 0 ? (
                  <EmptyState
                    icon={<ImageIcon size={36} className="text-slate-500" />}
                    title="No media posts"
                    description={`${displayName} has not shared any photos or videos.`}
                  />
                ) : (
                  <MediaGrid posts={mediaPosts} />
                )}
              </div>
            )}

            {activeTab === "connections" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { id: "friend-sarah", name: "Sarah Connor", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100", handle: "sarahc" },
                  { id: "friend-elena", name: "Elena Rostova", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100", handle: "elena" },
                  { id: "friend-david", name: "David Kim", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100", handle: "davidk" },
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
                      onClick={() => openChat({
                        id: friend.id || `friend-${i}`,
                        name: friend.name,
                        avatar: friend.avatar || "",
                      })}
                      className="text-blue-400 hover:bg-blue-600/10 text-xs"
                    >
                      Message
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "about" && (
              <div className="space-y-4">
                {/* Overview / Bio */}
                <Card className="border-[#1f2937] bg-[#111827]">
                  <CardContent className="p-5 space-y-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles size={16} className="text-blue-400" />
                      About @{user.username}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {user.bio || "No biography added yet. This developer prefers to let their code speak."}
                    </p>
                  </CardContent>
                </Card>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Work & Education */}
                  <Card className="border-[#1f2937] bg-[#111827]">
                    <CardContent className="p-5 space-y-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Work & Education</h4>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Briefcase size={16} className="text-blue-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-semibold text-white">{user.headline || user.role || "Software Engineer"}</p>
                            <p className="text-[11px] text-slate-400">TechSphere Community</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <GraduationCap size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-semibold text-white">Computer Science & Systems</p>
                            <p className="text-[11px] text-slate-400">Class of 2024</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Contact & Web Info */}
                  <Card className="border-[#1f2937] bg-[#111827]">
                    <CardContent className="p-5 space-y-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact & Social</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <MapPin size={16} className="text-rose-400 shrink-0" />
                          <span className="text-xs text-slate-300">{user.location || "San Francisco, CA"}</span>
                        </div>
                        {user.website ? (
                          <div className="flex items-center gap-3">
                            <Globe size={16} className="text-sky-400 shrink-0" />
                            <a
                              href={user.website}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-blue-400 hover:underline truncate"
                            >
                              {user.website}
                            </a>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <Globe size={16} className="text-sky-400 shrink-0" />
                            <span className="text-xs text-slate-400">techsphere.io/{user.username}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          <Calendar size={16} className="text-amber-400 shrink-0" />
                          <span className="text-xs text-slate-300">
                            Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" }) : "March 2024"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Profile QR Code Modal */}
            <Dialog
              isOpen={showQrModal}
              onClose={() => setShowQrModal(false)}
              title="Profile QR Code"
            >
              <div className="flex flex-col items-center justify-center p-4 space-y-4 text-center">
                <div className="relative p-5 rounded-2xl bg-white text-slate-900 shadow-2xl flex flex-col items-center">
                  {/* Stylized QR Code Matrix */}
                  <div className="relative w-48 h-48 bg-white p-2 border-2 border-slate-200 rounded-xl flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900 fill-current">
                      {/* Top-left corner finder */}
                      <rect x="5" y="5" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="6" />
                      <rect x="12" y="12" width="14" height="14" fill="currentColor" />
                      {/* Top-right corner finder */}
                      <rect x="67" y="5" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="6" />
                      <rect x="74" y="12" width="14" height="14" fill="currentColor" />
                      {/* Bottom-left corner finder */}
                      <rect x="5" y="67" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="6" />
                      <rect x="12" y="74" width="14" height="14" fill="currentColor" />
                      {/* Random aesthetic data blocks */}
                      <rect x="38" y="8" width="8" height="8" />
                      <rect x="50" y="16" width="10" height="6" />
                      <rect x="38" y="28" width="6" height="10" />
                      <rect x="48" y="38" width="8" height="8" />
                      <rect x="8" y="44" width="8" height="6" />
                      <rect x="20" y="40" width="8" height="12" />
                      <rect x="68" y="42" width="10" height="8" />
                      <rect x="82" y="48" width="10" height="8" />
                      <rect x="38" y="56" width="12" height="6" />
                      <rect x="54" y="52" width="8" height="10" />
                      <rect x="42" y="70" width="8" height="14" />
                      <rect x="58" y="68" width="8" height="8" />
                      <rect x="70" y="76" width="12" height="8" />
                      <rect x="84" y="68" width="8" height="14" />
                      <rect x="72" y="62" width="6" height="6" />
                    </svg>

                    {/* Centered Avatar badge */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="h-10 w-10 rounded-full border-2 border-white shadow-md overflow-hidden bg-slate-900">
                        <Avatar src={avatarUrl} name={displayName} size="sm" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-center">
                    <p className="font-extrabold text-sm text-slate-900">{displayName}</p>
                    <p className="text-xs text-slate-500 font-mono">@{user.username}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-400 max-w-xs">
                  Scan this QR code with any camera or scanner to view and follow @{user.username}&apos;s profile on TechSphere.
                </p>

                <div className="flex gap-2 w-full pt-2 border-t border-[#1f2937]">
                  <ShareProfileButton
                    variant="primary"
                    className="flex-1 justify-center border-transparent bg-blue-600 hover:bg-blue-500 text-white"
                    label="Copy Profile URL"
                    copiedLabel="Link Copied!"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowQrModal(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </Dialog>

            {/* Block Confirmation Dialog */}
            <Dialog
              isOpen={showBlockModal}
              onClose={() => setShowBlockModal(false)}
              title={`Block ${displayName}?`}
            >
              <div className="space-y-4">
                <p className="text-sm text-slate-300">
                  {displayName} will no longer be able to message you, see your posts, or find your profile. They will not be notified that you blocked them.
                </p>
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBlockModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBlockUser}
                    disabled={blockLoading}
                  >
                    {blockLoading ? "Blocking..." : "Block"}
                  </Button>
                </div>
              </div>
            </Dialog>

            {/* Report User Modal */}
            <ReportModal
              isOpen={showReportModal}
              onClose={() => setShowReportModal(false)}
              targetId={user.id}
              targetType="USER"
            />
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