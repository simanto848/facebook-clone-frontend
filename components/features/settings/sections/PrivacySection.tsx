"use client";

import React, { useState } from "react";
import SettingsSection from "@/components/features/settings/SettingsSection";
import BlockedUsersSection from "@/components/features/settings/sections/BlockedUsersSection";
import { Select, Switch } from "@/components/ui";

export default function PrivacySection() {
  const [isPrivate, setIsPrivate] = useState(false);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [visibility, setVisibility] = useState("public");

  return (
    <>
      <SettingsSection
        title="Privacy Settings"
        description="Manage visibility and who can see your content."
      >
        <div className="space-y-6">
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
        </div>
      </SettingsSection>
      <BlockedUsersSection />
    </>
  );
}
