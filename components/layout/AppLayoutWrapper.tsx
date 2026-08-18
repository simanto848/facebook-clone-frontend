"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import ChatTabsContainer from "@/components/features/chat/ChatTabsContainer";
import MobileNavigation from "./MobileNavigation";
import MobileDrawer from "./MobileDrawer";

const AUTH_ROUTES = [
  "/login",
  "/signup",
  "/register",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
];

interface AppLayoutWrapperProps {
  children: React.ReactNode;
}

export default function AppLayoutWrapper({ children }: AppLayoutWrapperProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const pathname = usePathname();

  const isAuthPage = AUTH_ROUTES.some((route) => pathname?.startsWith(route));

  if (isAuthPage) {
    return <>{children}</>;
  }

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
