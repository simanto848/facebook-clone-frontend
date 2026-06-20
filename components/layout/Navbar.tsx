import { Bell, CircleUserRound, Mail, Search } from "lucide-react";
import React from "react";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 h-16 bg-[#111827]/95 backdrop-blur-md border-b border-[#1f2937] px-6">
      <div className="h-full flex items-center justify-between">
        {/* Logo */}
        <div>
          <h1 className="text-xl font-bold bg-linear-to-r from-[#7aa2ff] to-[#ffb088] bg-clip-text text-transparent">
            Your World
          </h1>
        </div>

        {/* Search */}
        <div className="hidden md:flex items-center w-105 bg-[#1f2937] border border-[#374151] rounded-full px-4 py-2">
          <Search size={18} className="text-slate-400" />

          <input
            type="text"
            placeholder="Search people, posts, topics..."
            className="ml-3 flex-1 bg-transparent outline-none text-sm text-white placeholder:text-slate-500"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button className="relative h-10 w-10 rounded-full bg-[#1f2937] hover:bg-[#2a3447] transition flex items-center justify-center">
            <Bell size={18} className="text-slate-300" />

            <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-[10px] font-semibold text-white">
              3
            </span>
          </button>

          {/* Messages */}
          <button className="relative h-10 w-10 rounded-full bg-[#1f2937] hover:bg-[#2a3447] transition flex items-center justify-center">
            <Mail size={18} className="text-slate-300" />

            <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 rounded-full bg-[#7aa2ff] text-[10px] font-semibold text-white">
              5
            </span>
          </button>

          {/* Profile */}
          <button className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-[#1f2937] hover:bg-[#2a3447] transition">
            <div className="flex items-center justify-center h-9 w-9 rounded-full bg-linear-to-r from-[#7aa2ff] to-[#ffb088]">
              <CircleUserRound size={20} className="text-white" />
            </div>

            <div className="hidden lg:block text-left">
              <p className="text-sm font-medium text-white">Simanto</p>
              <p className="text-xs text-slate-400">Online</p>
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
