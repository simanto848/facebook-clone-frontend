import { ChartLine, Circle, MessageSquare } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { hashtagService } from "@/services/hashtagService";
import { friendshipService } from "@/services/friendshipService";
import { activeStatusService } from "@/services/activeStatusService";
import { useChatStore } from "@/store/chatStore";

interface FriendItem {
  id?: string;
  name: string;
  username?: string;
  image: string;
  isOnline?: boolean;
}

const fallbackFriends: FriendItem[] = [
  {
    id: "u1",
    name: "Sarah Wilson",
    username: "sarahw",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
    isOnline: true,
  },
  {
    id: "u2",
    name: "Alex Johnson",
    username: "alexj",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80",
    isOnline: false,
  },
  {
    id: "u3",
    name: "Emma Brown",
    username: "emmab",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
    isOnline: true,
  },
];

const fallbackTrends = [
  {
    category: "Technology",
    title: "#Glassmorphism",
    posts: "12.5k posts",
  },
  {
    category: "Design",
    title: "#Lumina UI V2",
    posts: "8.2k posts",
  },
  {
    category: "Architecture",
    title: "#React 19",
    posts: "19.4k posts",
  },
];

const RightSidebar = () => {
  const [trends, setTrends] = useState(fallbackTrends);
  const [friendsList, setFriendsList] = useState<FriendItem[]>(fallbackFriends);
  const { openChat } = useChatStore();

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const res = await hashtagService.getTrending(5);
        const items = res?.data || res?.hashtags || res || [];
        if (Array.isArray(items) && items.length > 0) {
          const parsed = items.map((t: any) => ({
            category: t.category || "Trending Topic",
            title: t.name ? (t.name.startsWith("#") ? t.name : `#${t.name}`) : (t.tag ? `#${t.tag}` : "#tech"),
            posts: t._count?.posts ? `${t._count.posts} posts` : (t.count ? `${t.count} posts` : "Hot"),
          }));
          setTrends(parsed);
        }
      } catch (err) {
        console.warn("Using fallback trends due to network error:", err);
      }
    };

    const fetchFriends = async () => {
      try {
        const res = await friendshipService.getFriends();
        const items = res?.data || res || [];
        if (Array.isArray(items) && items.length > 0) {
          const mapped: FriendItem[] = items.map((f: any) => {
            const u = f.friend || f;
            return {
              id: u.id || u._id,
              name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username || "Friend",
              username: u.username || "user",
              image: u.profilePicture || u.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
              isOnline: false,
            };
          });

          // Fetch active presence for friends
          const validIds = mapped.map((m) => m.id).filter(Boolean) as string[];
          if (validIds.length > 0) {
            try {
              const statusRes = await activeStatusService.getBatchStatus(validIds);
              const statuses: any[] = statusRes?.data || statusRes || [];
              if (Array.isArray(statuses)) {
                const statusMap = new Map<string, boolean>();
                statuses.forEach((s) => {
                  if (s.userId) statusMap.set(s.userId, !!s.isOnline);
                });
                mapped.forEach((m) => {
                  if (m.id && statusMap.has(m.id)) {
                    m.isOnline = statusMap.get(m.id);
                  }
                });
              }
            } catch {
              // Ignore presence fetch errors gracefully
            }
          }

          setFriendsList(mapped);
        }
      } catch (err) {
        console.warn("Using fallback friends due to fetch error:", err);
      }
    };

    fetchTrends();
    fetchFriends();
  }, []);

  return (
    <aside className="w-72 min-h-screen bg-[#111827] border-l border-[#1f2937] px-5 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-100">Discovery</h1>

        <p className="text-sm text-slate-500">Stay updated</p>
      </div>

      {/* Trending Card */}
      <div className="rounded-2xl border border-[#232d42] bg-linear-to-br from-[#141625] to-[#111827] p-5 shadow-lg shadow-black/20">
        <div className="flex items-center gap-2 text-[#ffb088]">
          <ChartLine size={16} />
          <h2 className="text-xs font-bold uppercase tracking-wider">
            Trending Now
          </h2>
        </div>

        <div className="my-4 h-px bg-[#232d42]" />

        <div className="space-y-4">
          {trends.map((trend) => {
            const cleanTag = trend.title.replace(/^#/, "");
            return (
              <Link
                key={trend.title}
                href={`/hashtag/${encodeURIComponent(cleanTag)}`}
                className="block group cursor-pointer transition hover:translate-x-0.5"
              >
                <p className="text-xs font-semibold text-slate-500 group-hover:text-blue-400 transition">
                  {trend.category}
                </p>

                <h3 className="mt-0.5 text-sm font-bold text-slate-200 group-hover:text-white transition">
                  {trend.title}
                </h3>

                <span className="text-xs text-slate-500">{trend.posts}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Active Friends Card */}
      <div className="mt-6 rounded-2xl border border-[#232d42] bg-linear-to-br from-[#141625] to-[#111827] p-5 shadow-lg shadow-black/20">
        <div className="flex items-center gap-2 text-[#8ea2d5]">
          <Circle size={10} />
          <h2 className="text-xs font-bold uppercase tracking-wider">
            Active Friends
          </h2>
        </div>

        <div className="my-4 h-px bg-[#232d42]" />

        <div className="space-y-2">
          {friendsList.map((friend) => (
            <div
              key={friend.name}
              className="flex items-center justify-between gap-3 rounded-xl p-2 transition-all duration-200 hover:bg-[#1a2233] group"
            >
              <Link
                href={friend.username ? `/profile/${friend.username}` : "/connections"}
                className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
              >
                <div className="relative shrink-0">
                  <Image
                    src={friend.image}
                    alt={friend.name}
                    width={36}
                    height={36}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                  <span
                    className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#111827] ${
                      friend.isOnline ? "bg-emerald-500 ring-2 ring-emerald-500/20" : "bg-slate-500"
                    }`}
                  />
                </div>

                <div className="min-w-0">
                  <h3 className="text-xs font-semibold text-slate-200 truncate group-hover:text-white transition">
                    {friend.name}
                  </h3>
                  <p className={`text-[10px] font-medium ${friend.isOnline ? "text-emerald-400" : "text-slate-500"}`}>
                    {friend.isOnline ? "Active now" : "Offline"}
                  </p>
                </div>
              </Link>

              <button
                onClick={() =>
                  openChat({
                    id: friend.id || friend.name,
                    name: friend.name,
                    avatar: friend.image,
                  })
                }
                title="Send direct message"
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition cursor-pointer"
              >
                <MessageSquare size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;
