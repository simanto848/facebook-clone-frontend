"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2 } from "lucide-react";

interface AudioPlayerProps {
  src: string;
  isMe?: boolean;
}

export function AudioPlayer({ src, isMe = false }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration || 0);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [src]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (sec: number) => {
    if (isNaN(sec)) return "0:00";
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`flex items-center gap-3 p-3 rounded-2xl max-w-xs select-none ${
      isMe ? "bg-blue-600 text-white" : "bg-[#1f2937] text-white border border-[#374151]/40"
    }`}>
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        className={`flex h-9 w-9 items-center justify-center rounded-full transition shrink-0 cursor-pointer shadow-md ${
          isMe ? "bg-white text-blue-600 hover:bg-slate-100" : "bg-blue-500 text-white hover:bg-blue-400"
        }`}
        title={isPlaying ? "Pause voice note" : "Play voice note"}
      >
        {isPlaying ? <Pause size={16} className="fill-current" /> : <Play size={16} className="fill-current ml-0.5" />}
      </button>

      {/* Waveform / Progress Slider */}
      <div className="flex-1 min-w-[120px] space-y-1">
        <div className="relative flex items-center h-4 group">
          {/* Animated Waveform Visualization */}
          <div className="absolute inset-0 flex items-center justify-between gap-0.5 opacity-40">
            {[40, 70, 30, 90, 60, 100, 45, 80, 50, 95, 35, 75, 65, 85, 40].map((h, i) => (
              <span
                key={i}
                style={{ height: `${h}%` }}
                className={`w-1 rounded-full transition-all ${
                  (i / 15) * 100 <= progressPercent
                    ? isMe ? "bg-white opacity-100" : "bg-blue-400 opacity-100"
                    : isMe ? "bg-blue-300" : "bg-slate-600"
                } ${isPlaying ? "animate-pulse" : ""}`}
              />
            ))}
          </div>

          {/* Seek Input Range Overlay */}
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
        </div>

        {/* Duration Timer */}
        <div className="flex justify-between text-[10px] font-mono opacity-80">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <Volume2 size={14} className="opacity-60 shrink-0" />
    </div>
  );
}
