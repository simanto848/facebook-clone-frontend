"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import ChatTabsContainer from "@/components/features/chat/ChatTabsContainer";
import MobileNavigation from "./MobileNavigation";
import MobileDrawer from "./MobileDrawer";
import KeyboardShortcutsModal from "./KeyboardShortcutsModal";

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
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const pendingGRef = useRef(false);
  const gTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable ||
          target.getAttribute("role") === "textbox")
      ) {
        return;
      }

      if (e.key === "?" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
        return;
      }

      if (e.key === "g" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        pendingGRef.current = true;
        if (gTimerRef.current) clearTimeout(gTimerRef.current);
        gTimerRef.current = setTimeout(() => {
          pendingGRef.current = false;
        }, 1200);
        return;
      }

      if (pendingGRef.current) {
        pendingGRef.current = false;
        if (gTimerRef.current) clearTimeout(gTimerRef.current);

        switch (e.key.toLowerCase()) {
          case "h":
            e.preventDefault();
            router.push("/");
            break;
          case "e":
            e.preventDefault();
            router.push("/explore");
            break;
          case "r":
            e.preventDefault();
            router.push("/reels");
            break;
          case "p":
            e.preventDefault();
            router.push("/profile");
            break;
          case "c":
            e.preventDefault();
            router.push("/connections");
            break;
          case "m":
            e.preventDefault();
            router.push("/messages");
            break;
          case "n":
            e.preventDefault();
            router.push("/notifications");
            break;
          case "s":
            e.preventDefault();
            router.push("/settings");
            break;
          default:
            break;
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (gTimerRef.current) clearTimeout(gTimerRef.current);
    };
  }, [router]);

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

      {/* KEYBOARD SHORTCUTS MODAL */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </>
  );
}
