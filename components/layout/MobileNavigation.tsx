"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Compass, UserPlus, Users, Menu, MessageSquare } from "lucide-react";
import { useChatStore } from "@/store/chatStore";

interface MobileNavigationProps {
  onMenuClick: () => void;
}

export default function MobileNavigation({ onMenuClick }: MobileNavigationProps) {
  const pathname = usePathname();
  const unreadMessagesCount = useChatStore(
    (state) => state.conversations.filter((c) => c.hasUnread).length
  );

  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: House,
    },
    {
      label: "Explore",
      href: "/explore",
      icon: Compass,
    },
    {
      label: "Connections",
      href: "/connections",
      icon: UserPlus,
    },
    {
      label: "Groups",
      href: "/groups",
      icon: Users,
    },
    {
      label: "Messages",
      href: "/messages",
      icon: MessageSquare,
      badge: unreadMessagesCount,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 h-16 border-t border-[#1f2937] bg-[#111827]/95 backdrop-blur-md lg:hidden flex items-center justify-around px-2 shadow-2xl">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.label}
            href={item.href}
            className={`relative flex flex-col items-center justify-center flex-1 py-1 transition ${
              isActive ? "text-[#7aa2ff]" : "text-slate-400 hover:text-white"
            }`}
          >
            {isActive && (
              <span className="absolute top-0 w-8 h-0.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
            )}
            <div className="relative">
              <Icon size={20} className={isActive ? "scale-110 transition-transform duration-200" : ""} />
              {typeof item.badge === "number" && item.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center shadow-md animate-pulse">
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
          </Link>
        );
      })}

      <button
        onClick={onMenuClick}
        className="flex flex-col items-center justify-center flex-1 py-1 text-slate-400 hover:text-white transition"
      >
        <Menu size={20} />
        <span className="text-[10px] mt-1 font-medium">More</span>
      </button>
    </nav>
  );
}
