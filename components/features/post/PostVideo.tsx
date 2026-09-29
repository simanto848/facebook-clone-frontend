"use client";

import React, { useRef, useState } from "react";
import { Eye, Clock, Volume2, VolumeX, Gauge, PictureInPicture2 } from "lucide-react";

interface Props {
  url: string;
  duration?: string;
  views?: number;
}

const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 2];

export default function PostVideo({ url, duration, views }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState<boolean>(false);

  const handleToggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !videoRef.current.muted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleSpeedSelect = (rate: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
  };

  const handleTogglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.error("PiP error:", err);
    }
  };

  return (
    <div className="relative mt-4 group overflow-hidden rounded-2xl border border-[#1f2937] bg-black">
      {/* Video element */}
      <video
        ref={videoRef}
        src={url}
        controls
        playsInline
        muted={isMuted}
        className="w-full max-h-[480px] object-contain mx-auto"
      />

      {/* Info Stats Header Overlay */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 pointer-events-none">
        <div className="flex items-center gap-2">
          {views !== undefined && (
            <div className="flex items-center gap-1 bg-black/70 backdrop-blur-xs text-[11px] font-semibold text-white px-2.5 py-1 rounded-full">
              <Eye size={12} />
              <span>{views.toLocaleString()} views</span>
            </div>
          )}

          {duration && (
            <div className="flex items-center gap-1 bg-black/70 backdrop-blur-xs text-[11px] font-semibold text-white px-2.5 py-1 rounded-full">
              <Clock size={12} />
              <span>{duration}</span>
            </div>
          )}
        </div>

        {/* Video Utility Badges */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Speed Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="flex items-center gap-1 bg-black/70 hover:bg-black/90 backdrop-blur-xs text-white px-2.5 py-1 rounded-full text-xs font-medium transition cursor-pointer"
              title="Playback speed"
            >
              <Gauge size={12} />
              <span>{playbackRate}x</span>
            </button>

            {showSpeedMenu && (
              <div className="absolute right-0 top-full mt-1.5 bg-[#18191a] border border-[#2d3239] rounded-xl shadow-xl py-1 z-30 min-w-[90px]">
                {PLAYBACK_RATES.map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => handleSpeedSelect(rate)}
                    className={`w-full text-left px-3 py-1.5 text-xs transition cursor-pointer flex items-center justify-between ${
                      playbackRate === rate
                        ? "text-blue-500 font-bold bg-[#242526]"
                        : "text-[#e4e6eb] hover:bg-[#242526]"
                    }`}
                  >
                    <span>{rate}x</span>
                    {playbackRate === rate && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Mute Toggle */}
          <button
            type="button"
            onClick={handleToggleMute}
            className="p-1.5 bg-black/70 hover:bg-black/90 backdrop-blur-xs text-white rounded-full transition cursor-pointer"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
          </button>

          {/* PiP Button */}
          <button
            type="button"
            onClick={handleTogglePiP}
            className="p-1.5 bg-black/70 hover:bg-black/90 backdrop-blur-xs text-white rounded-full transition cursor-pointer"
            title="Picture in Picture"
          >
            <PictureInPicture2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
