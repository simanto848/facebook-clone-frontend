"use client";

import { useState, useEffect } from "react";
import CreatePost from "@/components/features/post/CreatePost";
import PostCard from "@/components/features/post/PostCard";
import { usePostStore, mapBackendPostToPostType, PostType } from "@/store/postStore";
import { useAuthStore } from "@/store/authStore";
import { userService } from "@/services/userService";
import { bookmarkService } from "@/services/bookmarkService";
import { friendshipService, FriendUser } from "@/services/friendshipService";
import { mentionService } from "@/services/mentionService";
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
  MapPin,
  Globe,
  Camera,
} from "lucide-react";
import Image from "next/image";
import { Dialog, Input, Button, Avatar, Loader } from "@/components/ui";

export default function ProfilePage() {
  const { posts } = usePostStore();
  const { user: authUser, updateUser } = useAuthStore();

  const [profile, setProfile] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<PostType[]>([]);
  const [savedPosts, setSavedPosts] = useState<PostType[]>([]);
  const [taggedPosts, setTaggedPosts] = useState<PostType[]>([]);
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"posts" | "media" | "likes" | "saved" | "tagged">("posts");

  // Avatar Modal State
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [avatarInput, setAvatarInput] = useState("");
  const [savingAvatar, setSavingAvatar] = useState(false);

  // Edit Profile Modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: "",
    bio: "",
    location: "",
    website: "",
    avatar: "",
    coverPhoto: "",
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        // Fetch current user details
        const meRes = await userService.getMe();
        const meData = meRes.data || meRes;
        const currentProfile = meData || authUser || {
          id: "alex",
          displayName: "Alex Morgan",
          username: "alex",
          bio: "Designing the future of spatial interfaces. Obsessed with luminance, depth, and performance.",
          avatar: "https://images.unsplash.com/photo-1779040622687-42bb00790c67?w=500",
          coverPhoto: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=1800",
          location: "Neo-Tokyo",
        };
        setProfile(currentProfile);
        setEditForm({
          displayName: currentProfile.displayName || currentProfile.name || "",
          bio: currentProfile.bio || "",
          location: currentProfile.location || "",
          website: currentProfile.website || "",
          avatar: currentProfile.avatar || currentProfile.profilePicture || "",
          coverPhoto: currentProfile.coverPhoto || "",
        });

        // Fetch user posts
        if (currentProfile.id) {
          try {
            const postsRes = await userService.getUserPosts(currentProfile.id);
            const pItems = postsRes.data?.posts || postsRes.data || postsRes.posts || postsRes || [];
            if (Array.isArray(pItems) && pItems.length > 0) {
              setUserPosts(pItems.map(mapBackendPostToPostType));
            } else {
              // Fallback to store posts matching username
              const matched = posts.filter(
                (p) => p.author.username === currentProfile.username || (p.author as any).id === currentProfile.id
              );
              setUserPosts(matched);
            }
          } catch {
            const matched = posts.filter(
              (p) => p.author.username === currentProfile.username || (p.author as any).id === currentProfile.id
            );
            setUserPosts(matched);
          }
        }

        // Fetch saved bookmarks
        try {
          const bRes = await bookmarkService.getUserBookmarks();
          const bItems = bRes.data?.bookmarks || bRes.data || bRes.bookmarks || [];
          if (Array.isArray(bItems)) {
            const mappedSaved = bItems
              .map((b: any) => (b.post ? mapBackendPostToPostType(b.post) : null))
              .filter(Boolean) as PostType[];
            setSavedPosts(mappedSaved);
          }
        } catch {
          setSavedPosts(posts.filter((p) => p.saved));
        }

        // Fetch friends
        try {
          const fRes = await friendshipService.getFriends(6);
          const fList = fRes.data || fRes || [];
          if (Array.isArray(fList)) {
            setFriends(fList);
          }
        } catch {
          // Keep defaults
        }

        // Fetch tagged mentions
        try {
          const mRes = await mentionService.getUserMentions();
          const mItems = mRes.data?.mentions || mRes.data || mRes.mentions || mRes || [];
          if (Array.isArray(mItems)) {
            const mappedMentions = mItems
              .map((m: any) => (m.post ? mapBackendPostToPostType(m.post) : null))
              .filter(Boolean) as PostType[];
            if (mappedMentions.length > 0) {
              setTaggedPosts(mappedMentions);
            }
          }
        } catch {
          // Keep fallback
        }
      } catch (err) {
        console.error("Profile load error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [authUser]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await userService.updateProfile({
        displayName: editForm.displayName,
        bio: editForm.bio,
        location: editForm.location,
        website: editForm.website,
        avatar: editForm.avatar,
        coverPhoto: editForm.coverPhoto,
      });

      const updatedData = updated.data || updated;
      setProfile((prev: any) => ({
        ...prev,
        ...updatedData,
        displayName: editForm.displayName || prev?.displayName,
        bio: editForm.bio || prev?.bio,
        location: editForm.location || prev?.location,
        website: editForm.website || prev?.website,
        avatar: editForm.avatar || prev?.avatar,
        coverPhoto: editForm.coverPhoto || prev?.coverPhoto,
      }));
      setIsEditOpen(false);
    } catch (err) {
      console.error("Profile update error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAvatar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!avatarInput.trim() || savingAvatar) return;
    setSavingAvatar(true);
    try {
      await userService.updateAvatar(avatarInput.trim());
    } catch (err) {
      console.warn("Backend updateAvatar failed, updating local state:", err);
    }
    setProfile((prev: any) => ({ ...prev, avatar: avatarInput.trim() }));
    updateUser({ avatar: avatarInput.trim() });
    setIsAvatarModalOpen(false);
    setSavingAvatar(false);
  };

  // Media posts (images or videos)
  const mediaPosts = userPosts.filter((post) => post.type === "image" || post.type === "video" || (post.images && post.images.length > 0) || !!post.video);

  // Likes (posts user reacted to)
  const likedPosts = posts.filter((post) => !!post.userReaction);

  // Tagged posts
  const displayedTaggedPosts = taggedPosts.length > 0 ? taggedPosts : posts.filter(
    (post) => post.author.username !== profile?.username && post.content.toLowerCase().includes(profile?.username || "user")
  );

  const renderActiveTabContent = () => {
    let list = userPosts;
    if (activeTab === "media") list = mediaPosts;
    else if (activeTab === "likes") list = likedPosts;
    else if (activeTab === "saved") list = savedPosts;
    else if (activeTab === "tagged") list = displayedTaggedPosts;

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
    { id: "tagged", label: "Tagged", icon: UserCheck, count: displayedTaggedPosts.length },
  ] as const;

  const displayName = profile?.displayName || profile?.name || authUser?.displayName || "Alex Morgan";
  const username = profile?.username || authUser?.username || "alex";
  const bio = profile?.bio || "Designing the future of spatial interfaces. Obsessed with luminance, depth, and performance.";
  const location = profile?.location || "Neo-Tokyo";
  const coverPhoto = profile?.coverPhoto || "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=1800";
  const avatarUrl = profile?.avatar || profile?.profilePicture || authUser?.avatar || "https://images.unsplash.com/photo-1779040622687-42bb00790c67?w=500";

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* COVER + PROFILE HEADER */}
      <div className="relative">
        {/* Cover */}
        <div className="relative h-72 w-full overflow-hidden">
          <Image
            src={coverPhoto}
            alt="Cover"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Avatar */}
        <div className="absolute left-12 -bottom-16 group/avatar">
          <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-[#0f172a] shadow-[0_0_30px_rgba(59,130,246,0.4)] bg-[#111827]">
            <Image
              src={avatarUrl}
              alt={displayName}
              fill
              sizes="128px"
              className="object-cover"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setAvatarInput(avatarUrl);
              setIsAvatarModalOpen(true);
            }}
            title="Update avatar"
            className="absolute bottom-1 right-1 p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-black/50 transition cursor-pointer"
          >
            <Camera size={14} />
          </button>
        </div>
      </div>

      {/* User Info */}
      <div className="px-12 pt-20 pb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">{displayName}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-slate-400">
            <span>@{username}</span>
            {location && (
              <span className="flex items-center gap-1">
                <MapPin size={13} className="text-blue-400" />
                {location}
              </span>
            )}
            {profile?.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-blue-400 hover:underline"
              >
                <Globe size={13} />
                {profile.website.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>
        </div>

        <button
          onClick={() => setIsEditOpen(true)}
          className="flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-xs font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-600/10 cursor-pointer"
        >
          <Pencil size={14} />
          Edit Profile
        </button>
      </div>

      {/* Profile Navigation Tabs Bar */}
      <div className="px-12 border-b border-[#1f2937]/80 bg-[#111827]/10 sticky top-0 z-30 backdrop-blur-xs">
        <div className="flex gap-6 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 py-4 px-1.5 border-b-2 text-xs font-bold transition-all relative shrink-0
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
                <h2 className="font-semibold text-sm">About</h2>
              </div>

              <p className="text-xs leading-6 text-slate-300">
                {bio}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#1f2937] px-3 py-1 text-[10px] font-semibold text-slate-300">
                  UI/UX
                </span>
                <span className="rounded-full bg-[#1f2937] px-3 py-1 text-[10px] font-semibold text-slate-300">
                  Fullstack
                </span>
                <span className="rounded-full bg-[#1f2937] px-3 py-1 text-[10px] font-semibold text-slate-300">
                  React 19
                </span>
              </div>
            </div>

            {/* Recent Highlights */}
            <div className="rounded-2xl border border-[#1f2937] bg-[#111827] p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-sm">Recent Highlights</h2>
                <button className="text-xs font-semibold text-blue-400">See All</button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="aspect-square rounded-xl bg-[#1f2937] relative overflow-hidden">
                  <Image src="https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=200" fill sizes="100px" className="object-cover" alt="Recent 1" />
                </div>
                <div className="aspect-square rounded-xl bg-[#1f2937] relative overflow-hidden">
                  <Image src="https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=200" fill sizes="100px" className="object-cover" alt="Recent 2" />
                </div>
                <div className="aspect-square rounded-xl bg-[#1f2937] relative overflow-hidden">
                  <Image src="https://images.unsplash.com/photo-1778192391493-7436d746b128?w=200" fill sizes="100px" className="object-cover" alt="Recent 3" />
                </div>

                <button className="aspect-square rounded-xl bg-[#1f2937] flex items-center justify-center hover:bg-[#263247] transition text-slate-400 hover:text-white">
                  <Plus />
                </button>
              </div>
            </div>
          </div>

          {/* CENTER */}
          <div className="col-span-12 lg:col-span-6 space-y-6">
            {activeTab === "posts" && <CreatePost />}
            {loading ? (
              <div className="py-16 text-center">
                <Loader label="Loading profile timeline..." />
              </div>
            ) : (
              renderActiveTabContent()
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            <div className="rounded-2xl border border-[#1f2937] bg-[#111827] p-6 shadow-xl">
              <div className="mb-5 flex items-center gap-2">
                <Users size={18} className="text-blue-400" />
                <h2 className="font-semibold text-sm">Top Connections</h2>
              </div>

              <div className="space-y-4">
                {(friends.length > 0 ? friends : [
                  { id: "1", name: "Sarah Chen", avatarUrl: "https://images.unsplash.com/photo-1780570589435-059359e813cc?q=80&w=100&auto=format&fit=crop", headline: "Product Designer" },
                  { id: "2", name: "David Kim", avatarUrl: "https://images.unsplash.com/photo-1780764895105-ea3037466236?q=80&w=100&auto=format&fit=crop", headline: "Frontend Specialist" },
                  { id: "3", name: "Elena Rostova", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100", headline: "AI Engineer" }
                ]).map((friend) => (
                  <div key={friend.id || friend.name} className="flex items-center gap-3">
                    <Avatar
                      src={friend.avatarUrl || friend.profilePicture || friend.avatar}
                      name={friend.name || "Friend"}
                      size="md"
                    />
                    <div>
                      <p className="text-xs font-semibold text-white">{friend.name || friend.username}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{friend.headline || friend.bio || "Active Contributor"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#1f2937] bg-[#111827] p-6 shadow-xl">
              <h2 className="mb-4 font-semibold text-sm">Guilds & Communities</h2>
              <div className="space-y-3 text-xs">
                <div className="rounded-xl bg-[#1f2937] p-3 font-semibold text-slate-300">UI Brutalists & Architects</div>
                <div className="rounded-xl bg-[#1f2937] p-3 font-semibold text-slate-300">
                  Next.js & React 19 Core Guild
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      <Dialog
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Profile"
        description="Update your display name, bio, links, and styling."
        size="md"
      >
        <form onSubmit={handleUpdateProfile} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Display Name</label>
            <Input
              value={editForm.displayName}
              onChange={(e) => setEditForm((p) => ({ ...p, displayName: e.target.value }))}
              placeholder="Your full name"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Bio</label>
            <textarea
              rows={3}
              value={editForm.bio}
              onChange={(e) => setEditForm((p) => ({ ...p, bio: e.target.value }))}
              placeholder="Tell others what you are building..."
              className="w-full bg-[#1e293b] border border-[#334155] rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Location</label>
              <Input
                value={editForm.location}
                onChange={(e) => setEditForm((p) => ({ ...p, location: e.target.value }))}
                placeholder="e.g., Tokyo, Japan"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Website</label>
              <Input
                value={editForm.website}
                onChange={(e) => setEditForm((p) => ({ ...p, website: e.target.value }))}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Avatar Image URL</label>
            <Input
              value={editForm.avatar}
              onChange={(e) => setEditForm((p) => ({ ...p, avatar: e.target.value }))}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Cover Photo URL</label>
            <Input
              value={editForm.coverPhoto}
              onChange={(e) => setEditForm((p) => ({ ...p, coverPhoto: e.target.value }))}
              placeholder="https://..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#1f2937]">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsEditOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* UPDATE AVATAR MODAL */}
      <Dialog
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        title="Update Profile Picture"
        size="md"
      >
        <form onSubmit={handleSaveAvatar} className="space-y-4 pt-2">
          {/* Live Preview */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="relative h-28 w-28 rounded-full overflow-hidden border-4 border-blue-500 shadow-xl bg-slate-800">
              <Image
                src={avatarInput || avatarUrl}
                alt="Avatar Preview"
                fill
                className="object-cover"
              />
            </div>
            <span className="text-[11px] text-slate-400 mt-2">Live Preview</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Avatar Image URL</label>
            <Input
              type="url"
              required
              value={avatarInput}
              onChange={(e) => setAvatarInput(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="bg-[#0f172a] border-[#1f2937]"
            />
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-400">Or choose a preset avatar:</span>
            <div className="flex items-center gap-2">
              {[
                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200",
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
                "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200",
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
              ].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatarInput(preset)}
                  className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-[#1f2937] hover:border-blue-500 transition cursor-pointer"
                >
                  <Image src={preset} fill className="object-cover" alt={`Preset ${idx + 1}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#1f2937]">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsAvatarModalOpen(false)}
              disabled={savingAvatar}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!avatarInput.trim() || savingAvatar}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {savingAvatar ? "Saving..." : "Save Avatar"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
