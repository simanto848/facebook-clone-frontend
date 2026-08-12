import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useUsers } from "@/hooks/useUsers";
import { useRouter } from "next/navigation";
import { Follow, Unfollow, Flag, Shield, Check } from "lucide-react";
import Link from "next/link";

export interface ProfileCardProps {
  userId?: string;
  username?: string;
  size?: "sm" | "md" | "lg";
  showFollowToggle?: boolean;
}

export const ProfileCard = ({
  userId,
  username,
  size = "md",
  showFollowToggle = true,
}: ProfileCardProps) => {
  const { data: profile, isLoading, error, refetch } = useUsers(
    userId ? `/${userId}` : undefined
  );
  const router = useRouter();

  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (profile?.user) {
      setIsFollowing(profile.isFollowing ?? false);
    }
  }, [profile]);

  if (isLoading) {
    return (
      <div className="h-20 w-20 rounded-full bg-[#1f2937] animate-pulse" />
    );
  }

  if (error) {
    return <div className="text-sm text-red-400">Error loading profile</div>;
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
        <div className="relative h-16 w-16 rounded-full overflow-hidden shrink-0">
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
            href=userId ? `/profile/${userId}` : `/profile/${user.username}`
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
        </div>
      </div>

      {/* Follow/Unfollow buttons */}
      {showFollowToggle && !isCurrentUser && userId && !isFollowing && (
        <button
          onClick={() => followUser(userId).then(() => setIsFollowing(true))}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition
            bg-blue-600 text-white hover:bg-blue-700`}
        >
          <Follow size={14} className="fill-white" />
          Follow
        </button>
      )}

      {showFollowToggle && !isCurrentUser && userId && isFollowing && (
        <button
          onClick={() => unfollowUser(userId).then(() => setIsFollowing(false))}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition
            border border-[#1f2937] text-slate-300 hover:bg-[#111827]`}
        >
          <Unfollow size={14} className="fill-slate-300" />
          Following
        </button>
      )}

      {/* Action menu (more options) */}
      {(!isCurrentUser && showFollowToggle) && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-2 top-2 rounded-lg border border-[#1f2937] bg-[#111827] p-1 shadow-xs cursor-pointer"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-slate-400 hover:text-white"
          >
            <circle cx="9" cy="9" r="2" />
            <circle cx="20" cy="20" r="2" />
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      )}
    </div>
  );
};