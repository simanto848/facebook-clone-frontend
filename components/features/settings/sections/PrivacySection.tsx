"use client";

import React, { useState, useEffect } from "react";
import SettingsSection from "@/components/features/settings/SettingsSection";
import BlockedUsersSection from "@/components/features/settings/sections/BlockedUsersSection";
import { Select, Switch, Button } from "@/components/ui";
import { userService } from "@/services/userService";
import { useAuthStore } from "@/store/authStore";
import { Check, CheckCircle2, Download } from "lucide-react";

export default function PrivacySection() {
  const { user } = useAuthStore();
  const [isPrivate, setIsPrivate] = useState(false);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [visibility, setVisibility] = useState("public");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [downloadingData, setDownloadingData] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadUserData = async () => {
    setDownloadingData(true);
    try {
      const exportPayload = {
        exportedAt: new Date().toISOString(),
        user: {
          id: user?.id,
          username: user?.username,
          displayName: user?.displayName,
          email: user?.email,
          bio: (user as any)?.bio,
          avatar: user?.avatar,
          coverPhoto: (user as any)?.coverPhoto,
          location: (user as any)?.location,
          website: (user as any)?.website,
          createdAt: (user as any)?.createdAt,
        },
        privacyPreferences: {
          isPrivate,
          showOnlineStatus,
          visibility,
        },
        systemInfo: {
          app: "Facebook Clone Next.js",
          clientVersion: "1.0.0",
          exportFormat: "JSON",
        },
      };

      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `facebook-clone-my-data-${user?.username || "user"}-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to export data:", err);
    } finally {
      setDownloadingData(false);
    }
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user_privacy_settings");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed.isPrivate === "boolean") setIsPrivate(parsed.isPrivate);
        if (typeof parsed.showOnlineStatus === "boolean") setShowOnlineStatus(parsed.showOnlineStatus);
        if (parsed.visibility) setVisibility(parsed.visibility);
      } else if (user) {
        if ((user as any).isPrivate !== undefined) setIsPrivate(Boolean((user as any).isPrivate));
        if ((user as any).showOnlineStatus !== undefined) setShowOnlineStatus(Boolean((user as any).showOnlineStatus));
      }
    } catch {
      // ignore
    }
  }, [user]);

  const handleSavePrivacy = async () => {
    setSaving(true);
    setSavedSuccess(false);

    try {
      localStorage.setItem(
        "user_privacy_settings",
        JSON.stringify({ isPrivate, showOnlineStatus, visibility })
      );

      await userService.updateProfile({
        isPrivate,
        showOnlineStatus,
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.warn("Failed to persist privacy settings to backend, cached locally:", err);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <SettingsSection
        title="Privacy Settings"
        description="Manage visibility and who can see your content."
      >
        <div className="space-y-6">
          {savedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>Privacy preferences saved successfully.</span>
            </div>
          )}

          <Switch
            label="Private Account"
            description="Only approved followers can see your posts and media."
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
          />

          <Switch
            label="Show Online Status"
            description="Allow active connections to see when you are currently online."
            checked={showOnlineStatus}
            onChange={(e) => setShowOnlineStatus(e.target.checked)}
          />

          <Select
            label="Profile Visibility"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            options={[
              { label: "Public (Everyone)", value: "public" },
              { label: "Friends Only", value: "friends" },
              { label: "Private (Only Me)", value: "private" },
            ]}
          />

          <div className="flex justify-end pt-2">
            <Button
              variant="primary"
              size="sm"
              loading={saving}
              leftIcon={savedSuccess ? <Check size={14} /> : undefined}
              onClick={handleSavePrivacy}
            >
              {savedSuccess ? "Saved" : "Save Privacy Settings"}
            </Button>
          </div>

          {/* Data Portability Subsection */}
          <div className="pt-6 border-t border-[#1f2937] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-semibold text-white">Download Your Information</h4>
                <p className="text-xs text-slate-400 mt-0.5 max-w-lg">
                  Get a copy of what you’ve shared on Facebook Clone. You can download your profile info, privacy settings, and activity archive in JSON format.
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Download size={14} />}
                loading={downloadingData}
                onClick={handleDownloadUserData}
                className="shrink-0 border border-[#1f2937] text-slate-200 hover:text-white self-start sm:self-auto"
              >
                {downloadSuccess ? "Downloaded!" : "Download Data"}
              </Button>
            </div>
            {downloadSuccess && (
              <p className="text-[11px] text-emerald-400 font-medium">
                ✓ Your data archive has been generated and downloaded.
              </p>
            )}
          </div>
        </div>
      </SettingsSection>
      <BlockedUsersSection />
    </>
  );
}
