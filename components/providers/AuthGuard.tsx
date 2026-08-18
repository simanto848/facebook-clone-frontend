"use client";

import React, { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Loader } from "@/components/ui";

const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];

export function AuthGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, accessToken, initialized, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (!initialized) return;

    const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname?.startsWith(route));
    const isAuthenticated = Boolean(user || accessToken);

    if (!isAuthenticated && !isPublicRoute) {
      // Redirect unauthenticated user to /login
      router.push("/login");
    } else if (isAuthenticated && isPublicRoute) {
      // Redirect authenticated user away from login/register to feed
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
