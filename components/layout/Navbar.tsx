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
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="sticky top-0 z-50 h-16 border-b border-[#1f2937] bg-[#111827]/95 px-6 backdrop-blur-md">
      <div className="flex h-full items-center justify-between">
        {/* Logo */}
        <div>
          <h1 className="bg-linear-to-r from-[#7aa2ff] to-[#ffb088] bg-clip-text text-xl font-bold text-transparent">
            Your World
          </h1>
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

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#1f2937] transition hover:bg-[#2a3447]">
            <Bell size={18} className="text-slate-300" />

            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
              3
            </span>
          </button>

          {/* Messages */}
          <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#1f2937] transition hover:bg-[#2a3447]">
            <Mail size={18} className="text-slate-300" />

            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#7aa2ff] text-[10px] font-semibold text-white">
              5
            </span>
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 rounded-full bg-[#1f2937] py-1.5 pl-2 pr-3 transition hover:bg-[#2a3447]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-r from-[#7aa2ff] to-[#ffb088]">
                <CircleUserRound size={20} className="text-white" />
              </div>

              <div className="hidden text-left lg:block">
                <p className="text-sm font-medium text-white">Simanto</p>

                <p className="text-xs text-slate-400">Online</p>
              </div>
            </button>

            {/* Dropdown */}
            {showDropdown && (
              <div className="absolute right-0 top-14 z-50 w-72 overflow-hidden rounded-2xl border border-[#1f2937] bg-[#111827] shadow-2xl shadow-black/40">
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
};

export default Navbar;
