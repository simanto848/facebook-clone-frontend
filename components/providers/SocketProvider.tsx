"use client";

import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { type Socket } from "socket.io-client";
import { getSocket, disconnectSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { useToast, Dialog, Avatar, Button } from "@/components/ui";
import { CallModal } from "@/components/features/chat/CallModal";
import { Phone, PhoneOff, Video } from "lucide-react";

interface IncomingCallInfo {
  callId: string;
  caller: {
    id: string;
    name: string;
    avatar: string;
  };
  conversationId: string;
  offer: any;
  callType: "audio" | "video";
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  typingUsers: Record<string, boolean>;
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

  const [incomingCall, setIncomingCall] = useState<IncomingCallInfo | null>(null);
  const [activeAcceptedCall, setActiveAcceptedCall] = useState<IncomingCallInfo | null>(null);

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
              const isCurrentlyActive = state.activeConversationId === c.id;
              return {
                ...c,
                hasUnread: !isCurrentlyActive,
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

      // Real-time Audio Call Incoming
      activeSocket.on("call:incoming", (data: any) => {
        const callerUser = data.caller || {};
        setIncomingCall({
          callId: data.callId,
          caller: {
            id: callerUser.id || data.callerId,
            name: `${callerUser.firstName || ""} ${callerUser.lastName || ""}`.trim() || callerUser.displayName || callerUser.username || "User",
            avatar: callerUser.avatarUrl || callerUser.profilePicture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
          },
          conversationId: data.conversationId,
          offer: data.offer,
          callType: "audio",
        });
      });

      // Real-time Video Call Incoming
      activeSocket.on("video-call:incoming", (data: any) => {
        const callerUser = data.caller || {};
        setIncomingCall({
          callId: data.callId,
          caller: {
            id: callerUser.id || data.callerId,
            name: `${callerUser.firstName || ""} ${callerUser.lastName || ""}`.trim() || callerUser.displayName || callerUser.username || "User",
            avatar: callerUser.avatarUrl || callerUser.profilePicture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
          },
          conversationId: data.conversationId,
          offer: data.offer,
          callType: "video",
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
        activeSocket.off("call:incoming");
        activeSocket.off("video-call:incoming");
      }
    };
  }, [user, toast]);

  const handleAcceptIncomingCall = () => {
    if (!incomingCall) return;
    setActiveAcceptedCall(incomingCall);
    setIncomingCall(null);
  };

  const handleDeclineIncomingCall = () => {
    if (!incomingCall || !socket) return;
    const prefix = incomingCall.callType === "video" ? "video-call" : "call";
    socket.emit(`${prefix}:reject`, {
      callId: incomingCall.callId,
      callerId: incomingCall.caller.id,
    });
    setIncomingCall(null);
  };

  const activeCall = useChatStore((state) => state.activeCall);
  const endCallState = useChatStore((state) => state.endCallState);

  return (
    <SocketContext.Provider value={{ socket, isConnected, typingUsers }}>
      {children}

      {/* OUTGOING ACTIVE CALL WEBRTC MODAL */}
      {activeCall && (
        <CallModal
          isOpen={Boolean(activeCall)}
          onClose={endCallState}
          recipient={activeCall.recipient}
          callType={activeCall.callType}
        />
      )}

      {/* INCOMING CALL POPUP MODAL */}
      {incomingCall && (
        <Dialog isOpen={Boolean(incomingCall)} onClose={handleDeclineIncomingCall} size="sm" showHeader={false}>
          <div className="flex flex-col items-center p-6 text-center space-y-4 bg-[#111827] rounded-2xl border border-[#1f2937] shadow-2xl">
            <div className="relative">
              <Avatar src={incomingCall.caller.avatar} name={incomingCall.caller.name} size="xl" online />
              <span className="animate-ping absolute inset-0 rounded-full border-2 border-green-500 opacity-75" />
            </div>

            <div>
              <h3 className="font-extrabold text-white text-lg">{incomingCall.caller.name}</h3>
              <p className="text-xs text-slate-400">
                Incoming {incomingCall.callType === "video" ? "HD Video Call..." : "Voice Call..."}
              </p>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <Button
                variant="danger"
                size="lg"
                className="rounded-full h-12 w-12 p-0 flex items-center justify-center"
                onClick={handleDeclineIncomingCall}
                title="Decline Call"
              >
                <PhoneOff size={20} />
              </Button>

              <Button
                variant="primary"
                size="lg"
                className="rounded-full h-12 w-12 p-0 flex items-center justify-center bg-green-600 hover:bg-green-500 shadow-lg shadow-green-600/30"
                onClick={handleAcceptIncomingCall}
                title="Accept Call"
              >
                {incomingCall.callType === "video" ? <Video size={20} /> : <Phone size={20} />}
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* ACCEPTED INCOMING CALL WEBRTC MODAL */}
      {activeAcceptedCall && (
        <CallModal
          isOpen={Boolean(activeAcceptedCall)}
          onClose={() => setActiveAcceptedCall(null)}
          recipient={activeAcceptedCall.caller}
          callType={activeAcceptedCall.callType}
          isIncoming={true}
          incomingOffer={activeAcceptedCall.offer}
          incomingCallId={activeAcceptedCall.callId}
        />
      )}
    </SocketContext.Provider>
  );
}
