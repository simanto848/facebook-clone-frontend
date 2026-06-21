"use client";

import Link from "next/link";
import {
  Bell,
  Bookmark,
  CircleUserRound,
  HelpCircle,
  LogOut,
  Mail,
  Search,
  Settings,
  Shield,
  User,
  MessageSquare,
  CheckCheck,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function Navbar() {
  const [activeDropdown, setActiveDropdown] = useState<"profile" | "notifications" | "messages" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = (type: "profile" | "notifications" | "messages") => {
    setActiveDropdown((prev) => (prev === type ? null : type));
  };

  const notifications = [
    {
      id: 1,
      sender: "David Kim",
      avatar: "https://images.unsplash.com/photo-1780764895105-ea3037466236?q=80&w=100&auto=format&fit=crop",
      text: "liked your photo: \"Neon nights in the city.\"",
      time: "5m ago",
      unread: true,
    },
    {
      id: 2,
      sender: "Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1780570589435-059359e813cc?q=80&w=100&auto=format&fit=crop",
      text: "commented: \"Wow, this looks incredible! What camera did...\"",
      time: "1h ago",
      unread: true,
    },
    {
      id: 3,
      sender: "Elena Rostova",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
      text: "shared your post about Next.js server actions.",
      time: "4h ago",
      unread: false,
    },
    {
      id: 4,
      sender: "Alex Morgan",
      avatar: "https://images.unsplash.com/photo-1779040622687-42bb00790c67?w=100",
      text: "invited you to join UI Brutalists guild.",
      time: "1d ago",
      unread: false,
    },
  ];

  const messages = [
    {
      id: 1,
      sender: "Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1780570589435-059359e813cc?q=80&w=100&auto=format&fit=crop",
      text: "Hey, are we still on for the design review?",
      time: "Active now",
      unread: true,
    },
    {
      id: 2,
      sender: "David Kim",
      avatar: "https://images.unsplash.com/photo-1780764895105-ea3037466236?q=80&w=100&auto=format&fit=crop",
      text: "Check out the new layout prototype!",
      time: "2h ago",
      unread: true,
    },
    {
      id: 3,
      sender: "Elena Rostova",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
      text: "Thanks for sharing the server actions guide! Very helpful.",
      time: "Yesterday",
      unread: false,
    },
  ];

  return (
    <nav className="sticky top-0 z-50 h-16 border-b border-[#1f2937] bg-[#111827]/95 px-6 backdrop-blur-md">
      <div className="flex h-full items-center justify-between">
        {/* Logo */}
        <div>
          <Link href="/">
            <h1 className="bg-linear-to-r from-[#7aa2ff] to-[#ffb088] bg-clip-text text-xl font-bold text-transparent hover:opacity-90 transition">
              Your World
            </h1>
          </Link>
        </div>

        {/* Search */}
        <div className="hidden w-105 items-center rounded-full border border-[#374151] bg-[#1f2937] px-4 py-2 md:flex">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search people, posts, topics..."
            className="ml-3 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />
        </div>

        {/* Actions Dropdown Group */}
        <div className="flex items-center gap-3" ref={containerRef}>
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("notifications")}
              className={`relative flex h-10 w-10 items-center justify-center rounded-full transition ${
                activeDropdown === "notifications" ? "bg-blue-600 text-white" : "bg-[#1f2937] text-slate-300 hover:bg-[#2a3447]"
              }`}
            >
              <Bell size={18} />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
                2
              </span>
            </button>

            {activeDropdown === "notifications" && (
              <div className="absolute right-0 top-14 z-50 w-80 rounded-2xl border border-[#1f2937] bg-[#111827] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between border-b border-[#1f2937] p-4 bg-[#111827]/80">
                  <p className="font-bold text-white text-sm">Notifications</p>
                  <button className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-500 font-semibold transition">
                    <CheckCheck size={12} />
                    Mark all read
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-[#1f2937] custom-scrollbar">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`flex gap-3 p-3.5 hover:bg-[#1f2937]/50 transition cursor-pointer ${
                        notif.unread ? "bg-blue-500/5" : ""
                      }`}
                    >
                      <div className="relative h-9 w-9 rounded-full overflow-hidden shrink-0 border border-[#1f2937]">
                        <Image src={notif.avatar} fill className="object-cover" alt={notif.sender} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-xs text-slate-200 leading-normal">
                          <span className="font-bold text-white mr-1">{notif.sender}</span>
                          {notif.text}
                        </p>
                        <span className="text-[10px] text-slate-500 font-medium block">{notif.time}</span>
                      </div>
                      {notif.unread && (
                        <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0 self-center" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="border-t border-[#1f2937] bg-[#1f2937]/20 p-2.5 text-center">
                  <button className="text-xs font-semibold text-slate-400 hover:text-white transition">
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("messages")}
              className={`relative flex h-10 w-10 items-center justify-center rounded-full transition ${
                activeDropdown === "messages" ? "bg-blue-600 text-white" : "bg-[#1f2937] text-slate-300 hover:bg-[#2a3447]"
              }`}
            >
              <Mail size={18} />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#7aa2ff] text-[10px] font-semibold text-white">
                2
              </span>
            </button>

            {activeDropdown === "messages" && (
              <div className="absolute right-0 top-14 z-50 w-80 rounded-2xl border border-[#1f2937] bg-[#111827] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between border-b border-[#1f2937] p-4 bg-[#111827]/80">
                  <p className="font-bold text-white text-sm">Recent Messages</p>
                  <Link href="/messages" className="text-[10px] text-blue-400 hover:text-blue-500 font-semibold transition">
                    Open Chat
                  </Link>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-[#1f2937] custom-scrollbar">
                  {messages.map((msg) => (
                    <Link
                      key={msg.id}
                      href="/messages"
                      className={`flex gap-3 p-3.5 hover:bg-[#1f2937]/50 transition cursor-pointer block ${
                        msg.unread ? "bg-blue-500/5" : ""
                      }`}
                    >
                      <div className="relative h-9 w-9 rounded-full overflow-hidden shrink-0 border border-[#1f2937]">
                        <Image src={msg.avatar} fill className="object-cover" alt={msg.sender} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-white text-xs">{msg.sender}</span>
                          <span className="text-[9px] text-slate-500 font-medium">{msg.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1 leading-normal">{msg.text}</p>
                      </div>
                      {msg.unread && (
                        <div className="h-2 w-2 rounded-full bg-[#7aa2ff] shrink-0 self-center" />
                      )}
                    </Link>
                  ))}
                </div>

                <div className="border-t border-[#1f2937] bg-[#1f2937]/20 p-2.5 text-center">
                  <Link href="/messages" className="text-xs font-semibold text-slate-400 hover:text-white transition block">
                    View All in Messenger
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("profile")}
              className={`flex items-center gap-2 rounded-full py-1.5 pl-2 pr-3 transition ${
                activeDropdown === "profile" ? "bg-blue-600/25" : "bg-[#1f2937] hover:bg-[#2a3447]"
              }`}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-r from-[#7aa2ff] to-[#ffb088]">
                <CircleUserRound size={20} className="text-white" />
              </div>
              <div className="hidden text-left lg:block">
                <p className="text-sm font-medium text-white">Simanto</p>
                <p className="text-xs text-slate-400">Online</p>
              </div>
            </button>

            {activeDropdown === "profile" && (
              <div className="absolute right-0 top-14 z-50 w-72 overflow-hidden rounded-2xl border border-[#1f2937] bg-[#111827] shadow-2xl shadow-black/40 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* User Info */}
                <div className="border-b border-[#1f2937] p-4">
                  <p className="font-semibold text-white">Simanto Hasan</p>
                  <p className="text-sm text-slate-400">simanto@example.com</p>
                </div>

                {/* Menu */}
                <div className="p-2">
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-slate-300 transition hover:bg-[#1f2937]"
                  >
                    <User size={18} />
                    My Profile
                  </Link>

                  <Link
                    href="/saved"
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-slate-300 transition hover:bg-[#1f2937]"
                  >
                    <Bookmark size={18} />
                    Saved Posts
                  </Link>

                  <Link
                    href="/settings"
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-slate-300 transition hover:bg-[#1f2937]"
                  >
                    <Settings size={18} />
                    Settings
                  </Link>

                  <Link
                    href="/privacy"
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-slate-300 transition hover:bg-[#1f2937]"
                  >
                    <Shield size={18} />
                    Privacy & Security
                  </Link>

                  <Link
                    href="/support"
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-slate-300 transition hover:bg-[#1f2937]"
                  >
                    <HelpCircle size={18} />
                    Help & Support
                  </Link>

                  <hr className="my-2 border-[#1f2937]" />

                  <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-red-400 transition hover:bg-red-500/10">
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

