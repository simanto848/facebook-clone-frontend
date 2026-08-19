"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Volume2, VolumeX, Maximize2, Minimize2 } from "lucide-react";
import { Avatar, Badge } from "@/components/ui";
import { useSocketContext } from "@/components/providers/SocketProvider";
import { useChatStore } from "@/store/chatStore";

export interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: {
    id: string;
    name: string;
    avatar: string;
    isOnline?: boolean;
  };
  callType: "audio" | "video";
  isIncoming?: boolean;
  incomingOffer?: any;
  incomingCallId?: string;
}

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

// Web Audio API Ringtone & Busy Tone Generator
class CallAudioTone {
  private ctx: AudioContext | null = null;
  private timer: any = null;

  startRinging() {
    this.stop();
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      const playPulse = () => {
        if (!this.ctx || this.ctx.state === "closed") return;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.frequency.value = 440;
        osc2.frequency.value = 480;

        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.8);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start();
        osc2.start();
        osc1.stop(this.ctx.currentTime + 1.8);
        osc2.stop(this.ctx.currentTime + 1.8);
      };

      playPulse();
      this.timer = setInterval(playPulse, 3500);
    } catch {
      // AudioContext blocked
    }
  }

  startBusyTone() {
    this.stop();
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      const playPulse = () => {
        if (!this.ctx || this.ctx.state === "closed") return;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.frequency.value = 480;
        osc2.frequency.value = 620;

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start();
        osc2.start();
        osc1.stop(this.ctx.currentTime + 0.25);
        osc2.stop(this.ctx.currentTime + 0.25);
      };

      playPulse();
      this.timer = setInterval(playPulse, 500);
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

export function CallModal({
  isOpen,
  onClose,
  recipient,
  callType = "audio",
  isIncoming = false,
  incomingOffer,
  incomingCallId,
}: CallModalProps) {
  const { socket } = useSocketContext();
  const conversations = useChatStore((state) => state.conversations);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === "audio");
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  const [callStatus, setCallStatus] = useState<"calling" | "offline" | "connecting" | "connected" | "ended">(
    isIncoming ? "connecting" : "calling"
  );
  const [duration, setDuration] = useState(0);
  const [activeCallId, setActiveCallId] = useState<string | null>(incomingCallId || null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const toneRef = useRef<CallAudioTone | null>(null);
  const recordedHistoryRef = useRef<boolean>(false);

  // Determine if recipient is online
  const targetConv = conversations.find((c) => c.id === recipient.id);
  const isTargetOnline = recipient.isOnline ?? targetConv?.online ?? true;

  const recordCallInChatHistory = (type: "ended" | "rejected" | "offline") => {
    if (!recipient.id || recordedHistoryRef.current) return;
    recordedHistoryRef.current = true;

    const callName = callType === "video" ? "📹 Video Call" : "📞 Voice Call";
    let text = "";

    if (type === "ended") {
      text = duration > 0 ? `${callName} ended • ${formatDuration(duration)}` : `${callName} ended`;
    } else if (type === "rejected") {
      text = `${callName} declined`;
    } else if (type === "offline") {
      text = `${callName} • User unavailable`;
    }

    if (text) {
      useChatStore.getState().sendDirectMessage(recipient.id, text);
    }
  };

  // Duration Timer
  useEffect(() => {
    if (callStatus !== "connected") return;
    toneRef.current?.stop();

    const interval = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [callStatus]);

  // Audio Tone Feedback (Ringing or Busy Tone)
  useEffect(() => {
    if (!isOpen) return;

    if (!toneRef.current) {
      toneRef.current = new CallAudioTone();
    }

    if (callStatus === "calling") {
      if (isTargetOnline) {
        toneRef.current.startRinging();
      } else {
        setCallStatus("offline");
        toneRef.current.startBusyTone();
        recordCallInChatHistory("offline");

        const autoHangup = setTimeout(() => {
          handleEndCall();
        }, 3800);
        return () => clearTimeout(autoHangup);
      }
    }

    return () => {
      toneRef.current?.stop();
    };
  }, [isOpen, callStatus, isTargetOnline]);

  // WebRTC Setup
  useEffect(() => {
    if (!isOpen || !recipient.id || !socket) return;

    let isMounted = true;
    const eventPrefix = callType === "video" ? "video-call" : "call";

    const setupWebRTC = async () => {
      try {
        const constraints: MediaStreamConstraints = {
          audio: true,
          video: callType === "video",
        };

        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (mediaErr) {
          console.warn("Camera/Mic access warning, fallback to audio only:", mediaErr);
          stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        }

        localStreamRef.current = stream;
        if (localVideoRef.current && callType === "video") {
          localVideoRef.current.srcObject = stream;
        }

        const pc = new RTCPeerConnection(RTC_CONFIG);
        pcRef.current = pc;

        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        pc.ontrack = (event) => {
          if (!isMounted) return;
          toneRef.current?.stop();
          const remoteStream = event.streams[0];

          if (callType === "video" && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          } else if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = remoteStream;
          }
          setCallStatus("connected");
        };

        pc.onicecandidate = (event) => {
          if (event.candidate && socket) {
            socket.emit(`${eventPrefix}:ice-candidate`, {
              targetId: recipient.id,
              candidate: event.candidate,
              callId: activeCallId,
            });
          }
        };

        if (isIncoming && incomingOffer) {
          await pc.setRemoteDescription(new RTCSessionDescription(incomingOffer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          socket.emit(`${eventPrefix}:accept`, {
            callId: incomingCallId,
            callerId: recipient.id,
            answer,
          });
          setCallStatus("connected");
        } else if (isTargetOnline) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          socket.emit(`${eventPrefix}:initiate`, {
            conversationId: recipient.id,
            receiverId: recipient.id,
            offer,
          });
        }
      } catch (err) {
        console.error("WebRTC Setup error:", err);
      }
    };

    setupWebRTC();

    const handleCallInitiated = (data: { callId: string }) => {
      setActiveCallId(data.callId);
    };

    const handleCallAccepted = async (data: { callId: string; answer: any }) => {
      toneRef.current?.stop();
      if (pcRef.current && data.answer) {
        try {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
          setCallStatus("connected");
        } catch (e) {
          console.error("Error setting remote description from answer:", e);
        }
      }
    };

    const handleCallRejected = () => {
      toneRef.current?.stop();
      recordCallInChatHistory("rejected");
      setCallStatus("ended");
      cleanup();
      setTimeout(onClose, 1000);
    };

    const handleCallEnded = () => {
      toneRef.current?.stop();
      recordCallInChatHistory("ended");
      setCallStatus("ended");
      cleanup();
      setTimeout(onClose, 500);
    };

    const handleIceCandidate = async (data: { senderId: string; candidate: any }) => {
      if (pcRef.current && data.candidate) {
        try {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (e) {
          console.error("Error adding ice candidate:", e);
        }
      }
    };

    socket.on(`${eventPrefix}:initiated`, handleCallInitiated);
    socket.on(`${eventPrefix}:accepted`, handleCallAccepted);
    socket.on(`${eventPrefix}:rejected`, handleCallRejected);
    socket.on(`${eventPrefix}:ended`, handleCallEnded);
    socket.on(`${eventPrefix}:ice-candidate`, handleIceCandidate);

    return () => {
      isMounted = false;
      socket.off(`${eventPrefix}:initiated`, handleCallInitiated);
      socket.off(`${eventPrefix}:accepted`, handleCallAccepted);
      socket.off(`${eventPrefix}:rejected`, handleCallRejected);
      socket.off(`${eventPrefix}:ended`, handleCallEnded);
      socket.off(`${eventPrefix}:ice-candidate`, handleIceCandidate);
      cleanup();
    };
  }, [isOpen, recipient.id, callType, isIncoming, incomingOffer, incomingCallId, socket, isTargetOnline]);

  const cleanup = () => {
    toneRef.current?.stop();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
  };

  const toggleMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = isMuted;
      });
    }
    setIsMuted(!isMuted);
  };

  const toggleVideo = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((t) => {
        t.enabled = isVideoOff;
      });
    }
    setIsVideoOff(!isVideoOff);
  };

  const toggleSpeaker = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = isSpeakerOn;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = isSpeakerOn;
    }
    setIsSpeakerOn(!isSpeakerOn);
  };

  const handleEndCall = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    toneRef.current?.stop();
    recordCallInChatHistory("ended");

    const eventPrefix = callType === "video" ? "video-call" : "call";
    if (socket && recipient.id) {
      socket.emit(`${eventPrefix}:end`, {
        callId: activeCallId || incomingCallId,
        targetId: recipient.id,
        duration,
      });
    }
    setCallStatus("ended");
    cleanup();
    setTimeout(onClose, 500);
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  // MINIMIZED FLOATING PIP WIDGET (allows browsing site while talking)
  if (isMinimized) {
    return (
      <div className="fixed bottom-20 right-6 z-50 flex items-center justify-between gap-3 w-80 p-3 bg-[#111827] border border-[#1f2937] rounded-2xl shadow-2xl animate-in slide-in-from-bottom-5 duration-200 pointer-events-auto">
        <audio ref={remoteAudioRef} autoPlay />

        <div className="flex items-center gap-3 min-w-0">
          <Avatar src={recipient.avatar} name={recipient.name} size="md" online={isTargetOnline} />
          <div className="min-w-0">
            <p className="font-bold text-white text-xs truncate">{recipient.name}</p>
            <span className="text-[10px] text-green-400 font-semibold block">
              {callStatus === "connected"
                ? formatDuration(duration)
                : callStatus === "offline"
                ? "User Offline"
                : "Calling..."}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={toggleMute}
            className={`p-2 rounded-full transition cursor-pointer ${
              isMuted ? "bg-red-600 text-white" : "bg-[#1f2937] text-slate-300 hover:bg-[#374151]"
            }`}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <MicOff size={14} /> : <Mic size={14} />}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(false);
            }}
            className="p-2 rounded-full bg-[#1f2937] text-slate-300 hover:bg-[#374151] transition cursor-pointer"
            title="Expand call"
          >
            <Maximize2 size={14} />
          </button>

          <button
            onClick={handleEndCall}
            className="p-2 rounded-full bg-red-600 text-white hover:bg-red-500 transition cursor-pointer"
            title="End call"
          >
            <PhoneOff size={14} />
          </button>
        </div>
      </div>
    );
  }

  // EXPANDED CALL MODAL DIALOG
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-xs transition-opacity" onClick={handleEndCall} />

      {/* Main Call Card */}
      <div className="relative z-10 w-full max-w-md h-[520px] bg-linear-to-b from-[#1e293b] to-[#0f172a] border border-[#1f2937] rounded-3xl overflow-hidden flex flex-col justify-between p-6 text-center select-none shadow-2xl pointer-events-auto">
        <audio ref={remoteAudioRef} autoPlay />

        {/* Video Feeds */}
        {callType === "video" && (
          <div className="absolute inset-0 z-0 bg-black">
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute top-4 right-4 z-20 w-28 h-36 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-slate-900">
              <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            </div>
          </div>
        )}

        {/* Header Overlay Controls */}
        <div className="flex items-center justify-between z-10">
          <Badge variant="glass">
            {callType === "video" ? "HD Video Call" : "Voice Call"}
          </Badge>

          <div className="flex items-center gap-2">
            <Badge variant={callStatus === "connected" ? "success" : "warning"} pulse>
              {callStatus === "calling"
                ? "Ringing..."
                : callStatus === "offline"
                ? "User Offline"
                : callStatus === "connecting"
                ? "Connecting..."
                : callStatus === "ended"
                ? "Call Ended"
                : formatDuration(duration)}
            </Badge>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(true);
              }}
              className="p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
              title="Minimize call to PIP"
            >
              <Minimize2 size={15} />
            </button>
          </div>
        </div>

        {/* Avatar & Recipient Status */}
        {(callType === "audio" || isVideoOff) && (
          <div className="flex flex-col items-center justify-center my-auto space-y-4 z-10">
            <div className="relative">
              <Avatar src={recipient.avatar} name={recipient.name} size="2xl" online={isTargetOnline} />
              {callStatus === "calling" && (
                <span className="animate-ping absolute inset-0 rounded-full border-2 border-blue-500 opacity-75" />
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-white">{recipient.name}</h3>
              <p className="text-xs text-slate-400">
                {callStatus === "calling"
                  ? "Ringing recipient..."
                  : callStatus === "offline"
                  ? "User is currently offline / unavailable"
                  : callStatus === "connecting"
                  ? "Connecting..."
                  : callStatus === "ended"
                  ? "Call ended"
                  : "Connected"}
              </p>
            </div>
          </div>
        )}

        {/* Bottom Call Action Icons */}
        <div className="flex items-center justify-center gap-4 z-10 pt-4 border-t border-white/10 mt-auto">
          <button
            onClick={toggleMute}
            className={`flex h-12 w-12 items-center justify-center rounded-full transition shadow-md cursor-pointer ${
              isMuted ? "bg-red-600 text-white hover:bg-red-500" : "bg-[#1f2937] text-white hover:bg-[#374151]"
            }`}
            title={isMuted ? "Unmute Mic" : "Mute Mic"}
          >
            {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          {callType === "video" && (
            <button
              onClick={toggleVideo}
              className={`flex h-12 w-12 items-center justify-center rounded-full transition shadow-md cursor-pointer ${
                isVideoOff ? "bg-red-600 text-white hover:bg-red-500" : "bg-[#1f2937] text-white hover:bg-[#374151]"
              }`}
              title={isVideoOff ? "Turn Camera On" : "Turn Camera Off"}
            >
              {isVideoOff ? <VideoOff size={18} /> : <Video size={18} />}
            </button>
          )}

          <button
            onClick={toggleSpeaker}
            className={`flex h-12 w-12 items-center justify-center rounded-full transition shadow-md cursor-pointer ${
              !isSpeakerOn ? "bg-red-600 text-white" : "bg-[#1f2937] text-white hover:bg-[#374151]"
            }`}
            title={isSpeakerOn ? "Speaker On" : "Speaker Off"}
          >
            {isSpeakerOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          <button
            onClick={handleEndCall}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-600/30 hover:scale-105 transition-all cursor-pointer"
            title="End Call"
          >
            <PhoneOff size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}
