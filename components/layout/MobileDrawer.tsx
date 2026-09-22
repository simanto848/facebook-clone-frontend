"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { X, Bookmark, Settings, User, LogOut, HelpCircle, Shield, Calendar, Bell, Clapperboard, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();

  // Close drawer on path change
  useEffect(() => {
    onClose();
  }, [pathname]);

  // Disable scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer Content */}
      <div className="absolute top-0 right-0 bottom-0 w-80 max-w-full bg-[#111827] border-l border-[#1f2937] flex flex-col p-6 shadow-2xl animate-in slide-in-from-right duration-250">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1f2937]">
          <span className="font-bold text-white text-lg">Menu</span>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-[#1f2937] text-slate-400 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Card */}
        <Link
          href="/profile"
          className="flex items-center gap-3 mb-6 p-3 rounded-2xl bg-[#1f2937]/50 border border-[#1f2937] hover:bg-[#1f2937] transition group cursor-pointer"
        >
          <div className="relative h-10 w-10 rounded-full overflow-hidden border border-[#374151] bg-slate-800 shrink-0">
            {user?.avatar || (user as any)?.profilePicture ? (
              <Image
                src={user?.avatar || (user as any)?.profilePicture}
                alt={user?.displayName || user?.username || "User"}
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-xs font-bold text-white bg-blue-600">
                {(user?.displayName || user?.username || "U")[0].toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-white text-sm truncate group-hover:text-blue-400 transition">
              {user?.displayName || user?.username || "My Account"}
            </h4>
            <p className="text-xs text-slate-400 truncate">@{user?.username || "user"}</p>
          </div>
        </Link>

        {/* Drawer Links */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-2 custom-scrollbar">
          <Link
            href="/profile"
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
              pathname === "/profile" ? "bg-[#7aa2ff]/10 text-[#7aa2ff]" : "text-slate-300 hover:bg-[#1f2937]"
            }`}
          >
            <User size={18} />
            My Profile
          </Link>

          <Link
            href="/notifications"
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
              pathname === "/notifications" ? "bg-[#7aa2ff]/10 text-[#7aa2ff]" : "text-slate-300 hover:bg-[#1f2937]"
            }`}
          >
            <Bell size={18} />
            Notifications
          </Link>

          <Link
            href="/reels"
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
              pathname === "/reels" ? "bg-[#7aa2ff]/10 text-[#7aa2ff]" : "text-slate-300 hover:bg-[#1f2937]"
            }`}
          >
            <Clapperboard size={18} />
            Reels & Clips
          </Link>

          <Link
            href="/memories"
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
              pathname === "/memories" ? "bg-[#7aa2ff]/10 text-[#7aa2ff]" : "text-slate-300 hover:bg-[#1f2937]"
            }`}
          >
            <Sparkles size={18} />
            Memories
          </Link>

          <Link
            href="/bookmarks"
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
              pathname === "/bookmarks" ? "bg-[#7aa2ff]/10 text-[#7aa2ff]" : "text-slate-300 hover:bg-[#1f2937]"
            }`}
          >
            <Bookmark size={18} />
            Bookmarks
          </Link>

          <Link
            href="/saved"
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
              pathname === "/saved" ? "bg-[#7aa2ff]/10 text-[#7aa2ff]" : "text-slate-300 hover:bg-[#1f2937]"
            }`}
          >
            <Bookmark size={18} className="rotate-90" />
            Saved Posts
          </Link>

          <Link
            href="/events"
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
              pathname === "/events" ? "bg-[#7aa2ff]/10 text-[#7aa2ff]" : "text-slate-300 hover:bg-[#1f2937]"
            }`}
          >
            <Calendar size={18} />
            Events
          </Link>

          <hr className="border-[#1f2937] my-3" />

          <Link
            href="/settings"
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
              pathname === "/settings" ? "bg-[#7aa2ff]/10 text-[#7aa2ff]" : "text-slate-300 hover:bg-[#1f2937]"
            }`}
          >
            <Settings size={18} />
            Settings
          </Link>

          <Link
            href="/privacy"
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
              pathname === "/privacy" ? "bg-[#7aa2ff]/10 text-[#7aa2ff]" : "text-slate-300 hover:bg-[#1f2937]"
            }`}
          >
            <Shield size={18} />
            Privacy & Security
          </Link>

          <Link
            href="/support"
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
              pathname === "/support" ? "bg-[#7aa2ff]/10 text-[#7aa2ff]" : "text-slate-300 hover:bg-[#1f2937]"
            }`}
          >
            <HelpCircle size={18} />
            Help & Support
          </Link>
        </div>

        {/* Footer / Logout */}
        <div className="pt-4 border-t border-[#1f2937]">
          <button
            onClick={async () => {
              onClose();
              await logout();
              router.push("/login");
            }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/10 cursor-pointer"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
