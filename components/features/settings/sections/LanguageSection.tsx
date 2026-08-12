"use client";

import React, { useState } from "react";
import SettingsSection from "@/components/features/settings/SettingsSection";
import { Select } from "@/components/ui";

export default function LanguageSection() {
  const [lang, setLang] = useState("en");
  const [timezone, setTimezone] = useState("asia_dhaka");

  return (
    <SettingsSection
      title="Language & Region"
      description="Manage your localization and time zone preferences."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Display Language"
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          options={[
            { label: "English (US)", value: "en" },
            { label: "বাংলা (Bengali)", value: "bn" },
            { label: "Hindi (हिन्दी)", value: "hi" },
          ]}
        />

        <Select
          label="Timezone"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          options={[
            { label: "Asia/Dhaka (GMT+6)", value: "asia_dhaka" },
            { label: "Asia/Kolkata (GMT+5:30)", value: "asia_kolkata" },
            { label: "UTC (Coordinated Universal Time)", value: "utc" },
          ]}
        />
      </div>
    </SettingsSection>
  );
}
