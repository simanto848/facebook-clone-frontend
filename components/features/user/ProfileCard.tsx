import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useUsers, followUser, unfollowUser } from "@/hooks/useUsers";
import { useRouter } from "next/navigation";
import { UserPlus, UserCheck, MessageSquare, ExternalLink, MapPin, Copy, Check, Users } from "lucide-react";
import Link from "next/link";
import { Button, Dialog, Avatar } from "@/components/ui";
import { useChatStore } from "@/store/chatStore";

export interface ProfileCardProps {
  userId?: string;
  username?: string;
  size?: "sm" | "md" | "lg";
  showFollowToggle?: boolean;
  showMessageAction?: boolean;
}

export const ProfileCard = ({
  userId,
  username,
  size = "md",
  showFollowToggle = true,
  showMessageAction = true,
}: ProfileCardProps) => {
  const { data: profile, isLoading, error, refetch } = useUsers(
    userId ? `/${userId}` : undefined
  );
  const router = useRouter();
  const { openChat } = useChatStore();

  const [isFollowing, setIsFollowing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isMutualModalOpen, setIsMutualModalOpen] = useState(false);

  useEffect(() => {
    if (profile?.user) {
      setIsFollowing(profile.isFollowing ?? false);
    }
  }, [profile]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/profile/${profile?.user?.username || userId || ""}`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="h-20 w-20 rounded-full bg-[#1f2937] animate-pulse" />
    );
  }

  if (error) {
    return <div className="text-sm text-red-400 font-medium">Error loading profile</div>;
  }

  const user = profile?.user;
  const isCurrentUser = userId === "me";

  if (!user) {
    return <div className="text-sm text-slate-400">User not found</div>;
  }

  interface MutualFriend {
    id: string;
    name: string;
    username: string;
    avatar: string;
  }

  const mutualFriends: MutualFriend[] = user.mutualFriends || [
    { id: "mf-1", name: "Sarah Chen", username: "sarahc", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" },
    { id: "mf-2", name: "Elena Rostova", username: "elena", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100" },
    { id: "mf-3", name: "David Kim", username: "davidk", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" },
  ];

  return (
    <div className="relative">
      {/* Profile image */}
      <div className="flex items-center gap-3">
        <div className="relative h-16 w-16 rounded-full overflow-hidden shrink-0 border border-[#1f2937]">
          <Image
            src={user.avatar}
            alt={user.name}
            fill
            sizes="64px"
            className="object-cover"
          />
          {showFollowToggle && !isCurrentUser && (
            <div
              className="absolute -bottom-1 -right-1 rounded-full border-2 border-[#111827] bg-green-500"
            />
          )}
        </div>

        <div>
          <Link
            href={userId ? `/profile/${userId}` : `/profile/${user.username}`}
            className="font-bold text-white hover:underline"
          >
            <h3 className="text-lg font-semibold text-white">
              {user.name || user.username}
            </h3>
            <p className="text-sm text-slate-400">{`@${user.username}`}</p>
          </Link>

          {user.bio && (
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
              {user.bio}
            </p>
          )}

          <div className="flex items-center gap-3 text-xs text-slate-400 mt-1.5 flex-wrap">
            {user.location && (
              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                <MapPin size={11} className="text-slate-500" />
                <span>{user.location}</span>
              </span>
            )}
            {user.website && (
              <a
                href={user.website.startsWith("http") ? user.website : `https://${user.website}`}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center gap-1 text-[11px] text-blue-400 hover:underline"
              >
                <ExternalLink size={11} />
                <span>{user.website.replace(/^https?:\/\//, "")}</span>
              </a>
            )}
          </div>

          {/* Mutual Friends Trigger */}
          {!isCurrentUser && (
            <button
              type="button"
              onClick={() => setIsMutualModalOpen(true)}
              className="flex items-center gap-2 mt-2 group/mf cursor-pointer"
            >
              <div className="flex -space-x-1.5 overflow-hidden">
                {mutualFriends.slice(0, 3).map((f) => (
                  <img
                    key={f.id}
                    src={f.avatar}
                    alt={f.name}
                    className="inline-block h-4 w-4 rounded-full ring-1 ring-[#111827] object-cover"
                  />
                ))}
              </div>
              <span className="text-[11px] text-slate-400 group-hover/mf:text-blue-400 group-hover/mf:underline transition-colors">
                {mutualFriends.length} mutual friend{mutualFriends.length > 1 ? "s" : ""}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Actions: Follow, Message, Copy Profile Link */}
      {!isCurrentUser && (
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          {showFollowToggle && userId && (
            <Button
              size="sm"
              variant={isFollowing ? "secondary" : "primary"}
              leftIcon={isFollowing ? <UserCheck size={14} /> : <UserPlus size={14} />}
              onClick={() => {
                if (isFollowing) {
                  unfollowUser(userId).then(() => setIsFollowing(false));
                } else {
                  followUser(userId).then(() => setIsFollowing(true));
                }
              }}
            >
              {isFollowing ? "Following" : "Follow"}
            </Button>
          )}

          {showMessageAction && (
            <Button
              size="sm"
              variant="ghost"
              className="border border-[#1f2937] text-slate-300 hover:text-white"
              leftIcon={<MessageSquare size={14} />}
              onClick={() =>
                openChat({
                  id: userId || user.id || user.username,
                  name: user.name || user.username,
                  avatar: user.avatar,
                })
              }
            >
              Message
            </Button>
          )}

          <Button
            size="sm"
            variant="ghost"
            className="p-2 text-slate-400 hover:text-white border border-[#1f2937]"
            title="Copy Profile Link"
            onClick={handleCopyLink}
          >
            {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          </Button>
        </div>
      )}

      {/* Mutual Friends Modal */}
      <Dialog
        isOpen={isMutualModalOpen}
        onClose={() => setIsMutualModalOpen(false)}
        title={`Mutual Friends with ${user.name || user.username}`}
        description="People you both know in common."
      >
        <div className="space-y-3 pt-2">
          {mutualFriends.map((mf) => (
            <div
              key={mf.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#0f172a] border border-[#1f2937]"
            >
              <div className="flex items-center gap-2.5">
                <Avatar src={mf.avatar} name={mf.name} size="sm" />
                <div>
                  <p className="text-xs font-semibold text-white">{mf.name}</p>
                  <p className="text-[10px] text-slate-400">@{mf.username}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs text-blue-400 hover:text-white"
                  onClick={() => {
                    setIsMutualModalOpen(false);
                    openChat({ id: mf.id, name: mf.name, avatar: mf.avatar });
                  }}
                >
                  <MessageSquare size={12} className="mr-1" />
                  Chat
                </Button>
                <Link href={`/profile/${mf.username}`}>
                  <Button size="sm" variant="secondary" className="h-7 px-2 text-xs">
                    View
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Dialog>
    </div>
  );
};