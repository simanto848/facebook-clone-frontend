"use client";

import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { type Socket } from "socket.io-client";
import { getSocket, disconnectSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/ui";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  typingUsers: Record<string, boolean>; // userId -> boolean
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  typingUsers: {},
});

export const useSocketContext = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});

  const user = useAuthStore((state) => state.user);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      disconnectSocket();
      setSocket(null);
      setIsConnected(false);
      return;
    }

    let activeSocket: Socket | null = null;

    const initSocketConnection = async () => {
      activeSocket = await getSocket();
      if (!activeSocket) return;

      setSocket(activeSocket);

      activeSocket.on("connect", () => {
        setIsConnected(true);
      });

      activeSocket.on("disconnect", () => {
        setIsConnected(false);
      });

      // Real-time typing indicators
      activeSocket.on("user_typing", (data: { userId: string; isTyping: boolean }) => {
        setTypingUsers((prev) => ({
          ...prev,
          [data.userId]: data.isTyping,
        }));
      });

      // Real-time notification toast popups
      activeSocket.on("new_notification", (data: { title?: string; message?: string }) => {
        toast({
          title: data.title || "New Notification",
          description: data.message || "You have a new update.",
          type: "info",
        });
      });
    };

    initSocketConnection();

    return () => {
      if (activeSocket) {
        activeSocket.off("connect");
        activeSocket.off("disconnect");
        activeSocket.off("user_typing");
        activeSocket.off("new_notification");
      }
    };
  }, [user, toast]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, typingUsers }}>
      {children}
    </SocketContext.Provider>
  );
}
