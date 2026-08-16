"use client";

import React, { useState } from "react";
import { Dialog, Tabs, Avatar, Button, EmptyState } from "@/components/ui";
import { UserPlus, UserCheck } from "lucide-react";
import Link from "next/link";

interface UserItem {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isFollowing?: boolean;
}

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  followers: UserItem[];
  following: UserItem[];
  initialTab?: "followers" | "following";
}

export function FollowersModal({
  isOpen,
  onClose,
  followers = [],
  following = [],
  initialTab = "followers",
}: FollowersModalProps) {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});

  const tabItems = [
    { id: "followers", label: "Followers", badge: followers.length },
    { id: "following", label: "Following", badge: following.length },
  ];

  const handleToggleFollow = (id: string) => {
    setFollowingMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const activeList = activeTab === "followers" ? followers : following;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Network Connections" size="md">
      <div className="space-y-4">
        <Tabs
          tabs={tabItems}
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="pills"
        />

        <div className="max-h-96 overflow-y-auto space-y-3 custom-scrollbar pr-1">
          {activeList.length === 0 ? (
            <EmptyState
              title={activeTab === "followers" ? "No followers yet" : "Not following anyone"}
              description="Connect with developers to build your network."
            />
          ) : (
            activeList.map((user) => {
              const isFollowing = followingMap[user.id] ?? user.isFollowing;
              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-[#1f2937] bg-[#111827] hover:border-slate-700 transition"
                >
                  <Link
                    href={`/profile/${user.username || user.id}`}
                    onClick={onClose}
                    className="flex items-center gap-3 hover:opacity-90 transition min-w-0"
                  >
                    <Avatar src={user.avatar} name={user.name} size="md" />
                    <div className="truncate">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <p className="text-[10px] text-slate-400">@{user.username || "user"}</p>
                    </div>
                  </Link>

                  <Button
                    size="sm"
                    variant={isFollowing ? "secondary" : "primary"}
                    leftIcon={isFollowing ? <UserCheck size={13} /> : <UserPlus size={13} />}
                    onClick={() => handleToggleFollow(user.id)}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Dialog>
  );
}
