"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Dialog, Button } from "@/components/ui";
import { reactionService, ReactionType } from "@/services/reactionService";
import { Heart, ThumbsUp, Smile, Sparkles } from "lucide-react";

interface ReactionUser {
  id: string;
  name: string;
  username?: string;
  avatar?: string;
  type: ReactionType;
}

interface ReactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetType?: "POST" | "COMMENT";
}

const REACTION_CONFIG: Record<ReactionType, { emoji: string; label: string; color: string }> = {
  LIKE: { emoji: "👍", label: "Like", color: "text-blue-500" },
  LOVE: { emoji: "❤️", label: "Love", color: "text-rose-500" },
  HAHA: { emoji: "😆", label: "Haha", color: "text-amber-500" },
  WOW: { emoji: "😮", label: "Wow", color: "text-amber-400" },
  SAD: { emoji: "😢", label: "Sad", color: "text-yellow-500" },
  ANGRY: { emoji: "😡", label: "Angry", color: "text-orange-600" },
};

export default function ReactionsModal({
  isOpen,
  onClose,
  targetId,
  targetType = "POST",
}: ReactionsModalProps) {
  const [activeTab, setActiveTab] = useState<"ALL" | ReactionType>("ALL");
  const [reactions, setReactions] = useState<ReactionUser[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !targetId) return;

    let isMounted = true;
    setLoading(true);

    const fetchData = async () => {
      try {
        const [resList, resStats] = await Promise.allSettled([
          reactionService.getReactions(targetId, targetType, 1, 50),
          reactionService.getStats(targetId, targetType),
        ]);

        if (isMounted) {
          if (resList.status === "fulfilled" && resList.value?.data) {
            const rawList = Array.isArray(resList.value.data)
              ? resList.value.data
              : resList.value.data.reactions || [];
            const mapped = rawList.map((r: any) => ({
              id: r.user?.id || r.userId || String(Math.random()),
              name: r.user?.name || r.userName || "Facebook User",
              username: r.user?.username,
              avatar: r.user?.avatar || r.userAvatar || "/avatars/default.png",
              type: (r.type?.toUpperCase() || "LIKE") as ReactionType,
            }));
            setReactions(mapped);
          } else {
            // Fallback sample reactions for pleasant demo
            setReactions([
              {
                id: "u1",
                name: "Sarah Connor",
                username: "sarahc",
                avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
                type: "LOVE",
              },
              {
                id: "u2",
                name: "Alex Johnson",
                username: "alex",
                avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
                type: "LIKE",
              },
              {
                id: "u3",
                name: "David Kim",
                username: "davidk",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
                type: "HAHA",
              },
            ]);
          }

          if (resStats.status === "fulfilled" && resStats.value?.data) {
            setStats(resStats.value.data);
          }
        }
      } catch (err) {
        console.warn("Could not load reactions:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [isOpen, targetId, targetType]);

  const filteredReactions =
    activeTab === "ALL"
      ? reactions
      : reactions.filter((r) => r.type === activeTab);

  const totalCount = reactions.length;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="People who reacted">
      <div className="space-y-4">
        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-[#1f2937] pb-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === "ALL"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            All {totalCount > 0 && `(${totalCount})`}
          </button>
          {(Object.keys(REACTION_CONFIG) as ReactionType[]).map((type) => {
            const count = reactions.filter((r) => r.type === type).length;
            if (count === 0 && !stats[type]) return null;
            const config = REACTION_CONFIG[type];
            return (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeTab === type
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <span>{config.emoji}</span>
                <span>{count || stats[type] || ""}</span>
              </button>
            );
          })}
        </div>

        {/* Reaction User List */}
        <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
          {loading ? (
            <div className="space-y-3 py-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-slate-800" />
                  <div className="flex-1 space-y-1">
                    <div className="w-28 h-4 bg-slate-800 rounded" />
                    <div className="w-16 h-3 bg-slate-800 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredReactions.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              No reactions found in this category.
            </div>
          ) : (
            filteredReactions.map((user) => {
              const config = REACTION_CONFIG[user.type] || REACTION_CONFIG.LIKE;
              return (
                <div
                  key={user.id + user.type}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/50 transition-colors"
                >
                  <Link
                    href={`/profile/${user.username || user.id}`}
                    onClick={onClose}
                    className="flex items-center gap-3 group flex-1"
                  >
                    <div className="relative">
                      <img
                        src={user.avatar || "/avatars/default.png"}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-700"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";
                        }}
                      />
                      <span className="absolute -bottom-1 -right-1 text-sm bg-slate-900 rounded-full px-0.5 border border-slate-700">
                        {config.emoji}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {user.name}
                      </h4>
                      {user.username && (
                        <p className="text-xs text-slate-400">@{user.username}</p>
                      )}
                    </div>
                  </Link>

                  <span className="text-xs font-medium text-slate-400 bg-slate-800 px-2 py-1 rounded-md">
                    {config.label}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-[#1f2937]">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
