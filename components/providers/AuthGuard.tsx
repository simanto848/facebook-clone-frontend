"use client";

import React, { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Loader } from "@/components/ui";

const GUEST_AUTH_ROUTES = [
  "/login",
  "/signup",
  "/register",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
];

export function AuthGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, accessToken, initialized, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const isAuthenticated = Boolean(user || accessToken);
  const isGuestAuthRoute = GUEST_AUTH_ROUTES.some((route) => pathname?.startsWith(route));

  useEffect(() => {
    if (!initialized) return;

    if (!isAuthenticated && !isGuestAuthRoute) {
      // Redirect unauthenticated user to /login
      router.push("/login");
    } else if (isAuthenticated && isGuestAuthRoute) {
      // Redirect authenticated user away from login/signup to home feed /
      router.push("/");
    }
  }, [initialized, isAuthenticated, isGuestAuthRoute, pathname, router]);

  if (!initialized) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <Loader label="Initializing session..." />
      </div>
    );
  }

  // Prevent flash of protected UI content for unauthenticated users
  if (!isAuthenticated && !isGuestAuthRoute) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <Loader label="Redirecting to login..." />
      </div>
    );
  }

  return <>{children}</>;
}
