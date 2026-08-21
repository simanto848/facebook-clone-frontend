"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, Square, Trash2, Send, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui";

interface VoiceRecorderProps {
  onSendVoiceNote: (audioDataUrl: string) => void;
  onCancel: () => void;
}

export function VoiceRecorder({ onSendVoiceNote, onCancel }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(true);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    startRecording();

    return () => {
      stopRecordingCleanup();
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          setAudioUrl(reader.result as string);
        };
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access error:", err);
      onCancel();
    }
  };

  const handleStopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const stopRecordingCleanup = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  const togglePreviewPlay = () => {
    if (!audioUrl) return;
    if (!previewAudioRef.current) {
      previewAudioRef.current = new Audio(audioUrl);
      previewAudioRef.current.onended = () => setIsPlayingPreview(false);
    }

    if (isPlayingPreview) {
      previewAudioRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      previewAudioRef.current.play().catch(console.error);
      setIsPlayingPreview(true);
    }
  };

  const handleSend = () => {
    if (audioUrl) {
      onSendVoiceNote(audioUrl);
    }
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center justify-between gap-3 p-2 bg-[#1f2937] border border-blue-500/30 rounded-2xl animate-in fade-in duration-150">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-red-600/20 text-red-500 shrink-0">
          <Mic size={16} className={isRecording ? "animate-pulse" : ""} />
          {isRecording && (
            <span className="animate-ping absolute inset-0 rounded-full border border-red-500 opacity-75" />
          )}
        </div>

        <span className="text-xs font-mono font-bold text-white shrink-0">
          {formatTime(recordingTime)}
        </span>

        {/* Live Recording Pulses */}
        {isRecording && (
          <div className="flex items-center gap-1 overflow-hidden h-4">
            <span className="w-1 h-3 bg-red-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1 h-4 bg-red-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1 h-2 bg-red-500 rounded-full animate-bounce" />
            <span className="w-1 h-4 bg-red-500 rounded-full animate-bounce [animation-delay:-0.2s]" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {/* Stop Recording Button */}
        {isRecording && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleStopRecording}
            className="h-8 px-2.5 text-xs text-amber-400 hover:bg-amber-400/10 cursor-pointer"
          >
            <Square size={14} className="fill-current mr-1" />
            Done
          </Button>
        )}

        {/* Preview Playback */}
        {!isRecording && audioUrl && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={togglePreviewPlay}
            className="h-8 w-8 p-0 rounded-full text-blue-400 hover:bg-blue-400/10 cursor-pointer"
            title="Preview voice note"
          >
            {isPlayingPreview ? <Pause size={15} /> : <Play size={15} />}
          </Button>
        )}

        {/* Delete / Cancel */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="h-8 w-8 p-0 rounded-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
          title="Cancel"
        >
          <Trash2 size={15} />
        </Button>

        {/* Send Voice Note */}
        {!isRecording && audioUrl && (
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSend}
            className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-500 cursor-pointer"
          >
            <Send size={13} className="mr-1" />
            Send
          </Button>
        )}
      </div>
    </div>
  );
}
