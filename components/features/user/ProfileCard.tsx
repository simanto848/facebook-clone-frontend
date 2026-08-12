import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useUsers, followUser, unfollowUser } from "@/hooks/useUsers";
import { useRouter } from "next/navigation";
import { UserPlus, UserCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui";

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
        </div>
      </div>

      {/* Follow/Unfollow buttons */}
      {showFollowToggle && !isCurrentUser && userId && !isFollowing && (
        <div className="mt-4">
          <Button
            size="sm"
            variant="primary"
            leftIcon={<UserPlus size={14} />}
            onClick={() => followUser(userId).then(() => setIsFollowing(true))}
          >
            Follow
          </Button>
        </div>
      )}

      {showFollowToggle && !isCurrentUser && userId && isFollowing && (
        <div className="mt-4">
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<UserCheck size={14} />}
            onClick={() => unfollowUser(userId).then(() => setIsFollowing(false))}
          >
            Following
          </Button>
        </div>
      )}
    </div>
  );
};