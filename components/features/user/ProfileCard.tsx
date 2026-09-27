import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useUsers, followUser, unfollowUser } from "@/hooks/useUsers";
import { useRouter } from "next/navigation";
import { UserPlus, UserCheck, MessageSquare, ExternalLink, MapPin, Copy, Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui";
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
    </div>
  );
};