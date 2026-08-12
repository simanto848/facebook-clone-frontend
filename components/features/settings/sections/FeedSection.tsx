"use client";

import React, { useState } from "react";
import SettingsSection from "@/components/features/settings/SettingsSection";
import { Select } from "@/components/ui";

export default function FeedSection() {
  const [feedMode, setFeedMode] = useState("latest");

  return (
    <SettingsSection
      title="Feed Preferences"
      description="Customize your default newsfeed sorting algorithm."
    >
      <div className="max-w-md">
        <Select
          label="Default Feed View"
          value={feedMode}
          onChange={(e) => setFeedMode(e.target.value)}
          options={[
            { label: "Latest Posts (Chronological)", value: "latest" },
            { label: "Most Popular & Trending", value: "popular" },
            { label: "Recommended for You", value: "recommended" },
          ]}
        />
      </div>
    </SettingsSection>
  );
}
