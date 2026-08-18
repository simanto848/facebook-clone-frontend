"use client";

import { LeftSidebarItems } from "@/lib/SidebarItems";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Sidebaritem } from "./SidebarItem";
import { usePostStore } from "@/store/postStore";
import { useAuthStore } from "@/store/authStore";
import { User, LogIn } from "lucide-react";

const LeftSidebar = () => {
  const connectionRequests = usePostStore((state) => state.connectionRequests);
  const user = useAuthStore((state) => state.user);

  return (
    <aside className="w-72 min-h-screen bg-[#111827] border-r border-[#1f2937] p-5">
      {user ? (
        <div className="flex items-center gap-3 mb-8">
          <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 bg-linear-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt={user.displayName || user.username}
                fill
                sizes="48px"
                className="object-cover"
              />
            ) : (
              <User size={24} className="text-white" />
            )}
          </div>

          <div className="overflow-hidden">
            <h2 className="font-semibold text-white truncate">{user.displayName || user.username}</h2>
            <p className="text-sm text-slate-400 truncate">@{user.username}</p>
          </div>
        </div>
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
      <nav className="space-y-2">
        {LeftSidebarItems.map((item) => {
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
      </nav>
    </aside>
  );
};

export default LeftSidebar;
