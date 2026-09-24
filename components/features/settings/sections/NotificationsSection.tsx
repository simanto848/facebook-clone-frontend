"use client";

import React, { useState, useEffect } from "react";
import SettingsSection from "@/components/features/settings/SettingsSection";
import { Switch, Button } from "@/components/ui";
import { Check, CheckCircle2, Moon, Mail, Clock, Volume2, Play } from "lucide-react";

export default function NotificationsSection() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundTone, setSoundTone] = useState<"chime" | "ping" | "pop">("chime");
  const [marketingEnabled, setMarketingEnabled] = useState(false);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietHoursStart, setQuietHoursStart] = useState("22:00");
  const [quietHoursEnd, setQuietHoursEnd] = useState("07:00");
  const [quietDays, setQuietDays] = useState<"all" | "weekdays" | "weekends">("all");
  const [emailDigestFrequency, setEmailDigestFrequency] = useState<"daily" | "weekly" | "off">("daily");
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user_notification_prefs");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed.pushEnabled === "boolean") setPushEnabled(parsed.pushEnabled);
        if (typeof parsed.emailEnabled === "boolean") setEmailEnabled(parsed.emailEnabled);
        if (typeof parsed.soundEnabled === "boolean") setSoundEnabled(parsed.soundEnabled);
        if (typeof parsed.marketingEnabled === "boolean") setMarketingEnabled(parsed.marketingEnabled);
        if (typeof parsed.quietHoursEnabled === "boolean") setQuietHoursEnabled(parsed.quietHoursEnabled);
        if (typeof parsed.quietHoursStart === "string") setQuietHoursStart(parsed.quietHoursStart);
        if (typeof parsed.quietHoursEnd === "string") setQuietHoursEnd(parsed.quietHoursEnd);
        if (typeof parsed.soundTone === "string") setSoundTone(parsed.soundTone);
        if (typeof parsed.quietDays === "string") setQuietDays(parsed.quietDays);
      }
    } catch {
      // ignore
    }
  }, []);

  const playTone = (tone: "chime" | "ping" | "pop") => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      if (tone === "chime") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      } else if (tone === "ping") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(1046.5, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1318.5, ctx.currentTime + 0.1);
      } else {
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.08);
      }
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      // ignore
    }
  };

  const handlePushToggle = async (checked: boolean) => {
    setPushEnabled(checked);
    if (checked && typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission !== "granted") {
        try {
          await Notification.requestPermission();
        } catch {
          // ignore
        }
      }
    }
  };

  const handleSave = () => {
    try {
      localStorage.setItem(
        "user_notification_prefs",
        JSON.stringify({
          pushEnabled,
          emailEnabled,
          soundTone,
          quietDays,
          marketingEnabled,
          quietHoursEnabled,
          quietHoursStart,
          quietHoursEnd,
          emailDigestFrequency,
        })
      );
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch {
      // ignore
    }
  };

  return (
    <SettingsSection
      title="Notifications"
      description="Control how and when you receive notification alerts."
    >
      <div className="space-y-6">
        {savedSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>Notification preferences updated.</span>
          </div>
        )}

        <Switch
          label="Push Notifications"
          description="Receive instant real-time notifications on your browser/device."
          checked={pushEnabled}
          onChange={(e) => handlePushToggle(e.target.checked)}
        />

        <div className="space-y-3">
          <Switch
            label="Sound Alerts"
            description="Play a subtle notification chime on new messages or mentions."
            checked={soundEnabled}
            onChange={(e) => setSoundEnabled(e.target.checked)}
          />

          {soundEnabled && (
            <div className="ml-12 p-3 rounded-xl bg-[#0f172a] border border-[#1f2937] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                  <Volume2 size={13} className="text-blue-400" />
                  Alert Chime Sound
                </span>
                <button
                  type="button"
                  onClick={() => playTone(soundTone)}
                  className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 transition cursor-pointer"
                >
                  <Play size={11} /> Test Sound
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                {[
                  { id: "chime", label: "Classic Chime" },
                  { id: "ping", label: "Subtle Ping" },
                  { id: "pop", label: "Soft Pop" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setSoundTone(t.id as any);
                      playTone(t.id as any);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                      soundTone === t.id
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-[#111827] text-slate-400 hover:text-white border border-[#1f2937]"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Switch
            label="Email Notifications"
            description="Receive activity digests and important updates by email."
            checked={emailEnabled}
            onChange={(e) => setEmailEnabled(e.target.checked)}
          />

          {emailEnabled && (
            <div className="ml-12 p-3 rounded-xl bg-[#0f172a] border border-[#1f2937] space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
                <Mail size={13} className="text-blue-400" />
                <span>Email Digest Frequency</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[
                  { id: "daily", label: "Daily Digest" },
                  { id: "weekly", label: "Weekly Summary" },
                  { id: "off", label: "Important Only" },
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setEmailDigestFrequency(d.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                      emailDigestFrequency === d.id
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-[#111827] text-slate-400 hover:text-white border border-[#1f2937]"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quiet Hours / Do Not Disturb */}
        <div className="space-y-3">
          <Switch
            label="Quiet Hours (Do Not Disturb)"
            description="Mute non-urgent sound and push notifications during specified hours."
            checked={quietHoursEnabled}
            onChange={(e) => setQuietHoursEnabled(e.target.checked)}
          />

          {quietHoursEnabled && (
            <div className="ml-12 p-3 rounded-xl bg-[#0f172a] border border-[#1f2937] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
                  <Moon size={13} className="text-purple-400" />
                  <span>Scheduled Mute Window</span>
                </div>
                <div className="flex items-center gap-1">
                  {[
                    { id: "all", label: "Every Day" },
                    { id: "weekdays", label: "Weekdays" },
                    { id: "weekends", label: "Weekends" },
                  ].map((dayOption) => (
                    <button
                      key={dayOption.id}
                      type="button"
                      onClick={() => setQuietDays(dayOption.id as any)}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${
                        quietDays === dayOption.id
                          ? "bg-purple-600 text-white shadow-xs"
                          : "bg-[#111827] text-slate-400 hover:text-white border border-[#1f2937]"
                      }`}
                    >
                      {dayOption.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">From:</span>
                  <input
                    type="time"
                    value={quietHoursStart}
                    onChange={(e) => setQuietHoursStart(e.target.value)}
                    className="rounded-lg bg-[#111827] border border-[#1f2937] px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">To:</span>
                  <input
                    type="time"
                    value={quietHoursEnd}
                    onChange={(e) => setQuietHoursEnd(e.target.value)}
                    className="rounded-lg bg-[#111827] border border-[#1f2937] px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <Switch
          label="Marketing & Feature Announcements"
          description="Receive product updates, newsletters, and promotional offers."
          checked={marketingEnabled}
          onChange={(e) => setMarketingEnabled(e.target.checked)}
        />

        <div className="flex justify-end pt-2">
          <Button
            variant="primary"
            size="sm"
            leftIcon={savedSuccess ? <Check size={14} /> : undefined}
            onClick={handleSave}
          >
            {savedSuccess ? "Saved" : "Save Preferences"}
          </Button>
        </div>
      </div>
    </SettingsSection>
  );
}
