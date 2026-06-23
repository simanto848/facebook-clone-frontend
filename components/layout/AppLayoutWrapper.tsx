"use client";

import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import ChatTabsContainer from "@/components/features/chat/ChatTabsContainer";
import MobileNavigation from "./MobileNavigation";
import MobileDrawer from "./MobileDrawer";

interface AppLayoutWrapperProps {
  children: React.ReactNode;
}

export default function AppLayoutWrapper({ children }: AppLayoutWrapperProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      {/* TOP NAVBAR */}
      <Navbar />

      {/* MAIN CONTENT AREA */}
      <div className="pb-16 lg:pb-0">
        {children}
      </div>

      {/* CHAT TAB CONTAINER */}
      <ChatTabsContainer />

      {/* MOBILE BOTTOM NAVIGATION */}
      <MobileNavigation onMenuClick={() => setIsDrawerOpen(true)} />

      {/* MOBILE DRAWER */}
      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
}
