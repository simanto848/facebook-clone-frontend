"use client";

import React, { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Loader } from "@/components/ui";

// Pages that guests can view without logging in
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/signup",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
  "/explore",
  "/privacy",
  "/support",
];

// Auth form routes (logged-in users will be redirected to / if they attempt to view these)
const AUTH_FORM_ROUTES = [
  "/login",
  "/register",
  "/signup",
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

  useEffect(() => {
    if (!initialized) return;

    const isPublicRoute =
      pathname === "/" ||
      PUBLIC_ROUTES.some((route) => route !== "/" && pathname?.startsWith(route));
    const isAuthFormRoute = AUTH_FORM_ROUTES.some((route) => pathname?.startsWith(route));
    const isAuthenticated = Boolean(user || accessToken);

    if (!isAuthenticated && !isPublicRoute) {
      // Redirect unauthenticated visitors away from protected pages (e.g. /settings, /messages) to /login
      router.push("/login");
    } else if (isAuthenticated && isAuthFormRoute) {
      // Redirect logged-in users away from login/signup forms to home feed /
      router.push("/");
    }
  }, [initialized, user, accessToken, pathname, router]);

  if (!initialized) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <Loader label="Initializing authentication session..." />
      </div>
    );
  }

  return <>{children}</>;
}
