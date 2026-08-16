"use client";

import React, { useState, useEffect } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Volume2, VolumeX } from "lucide-react";
import { Dialog, Avatar, Button, Badge } from "@/components/ui";
import { callService } from "@/services/callService";

export interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: {
    id: string;
    name: string;
    avatar: string;
  };
  callType: "audio" | "video";
}

export function CallModal({
  isOpen,
  onClose,
  recipient,
  callType = "audio",
}: CallModalProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === "audio");
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callStatus, setCallStatus] = useState<"calling" | "connected" | "ended">("calling");
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!isOpen || !recipient.id) return;
    setCallStatus("calling");
    setDuration(0);

    const initCall = async () => {
      try {
        if (callType === "video") {
          await callService.initiateVideoCall(recipient.id);
        } else {
          await callService.initiateAudioCall(recipient.id);
        }
      } catch (err) {
        console.error("Call initiation warning:", err);
      }
    };

    initCall();

    const connectTimer = setTimeout(() => {
      setCallStatus("connected");
    }, 2500);

    return () => clearTimeout(connectTimer);
  }, [isOpen, recipient.id, callType]);

  useEffect(() => {
    if (callStatus !== "connected") return;
    const interval = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [callStatus]);

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEndCall = () => {
    setCallStatus("ended");
    setTimeout(() => {
      onClose();
    }, 500);
  };

  return (
    <Dialog isOpen={isOpen} onClose={handleEndCall} size="md" showHeader={false}>
      <div className="relative h-[480px] w-full bg-linear-to-b from-[#1e293b] to-[#0f172a] rounded-2xl overflow-hidden flex flex-col justify-between p-6 text-center select-none shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between z-10">
          <Badge variant="glass">
            {callType === "video" ? "HD Video Call" : "Voice Call"}
          </Badge>
          <Badge variant={callStatus === "connected" ? "success" : "warning"} pulse>
            {callStatus === "calling" ? "Calling..." : formatDuration(duration)}
          </Badge>
        </div>

        {/* Video / Avatar Container */}
        <div className="flex flex-col items-center justify-center my-auto space-y-4">
          <div className="relative">
            <Avatar src={recipient.avatar} name={recipient.name} size="2xl" online />
            {callStatus === "calling" && (
              <span className="animate-ping absolute inset-0 rounded-full border-2 border-blue-500 opacity-75" />
            )}
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-white">{recipient.name}</h3>
            <p className="text-xs text-slate-400">
              {callStatus === "calling" ? "Ringing..." : "Connected"}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-4 z-10 pt-4 border-t border-white/10">
          <Button
            variant={isMuted ? "danger" : "secondary"}
            size="lg"
            className="rounded-full h-12 w-12 p-0"
            onClick={() => setIsMuted(!isMuted)}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
          </Button>

          {callType === "video" && (
            <Button
              variant={isVideoOff ? "danger" : "secondary"}
              size="lg"
              className="rounded-full h-12 w-12 p-0"
              onClick={() => setIsVideoOff(!isVideoOff)}
              title={isVideoOff ? "Turn Video On" : "Turn Video Off"}
            >
              {isVideoOff ? <VideoOff size={18} /> : <Video size={18} />}
            </Button>
          )}

          <Button
            variant={isSpeakerOn ? "secondary" : "ghost"}
            size="lg"
            className="rounded-full h-12 w-12 p-0"
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            title={isSpeakerOn ? "Speaker On" : "Speaker Off"}
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
