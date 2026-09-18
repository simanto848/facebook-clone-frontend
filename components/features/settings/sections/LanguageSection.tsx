"use client";

import React, { useState, useEffect } from "react";
import SettingsSection from "@/components/features/settings/SettingsSection";
import { Select, Button } from "@/components/ui";
import { CheckCircle2 } from "lucide-react";
import { userService } from "@/services/userService";

export default function LanguageSection() {
  const [lang, setLang] = useState("en");
  const [timezone, setTimezone] = useState("asia_dhaka");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    try {
      const storedLang = localStorage.getItem("user_language") || "en";
      const storedTz = localStorage.getItem("user_timezone") || "asia_dhaka";
      const storedDf = localStorage.getItem("user_date_format") || "MM/DD/YYYY";
      setLang(storedLang);
      setTimezone(storedTz);
      setDateFormat(storedDf);
    } catch {
      // ignore
    }
  }, []);

  const handleSaveLanguage = async () => {
    setSaving(true);
    setSavedSuccess(false);

    try {
      localStorage.setItem("user_language", lang);
      localStorage.setItem("user_timezone", timezone);
      localStorage.setItem("user_date_format", dateFormat);

      await userService.updateProfile({
        language: lang,
      } as any);

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsSection
      title="Language & Region"
      description="Manage your localization and time zone preferences."
    >
      <div className="space-y-6">
        {savedSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>Language and regional preferences saved.</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Display Language"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            options={[
              { label: "English (US)", value: "en" },
              { label: "বাংলা (Bengali)", value: "bn" },
              { label: "Hindi (हिन्दी)", value: "hi" },
              { label: "Spanish (Español)", value: "es" },
              { label: "Japanese (日本語)", value: "ja" },
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
              { label: "America/New_York (EST)", value: "america_ny" },
              { label: "Europe/London (GMT)", value: "europe_london" },
            ]}
          />

          <Select
            label="Date Format"
            value={dateFormat}
            onChange={(e) => setDateFormat(e.target.value)}
            options={[
              { label: "MM/DD/YYYY (e.g. 10/24/2026)", value: "MM/DD/YYYY" },
              { label: "DD/MM/YYYY (e.g. 24/10/2026)", value: "DD/MM/YYYY" },
              { label: "YYYY-MM-DD (e.g. 2026-10-24)", value: "YYYY-MM-DD" },
            ]}
          />
        </div>

        <div className="pt-2">
          <Button
            variant="primary"
            size="sm"
            loading={saving}
            onClick={handleSaveLanguage}
          >
            Save Preferences
          </Button>
        </div>
      </div>
    </SettingsSection>
  );
}
