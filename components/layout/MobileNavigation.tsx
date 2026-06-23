"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Compass, UserPlus, Users, Menu, MessageSquare } from "lucide-react";

interface MobileNavigationProps {
  onMenuClick: () => void;
}

export default function MobileNavigation({ onMenuClick }: MobileNavigationProps) {
  const pathname = usePathname();

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
            className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
              isActive ? "text-[#7aa2ff]" : "text-slate-400 hover:text-white"
            }`}
          >
            <Icon size={20} className={isActive ? "scale-110 transition-transform duration-200" : ""} />
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
