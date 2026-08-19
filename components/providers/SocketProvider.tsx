"use client";

import React, { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react";
import { type Socket } from "socket.io-client";
import { getSocket, disconnectSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { useToast, Avatar } from "@/components/ui";
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

// Web Audio API Synthetic Ringtone for Incoming Calls
class IncomingAudioRingtone {
  private ctx: AudioContext | null = null;
  private timer: any = null;

  startRingtone() {
    this.stop();
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      const playChime = () => {
        if (!this.ctx || this.ctx.state === "closed") return;
        // Standard pleasant incoming phone ringtone chime
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, index) => {
          if (!this.ctx || this.ctx.state === "closed") return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = "sine";
          osc.frequency.value = freq;

          const startTime = this.ctx.currentTime + index * 0.12;
          gain.gain.setValueAtTime(0.12, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + 0.35);
        });
      };

      playChime();
      this.timer = setInterval(playChime, 2400);
    } catch {
      // AudioContext blocked
    }
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.ctx) {
      try {
        this.ctx.close();
      } catch {}
      this.ctx = null;
    }
  }
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

  const ringtoneRef = useRef<IncomingAudioRingtone | null>(null);

  const user = useAuthStore((state) => state.user);
  const { toast } = useToast();

  // Incoming Call Ringtone Effect
  useEffect(() => {
    if (incomingCall) {
      if (!ringtoneRef.current) {
        ringtoneRef.current = new IncomingAudioRingtone();
      }
      ringtoneRef.current.startRingtone();
    } else {
      ringtoneRef.current?.stop();
    }

    return () => {
      ringtoneRef.current?.stop();
    };
  }, [incomingCall]);

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

// Web Audio API Audio Chimes
const playMessageSound = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.value = 800;
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.15);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.value = 1050;
    gain2.gain.setValueAtTime(0.08, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.25);
  } catch {
    // AudioContext blocked
  }
};

const playNotificationSound = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const freqs = [600, 900, 1200];
    freqs.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;

      const startTime = now + index * 0.06;
      gain.gain.setValueAtTime(0.08, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.18);
    });
  } catch {
    // AudioContext blocked
  }
};

      // Real-time notification toast popups & global event dispatch
      activeSocket.on("new_notification", (data: any) => {
        playNotificationSound();

        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("app:new_notification", { detail: data }));
        }

        toast({
          title: data.title || "New Notification",
          description: data.message || "You have a new update.",
          type: "info",
        });
      });

      // Real-time incoming message append (NO toaster popup, NO notification dropdown)
      activeSocket.on("message", (m: any) => {
        playMessageSound();
        const timeStr = new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const senderId = m.senderId;
        const convId = m.conversationId;

        useChatStore.setState((state) => {
          let found = false;
          const updatedConvs = state.conversations.map((c) => {
            if (c.id === senderId || c.id === convId) {
              found = true;
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

          // Also update floating open chat boxes
          const updatedBoxes = state.openChatBoxes.map((b) => {
            if (b.id === senderId || b.id === convId) {
              return {
                ...b,
                messages: [
                  ...b.messages,
                  { sender: "them" as const, text: m.content || "", time: timeStr },
                ],
              };
            }
            return b;
          });

          if (!found) {
            // Trigger background refetch of conversations to include newly messaged user
            setTimeout(() => {
              useChatStore.getState().fetchConversations();
            }, 200);
          }

          return { conversations: updatedConvs, openChatBoxes: updatedBoxes };
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
    ringtoneRef.current?.stop();
    setActiveAcceptedCall(incomingCall);
    setIncomingCall(null);
  };

  const handleDeclineIncomingCall = () => {
    if (!incomingCall || !socket) return;
    ringtoneRef.current?.stop();
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

      {/* INCOMING CALL FLOATING MODAL */}
      {incomingCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-xs transition-opacity animate-in fade-in duration-200" onClick={handleDeclineIncomingCall} />

          <div className="relative z-10 w-full max-w-sm rounded-3xl border border-white/10 bg-linear-to-b from-[#1e293b] to-[#0f172a] p-8 text-center text-white shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="relative inline-block">
              <Avatar src={incomingCall.caller.avatar} name={incomingCall.caller.name} size="2xl" online />
              <span className="animate-ping absolute inset-0 rounded-full border-2 border-emerald-400 opacity-75" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-extrabold text-white">{incomingCall.caller.name}</h3>
              <p className="text-xs text-slate-400 font-medium">
                Incoming {incomingCall.callType === "video" ? "HD Video Call..." : "Voice Call..."}
              </p>
            </div>

            <div className="flex items-center justify-center gap-6 pt-4 border-t border-white/10">
              <button
                onClick={handleDeclineIncomingCall}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-600/30 hover:scale-105 transition-all cursor-pointer"
                title="Decline Call"
              >
                <PhoneOff size={22} />
              </button>

              <button
                onClick={handleAcceptIncomingCall}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white hover:bg-emerald-400 shadow-lg shadow-emerald-500/30 hover:scale-105 transition-all cursor-pointer"
                title="Accept Call"
              >
                {incomingCall.callType === "video" ? <Video size={22} /> : <Phone size={22} />}
              </button>
            </div>
          </div>
        </div>
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
