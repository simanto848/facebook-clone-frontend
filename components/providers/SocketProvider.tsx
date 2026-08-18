"use client";

import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { type Socket } from "socket.io-client";
import { getSocket, disconnectSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
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

      // Real-time incoming message append
      activeSocket.on("message", (m: any) => {
        const timeStr = new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const senderId = m.senderId;
        const convId = m.conversationId;

        useChatStore.setState((state) => {
          const updatedConvs = state.conversations.map((c) => {
            if (c.id === senderId || c.id === convId) {
              return {
                ...c,
                messages: [
                  ...c.messages,
                  { sender: "them" as const, text: m.content || "", time: timeStr },
                ],
              };
            }
            return c;
          });

          return { conversations: updatedConvs };
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
        activeSocket.off("message");
      }
    };
  }, [user, toast]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, typingUsers }}>
      {children}
    </SocketContext.Provider>
  );
}
