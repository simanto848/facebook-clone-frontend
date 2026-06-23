"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { X, Bookmark, Settings, User, LogOut, HelpCircle, Shield, Calendar, Bell } from "lucide-react";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const pathname = usePathname();

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
        <div className="flex items-center gap-3 mb-6 p-3 rounded-2xl bg-[#1f2937]/50 border border-[#1f2937]">
          <Image
            src="https://images.unsplash.com/photo-1779040622687-42bb00790c67?w=200"
            alt="Alex"
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
          <div>
            <h4 className="font-semibold text-white text-sm">Alex Morgan</h4>
            <p className="text-xs text-slate-400">@alex</p>
          </div>
        </div>

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
          <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/10">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
