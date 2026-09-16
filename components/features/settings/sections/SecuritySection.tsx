"use client";

import React, { useState } from "react";
import SettingsSection from "@/components/features/settings/SettingsSection";
import { PasswordStrength, Input, Button, Switch } from "@/components/ui";
import { userService } from "@/services/userService";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function SecuritySection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactor, setTwoFactor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!currentPassword) {
      setErrorMsg("Current password is required");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg("New password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("New password and confirmation do not match");
      return;
    }

    setLoading(true);
    try {
      await userService.changePassword({ currentPassword, newPassword });
      setSuccessMsg("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to update password";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsSection
      title="Security & Authentication"
      description="Protect your account with strong passwords and 2FA authentication."
    >
      <form onSubmit={handlePasswordSubmit} className="space-y-6">
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-4 max-w-md">
          <Input
            label="Current Password"
            type="password"
            placeholder="Enter current password..."
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />

          <PasswordStrength
            label="New Password"
            placeholder="Create strong password..."
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Confirm new password..."
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <div className="pt-4 border-t border-[#1f2937] space-y-4">
          <Switch
            label="Two-Factor Authentication (2FA)"
            description="Require a verification code when signing in from an unknown device."
            checked={twoFactor}
            onChange={(e) => setTwoFactor(e.target.checked)}
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[#1f2937]">
          <Button variant="danger" type="button">
            Delete Account
          </Button>

          <Button variant="primary" type="submit" loading={loading}>
            Update Security
          </Button>
        </div>
      </form>
    </SettingsSection>
  );
}
