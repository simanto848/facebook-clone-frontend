"use client";

import React, { useState, useEffect } from "react";
import SettingsSection from "@/components/features/settings/SettingsSection";
import { Input, Button } from "@/components/ui";
import { useAuthStore } from "@/store/authStore";
import { userService } from "@/services/userService";
import { Check, AlertCircle } from "lucide-react";

export default function AccountSection() {
  const { user, updateUser } = useAuthStore();
  const [fullName, setFullName] = useState(user?.displayName || "");
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState((user as any)?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || "");
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.displayName || "");
      setUsername(user.username || "");
      setBio((user as any)?.bio || "");
      setAvatarUrl(user.avatar || "");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    try {
      await userService.updateProfile({
        displayName: fullName,
        bio: bio,
        avatar: avatarUrl,
      });
      updateUser({
        displayName: fullName,
        avatar: avatarUrl,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || err.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SettingsSection
      title="Account Information"
      description="Manage your personal details and profile info."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Display Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <Input
            label="Avatar Image URL"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
          />

          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-semibold text-slate-300 block">Short Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell the community about yourself..."
              className="w-full h-20 rounded-xl border border-[#374151] bg-[#1f2937] p-3 text-xs text-white outline-none resize-none focus:border-blue-500 transition"
            />
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-[#1f2937]">
          {saved && (
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <Check size={16} />
              <span>Profile settings saved!</span>
            </div>
          )}
          <Button variant="primary" type="submit" loading={isSaving} className="ml-auto">
            Save Changes
          </Button>
        </div>
      </form>
    </SettingsSection>
  );
}
