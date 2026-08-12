"use client";

import React, { useState } from "react";
import SettingsSection from "@/components/features/settings/SettingsSection";
import { PasswordStrength, Input, Button, Switch } from "@/components/ui";

export default function SecuritySection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactor, setTwoFactor] = useState(false);

  return (
    <SettingsSection
      title="Security & Authentication"
      description="Protect your account with strong passwords and 2FA authentication."
    >
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <div className="space-y-4 max-w-md">
          <Input
            label="Current Password"
            type="password"
            placeholder="Enter current password..."
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
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
          <Button variant="danger">
            Delete Account
          </Button>

          <Button variant="primary" type="submit">
            Update Security
          </Button>
        </div>
      </form>
    </SettingsSection>
  );
}
