"use client";

import React, { useEffect, type ReactNode } from "react";
import { useAuthStore } from "../store/authStore";
import { useActiveStatus } from "@/hooks/useActiveStatus";
import { GlobalToastProvider } from "@/components/providers/GlobalToastProvider";
import { SocketProvider } from "@/components/providers/SocketProvider";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const initAuth = useAuthStore((state) => state.initAuth);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useActiveStatus(Boolean(user));

  return (
    <GlobalToastProvider>
      <SocketProvider>{children}</SocketProvider>
    </GlobalToastProvider>
  );
}
