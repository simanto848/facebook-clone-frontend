import { ChartLine, Circle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { hashtagService } from "@/services/hashtagService";

const friends = [
  {
    name: "Sarah Wilson",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
  },
  {
    name: "Alex Johnson",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80",
  },
  {
    name: "Emma Brown",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
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

    fetchTrends();
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

        <div className="space-y-4">
          {friends.map((friend) => (
            <div
              key={friend.name}
              className="flex items-center gap-3 rounded-xl p-2 transition-all duration-200 hover:bg-[#1a2233] cursor-pointer"
            >
              <div className="relative shrink-0">
                <Image
                  src={friend.image}
                  alt={friend.name}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                />

                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#111827] bg-green-500" />
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-200">
                  {friend.name}
                </h3>

                <p className="text-xs text-slate-500">Online</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;
