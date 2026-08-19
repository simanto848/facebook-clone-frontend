"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Volume2, VolumeX } from "lucide-react";
import { Dialog, Avatar, Button, Badge } from "@/components/ui";
import { useSocketContext } from "@/components/providers/SocketProvider";

export interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: {
    id: string;
    name: string;
    avatar: string;
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
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === "audio");
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callStatus, setCallStatus] = useState<"calling" | "connecting" | "connected" | "ended">(
    isIncoming ? "connecting" : "calling"
  );
  const [duration, setDuration] = useState(0);
  const [activeCallId, setActiveCallId] = useState<string | null>(incomingCallId || null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Duration Timer
  useEffect(() => {
    if (callStatus !== "connected") return;
    const interval = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [callStatus]);

  // Main WebRTC Connection Setup
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
        } else {
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
      setCallStatus("ended");
      cleanup();
      setTimeout(onClose, 1000);
    };

    const handleCallEnded = () => {
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
  }, [isOpen, recipient.id, callType, isIncoming, incomingOffer, incomingCallId, socket]);

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = isMuted;
      });
    }
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((t) => {
        t.enabled = isVideoOff;
      });
    }
    setIsVideoOff(!isVideoOff);
  };

  const toggleSpeaker = () => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = isSpeakerOn;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = isSpeakerOn;
    }
    setIsSpeakerOn(!isSpeakerOn);
  };

  const handleEndCall = () => {
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

  return (
    <Dialog isOpen={isOpen} onClose={handleEndCall} size="md" showHeader={false}>
      <div className="relative h-[520px] w-full bg-linear-to-b from-[#1e293b] to-[#0f172a] rounded-2xl overflow-hidden flex flex-col justify-between p-6 text-center select-none shadow-2xl">
        <audio ref={remoteAudioRef} autoPlay />

        {callType === "video" && (
          <div className="absolute inset-0 z-0 bg-black">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 z-20 w-28 h-36 rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl bg-slate-900">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between z-10">
          <Badge variant="glass">
            {callType === "video" ? "HD Video Call" : "Voice Call"}
          </Badge>
          <Badge variant={callStatus === "connected" ? "success" : "warning"} pulse>
            {callStatus === "calling"
              ? "Ringing..."
              : callStatus === "connecting"
              ? "Connecting..."
              : callStatus === "ended"
              ? "Call Ended"
              : formatDuration(duration)}
          </Badge>
        </div>

        {(callType === "audio" || isVideoOff) && (
          <div className="flex flex-col items-center justify-center my-auto space-y-4 z-10">
            <div className="relative">
              <Avatar src={recipient.avatar} name={recipient.name} size="2xl" online />
              {callStatus === "calling" && (
                <span className="animate-ping absolute inset-0 rounded-full border-2 border-blue-500 opacity-75" />
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-white">{recipient.name}</h3>
              <p className="text-xs text-slate-400">
                {callStatus === "calling"
                  ? "Calling recipient..."
                  : callStatus === "connecting"
                  ? "Establishing secure connection..."
                  : callStatus === "ended"
                  ? "Call ended"
                  : "Connected"}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-4 z-10 pt-4 border-t border-white/10 mt-auto">
          <Button
            variant={isMuted ? "danger" : "secondary"}
            size="lg"
            className="rounded-full h-12 w-12 p-0"
            onClick={toggleMute}
            title={isMuted ? "Unmute Mic" : "Mute Mic"}
          >
            {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
          </Button>

          {callType === "video" && (
            <Button
              variant={isVideoOff ? "danger" : "secondary"}
              size="lg"
              className="rounded-full h-12 w-12 p-0"
              onClick={toggleVideo}
              title={isVideoOff ? "Turn Camera On" : "Turn Camera Off"}
            >
              {isVideoOff ? <VideoOff size={18} /> : <Video size={18} />}
            </Button>
          )}

          <Button
            variant={isSpeakerOn ? "secondary" : "ghost"}
            size="lg"
            className="rounded-full h-12 w-12 p-0"
            onClick={toggleSpeaker}
            title={isSpeakerOn ? "Speaker On" : "Speaker Muted"}
          >
            {isSpeakerOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </Button>

          <Button
            variant="danger"
            size="lg"
            className="rounded-full h-14 w-14 p-0 shadow-lg shadow-red-600/30 hover:scale-105 transition-transform"
            onClick={handleEndCall}
            title="End Call"
          >
            <PhoneOff size={22} />
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
