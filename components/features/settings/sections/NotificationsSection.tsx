"use client";

import React, { useState } from "react";
import SettingsSection from "@/components/features/settings/SettingsSection";
import { Switch } from "@/components/ui";

export default function NotificationsSection() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [marketingEnabled, setMarketingEnabled] = useState(false);

  return (
    <SettingsSection
      title="Notifications"
      description="Control how and when you receive notification alerts."
    >
      <div className="space-y-6">
        <Switch
          label="Push Notifications"
          description="Receive instant real-time notifications on your browser/device."
          checked={pushEnabled}
          onChange={(e) => setPushEnabled(e.target.checked)}
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
      </div>
    </SettingsSection>
  );
}
