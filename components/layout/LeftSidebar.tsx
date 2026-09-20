"use client";

import { LeftSidebarItems } from "@/lib/SidebarItems";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Sidebaritem } from "./SidebarItem";
import { usePostStore } from "@/store/postStore";
import { useAuthStore } from "@/store/authStore";
import { callService } from "@/services/callService";
import { User, LogIn, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";

const LeftSidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const connectionRequests = usePostStore((state) => state.connectionRequests);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!user) return;

    callService.pingActiveStatus().catch(() => {});

    const interval = setInterval(() => {
      callService.pingActiveStatus().catch(() => {});
    }, 45000);

    return () => clearInterval(interval);
  }, [user]);

  return (
    <aside className="w-72 min-h-screen bg-[#111827] border-r border-[#1f2937] p-5">
      {user ? (
        <Link href="/profile" className="flex items-center gap-3 mb-8 group cursor-pointer">
          <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 bg-linear-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt={user.displayName || user.username}
                fill
                sizes="48px"
                className="object-cover group-hover:scale-105 transition"
              />
            ) : (
              <User size={24} className="text-white" />
            )}
            <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#111827] bg-emerald-500 shadow-xs" />
          </div>

          <div className="overflow-hidden">
            <h2 className="font-semibold text-white group-hover:text-blue-400 transition truncate">{user.displayName || user.username}</h2>
            <p className="text-sm text-slate-400 truncate">@{user.username}</p>
          </div>
        </Link>
      ) : (
        <div className="mb-8 p-4 rounded-2xl border border-[#1f2937] bg-[#1f2937]/30 space-y-3">
          <div>
            <h3 className="font-bold text-sm text-white">Join the Community</h3>
            <p className="text-xs text-slate-400">Sign in to share posts, connect with friends, and leave comments.</p>
          </div>
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition"
          >
            <LogIn size={14} />
            <span>Log In Now</span>
          </Link>
        </div>
      )}

      {/* Navigation */}
      <nav className="space-y-1">
        {(isExpanded ? LeftSidebarItems : LeftSidebarItems.slice(0, 6)).map((item) => {
          const isConnections = item.label === "Connections";
          const badgeValue = isConnections ? connectionRequests.length : undefined;
          return (
            <Sidebaritem
              key={item.label}
              icon={item.icon}
              label={item.label}
              href={item.href}
              badge={badgeValue}
            />
          );
        })}

        {LeftSidebarItems.length > 6 && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-3 w-full p-3 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition cursor-pointer text-sm font-semibold"
          >
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
            <span>{isExpanded ? "See Less" : `See More (${LeftSidebarItems.length - 6})`}</span>
          </button>
        )}
      </nav>
    </aside>
  );
};

export default LeftSidebar;
