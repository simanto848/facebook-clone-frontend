"use client";

import { LeftSidebarItems } from "@/lib/SidebarItems";
import Image from "next/image";
import React from "react";
import { Sidebaritem } from "./SidebarItem";
import { usePostStore } from "@/store/postStore";

const LeftSidebar = () => {
  const connectionRequests = usePostStore((state) => state.connectionRequests);

  return (
    <aside
      className="
        w-72
        min-h-screen
        bg-[#111827]
        border-r
        border-[#1f2937]
        p-5
      "
    >
      {/* User */}
      <div className="flex items-center gap-3 mb-8">
        <Image
          src="https://images.unsplash.com/photo-1779040622687-42bb00790c67?w=500"
          alt="Alex"
          width={48}
          height={48}
          className="rounded-full"
        />

        <div>
          <h2 className="font-semibold text-white">Alex Morgan</h2>

          <p className="text-sm text-slate-400">@alex</p>
        </div>
      </div>

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
