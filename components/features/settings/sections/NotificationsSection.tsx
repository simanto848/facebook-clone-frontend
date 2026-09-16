"use client";

import React, { useState, useEffect } from "react";
import SettingsSection from "@/components/features/settings/SettingsSection";
import { Switch, Button } from "@/components/ui";
import { Check, CheckCircle2 } from "lucide-react";

export default function NotificationsSection() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [marketingEnabled, setMarketingEnabled] = useState(false);
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
      }
    } catch {
      // ignore
    }
  }, []);

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
        JSON.stringify({ pushEnabled, emailEnabled, soundEnabled, marketingEnabled })
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

        <Switch
          label="Sound Alerts"
          description="Play a subtle notification chime on new messages or mentions."
          checked={soundEnabled}
          onChange={(e) => setSoundEnabled(e.target.checked)}
        />

        <Switch
          label="Email Notifications"
          description="Receive activity digests and important updates by email."
          checked={emailEnabled}
          onChange={(e) => setEmailEnabled(e.target.checked)}
        />

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
