"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import CreatePost from "@/components/features/post/CreatePost";
import PostCard from "@/components/features/post/PostCard";
import PostGridCard from "@/components/features/post/PostGridCard";
import MediaGrid from "@/components/features/profile/MediaGrid";
import ShareProfileButton from "@/components/features/profile/ShareProfileButton";
import ProfileAvatar from "@/components/features/profile/ProfileAvatar";
import ProfileCover from "@/components/features/profile/ProfileCover";
import ProfileQrModal from "@/components/features/profile/ProfileQrModal";
import TopConnectionsCard from "@/components/features/profile/TopConnectionsCard";
import FeaturedHighlightsCard from "@/components/features/profile/FeaturedHighlightsCard";
import ProfileAboutCard from "@/components/features/profile/ProfileAboutCard";
import EditProfileModal, { EditProfileFormData } from "@/components/features/profile/EditProfileModal";
import GuildsCommunitiesCard from "@/components/features/profile/GuildsCommunitiesCard";
import UpdateAvatarModal from "@/components/features/profile/UpdateAvatarModal";
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
  Share2,
  Check,
  X,
  Search,
  Film,
  LayoutGrid,
  List,
  QrCode,
} from "lucide-react";
import Image from "next/image";
import { Dialog, Input, Button, Avatar, Loader, EmptyState, ViewModeToggle } from "@/components/ui";

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
  const [copiedProfile, setCopiedProfile] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [skills, setSkills] = useState<string[]>(["UI/UX", "Fullstack", "React 19", "TypeScript"]);
  const [postSearchQuery, setPostSearchQuery] = useState("");
  const [postLayout, setPostLayout] = useState<"feed" | "grid">("feed");
  const [featuredItems, setFeaturedItems] = useState<{ id: string; title: string; image: string }[]>([
    { id: "f1", title: "Architecture", image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300" },
    { id: "f2", title: "Street Photography", image: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=300" },
    { id: "f3", title: "Creative Lab", image: "https://images.unsplash.com/photo-1778192391493-7436d746b128?w=300" },
  ]);
  const [isAddFeaturedOpen, setIsAddFeaturedOpen] = useState(false);
  const [newFeaturedTitle, setNewFeaturedTitle] = useState("");
  const [newFeaturedImage, setNewFeaturedImage] = useState("");

  useEffect(() => {
    try {
      const storedFeatured = localStorage.getItem("user_profile_featured");
      if (storedFeatured) {
        setFeaturedItems(JSON.parse(storedFeatured));
      }
    } catch {}
  }, []);

  const handleAddFeatured = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeaturedTitle.trim()) return;
    const item = {
      id: `feat_${Date.now()}`,
      title: newFeaturedTitle.trim(),
      image: newFeaturedImage.trim() || "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=300",
    };
    const updated = [...featuredItems, item];
    setFeaturedItems(updated);
    try {
      localStorage.setItem("user_profile_featured", JSON.stringify(updated));
    } catch {}
    setNewFeaturedTitle("");
    setNewFeaturedImage("");
    setIsAddFeaturedOpen(false);
  };

  const handleRemoveFeatured = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = featuredItems.filter((f) => f.id !== id);
    setFeaturedItems(updated);
    try {
      localStorage.setItem("user_profile_featured", JSON.stringify(updated));
    } catch {}
  };

  useEffect(() => {
    try {
      const storedSkills = localStorage.getItem("user_profile_skills");
      if (storedSkills) {
        setSkills(JSON.parse(storedSkills));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleAddSkill = (trimmed: string) => {
    if (!trimmed || skills.includes(trimmed)) return;
    const updated = [...skills, trimmed];
    setSkills(updated);
    try {
      localStorage.setItem("user_profile_skills", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updated = skills.filter((s) => s !== skillToRemove);
    setSkills(updated);
    try {
      localStorage.setItem("user_profile_skills", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleShareProfile = () => {
    if (typeof window !== "undefined") {
      const shareUrl = `${window.location.origin}/profile/${profile?.username || authUser?.username || "alex"}`;
      navigator.clipboard.writeText(shareUrl);
      setCopiedProfile(true);
      setTimeout(() => setCopiedProfile(false), 2500);
    }
  };

  // Avatar Modal State
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);

  // Cover Photo Modal State
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const [coverInput, setCoverInput] = useState("");
  const [savingCover, setSavingCover] = useState(false);

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
          const fRes = await friendshipService.getFriends(1, 6);
          const fList = fRes.data?.friends || fRes.data || fRes.friends || fRes || [];
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

  const handleUpdateProfile = async (formData: EditProfileFormData) => {
    setIsSaving(true);
    const cleanDisplayName = (formData.displayName || "").trim().slice(0, 100);
    const cleanBio = (formData.bio || "").trim().slice(0, 500);
    const rawAvatar = (formData.avatar || "").trim();
    const cleanAvatar = /^https?:\/\/.+/.test(rawAvatar) ? rawAvatar : undefined;
    const rawCover = (formData.coverPhoto || "").trim();
    const cleanCover = /^https?:\/\/.+/.test(rawCover) ? rawCover : undefined;

    try {
      const updated = await userService.updateProfile({
        displayName: cleanDisplayName || undefined,
        bio: cleanBio,
        avatarUrl: cleanAvatar,
        coverUrl: cleanCover,
      });

      const updatedData = updated.data || updated;
      setProfile((prev: any) => ({
        ...prev,
        ...updatedData,
        displayName: cleanDisplayName || prev?.displayName,
        bio: cleanBio || prev?.bio,
        location: formData.location || prev?.location,
        website: formData.website || prev?.website,
        avatar: cleanAvatar || prev?.avatar,
        coverPhoto: cleanCover || prev?.coverPhoto,
      }));
      setEditForm(formData);
      setIsEditOpen(false);
    } catch (err) {
      console.error("Profile update error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAvatar = async (cleanAvatar: string) => {
    setSavingAvatar(true);
    try {
      await userService.updateAvatar(cleanAvatar);
    } catch (err) {
      console.warn("Backend updateAvatar failed, updating local state:", err);
    }
    setProfile((prev: any) => ({ ...prev, avatar: cleanAvatar }));
    updateUser({ avatar: cleanAvatar });
    setIsAvatarModalOpen(false);
    setSavingAvatar(false);
  };

  const handleSaveCover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverInput.trim() || savingCover) return;
    setSavingCover(true);
    try {
      await userService.updateCover(coverInput.trim());
    } catch (err) {
      console.warn("Backend updateCover failed, updating local state:", err);
    }
    setProfile((prev: any) => ({ ...prev, coverPhoto: coverInput.trim() }));
    setIsCoverModalOpen(false);
    setSavingCover(false);
  };

  // Media posts (images or videos)
  const mediaPosts = userPosts.filter((post) => post.type === "image" || post.type === "video" || (post.images && post.images.length > 0) || !!post.video);
  const photosCount = mediaPosts.filter((post) => (post.images && post.images.length > 0) || post.type === "image").length;
  const videosCount = mediaPosts.filter((post) => !!post.video || post.type === "video").length;

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

    if (postSearchQuery.trim()) {
      const q = postSearchQuery.toLowerCase();
      list = list.filter((p) => p.content?.toLowerCase().includes(q));
    }

    if (list.length === 0) {
      return (
        <EmptyState
          title={postSearchQuery ? `No posts matching "${postSearchQuery}"` : "No items found in this section"}
          description={
            postSearchQuery
              ? "Try searching for a different keyword or clear the search query."
              : "Items you post or interact with will display here."
          }
        />
      );
    }

    if (activeTab === "media") {
      return <MediaGrid posts={mediaPosts} />;
    }

    if (postLayout === "grid") {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {list.map((post) => (
            <PostGridCard key={post.id} post={post} />
          ))}
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
        <ProfileCover
          src={coverPhoto}
          alt="Cover"
          heightClassName="h-72"
          onEditCover={() => {
            setCoverInput(coverPhoto);
            setIsCoverModalOpen(true);
          }}
        />

        {/* Avatar */}
        <div className="absolute left-12 -bottom-16">
          <ProfileAvatar
            src={avatarUrl}
            alt={displayName}
            size="xl"
            onEditAvatar={() => setIsAvatarModalOpen(true)}
          />
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

        <div className="flex items-center gap-2.5">
          <ShareProfileButton
            url={typeof window !== "undefined" ? `${window.location.origin}/profile/${profile?.username || authUser?.username || "alex"}` : undefined}
            variant="secondary"
            className="rounded-full bg-[#1f2937] px-4 py-2 text-xs font-bold text-slate-200 hover:text-white hover:bg-[#2e3b4e] transition border border-slate-700 cursor-pointer shadow-none"
            label="Share Profile"
            copiedLabel="Link Copied!"
          />

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<QrCode size={14} />}
            onClick={() => setShowQrModal(true)}
            className="rounded-full bg-[#1f2937] px-4 py-2 text-xs font-bold text-slate-200 hover:text-white hover:bg-[#2e3b4e] transition border border-slate-700 cursor-pointer shadow-none"
            title="Display Profile QR Code"
          >
            QR Code
          </Button>

          <button
            onClick={() => setIsEditOpen(true)}
            className="flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-xs font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-600/10 cursor-pointer"
          >
            <Pencil size={14} />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Profile Navigation Tabs Bar */}
      <div className="px-4 md:px-12 border-b border-[#1f2937]/80 bg-[#111827]/30 sticky top-0 z-30 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex gap-6 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 py-4 px-1.5 border-b-2 text-xs font-bold transition-all relative shrink-0 cursor-pointer
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

        <div className="flex items-center gap-3 pb-3 md:pb-0">
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1 bg-[#111827] px-2.5 py-1 rounded-lg border border-[#1f2937]">
              <ImageIcon size={12} className="text-blue-400" /> {photosCount} photos
            </span>
            <span className="flex items-center gap-1 bg-[#111827] px-2.5 py-1 rounded-lg border border-[#1f2937]">
              <Film size={12} className="text-purple-400" /> {videosCount} videos
            </span>
          </div>

          <div className="relative w-full sm:w-52">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
            <input
              type="text"
              value={postSearchQuery}
              onChange={(e) => setPostSearchQuery(e.target.value)}
              placeholder="Search user posts..."
              className="w-full rounded-full bg-[#111827] border border-[#1f2937] pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <ViewModeToggle mode={postLayout} onChange={setPostLayout} />
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-4 md:px-12 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* LEFT SIDEBAR */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            {/* About */}
            <ProfileAboutCard
              bio={bio}
              skills={skills}
              onAddSkill={handleAddSkill}
              onRemoveSkill={handleRemoveSkill}
            />

            {/* Recent Highlights / Featured Showcase */}
            <FeaturedHighlightsCard
              items={featuredItems}
              onAddClick={() => setIsAddFeaturedOpen(true)}
              onRemoveItem={handleRemoveFeatured}
            />
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
            <TopConnectionsCard friends={friends} />

            <GuildsCommunitiesCard />
          </div>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      <EditProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        initialData={editForm}
        onSave={handleUpdateProfile}
        isSaving={isSaving}
      />

      {/* UPDATE AVATAR MODAL */}
      <UpdateAvatarModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatar={avatarUrl}
        onSave={handleSaveAvatar}
        isSaving={savingAvatar}
      />

      {/* UPDATE COVER PHOTO MODAL */}
      <Dialog
        isOpen={isCoverModalOpen}
        onClose={() => setIsCoverModalOpen(false)}
        title="Update Cover Photo"
        size="lg"
      >
        <form onSubmit={handleSaveCover} className="space-y-4 pt-2">
          {/* Live Widescreen Preview */}
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400">Live Preview</span>
            <div className="relative h-44 w-full rounded-2xl overflow-hidden border border-[#1f2937] shadow-xl bg-slate-800">
              <Image
                src={coverInput || coverPhoto}
                alt="Cover Preview"
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Cover Image URL</label>
            <Input
              type="url"
              required
              value={coverInput}
              onChange={(e) => setCoverInput(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="bg-[#0f172a] border-[#1f2937]"
            />
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-400">Or pick a landscape preset:</span>
            <div className="grid grid-cols-3 gap-2">
              {[
                "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=1200",
                "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200",
                "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200",
              ].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCoverInput(preset)}
                  className="relative h-16 rounded-xl overflow-hidden border border-[#1f2937] hover:border-blue-500 transition cursor-pointer"
                >
                  <Image src={preset} fill className="object-cover" alt={`Cover ${idx + 1}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#1f2937]">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsCoverModalOpen(false)}
              disabled={savingCover}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!coverInput.trim() || savingCover}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {savingCover ? "Saving..." : "Save Cover Photo"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ADD FEATURED MODAL */}
      <Dialog
        isOpen={isAddFeaturedOpen}
        onClose={() => setIsAddFeaturedOpen(false)}
        title="Add to Featured Highlights"
        description="Pin favorite memories, collections, or project showcases to your profile."
      >
        <form onSubmit={handleAddFeatured} className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Highlight Title</label>
            <Input
              type="text"
              placeholder="e.g. Vacation 2026, Design Lab, Photography"
              value={newFeaturedTitle}
              onChange={(e) => setNewFeaturedTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Cover Image URL (optional)</label>
            <Input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={newFeaturedImage}
              onChange={(e) => setNewFeaturedImage(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] text-slate-400">Quick Image Presets:</span>
            <div className="grid grid-cols-3 gap-2">
              {[
                "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300",
                "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300",
                "https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?w=300",
              ].map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setNewFeaturedImage(img)}
                  className="relative h-14 rounded-lg overflow-hidden border border-slate-700 hover:border-blue-500 transition cursor-pointer"
                >
                  <Image src={img} fill className="object-cover" alt="" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1f2937]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddFeaturedOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!newFeaturedTitle.trim()}
            >
              Save Highlight
            </Button>
          </div>
        </form>
      </Dialog>

      {/* PROFILE QR CODE MODAL */}
      <ProfileQrModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        username={username}
        displayName={displayName}
        avatarUrl={avatarUrl}
        profileUrl={
          typeof window !== "undefined"
            ? `${window.location.origin}/profile/${username}`
            : undefined
        }
      />
    </div>
  );
}
