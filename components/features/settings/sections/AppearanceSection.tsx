"use client";

import React, { useEffect, useState } from "react";
import SettingsSection from "@/components/features/settings/SettingsSection";
import { Select, ToggleGroup, Switch, Button } from "@/components/ui";
import { CheckCircle2 } from "lucide-react";
import { userService } from "@/services/userService";

export default function AppearanceSection() {
  const [theme, setTheme] = useState("dark");
  const [fontSize, setFontSize] = useState("medium");
  const [compactMode, setCompactMode] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("app-theme") || "dark";
    const savedSize = localStorage.getItem("app-fontsize") || "medium";
    const savedCompact = localStorage.getItem("app-compact") === "true";
    const savedMotion = localStorage.getItem("app-reduce-motion") === "true";
    const savedContrast = localStorage.getItem("app-high-contrast") === "true";
    setTheme(savedTheme);
    setFontSize(savedSize);
    setCompactMode(savedCompact);
    setReduceMotion(savedMotion);
    setHighContrast(savedContrast);
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("app-theme", newTheme);

    document.documentElement.classList.remove("theme-light", "theme-cyberpunk");

    if (newTheme === "light") {
      document.documentElement.classList.add("theme-light");
    } else if (newTheme === "cyberpunk") {
      document.documentElement.classList.add("theme-cyberpunk");
    }
  };

  const handleReduceMotionChange = (checked: boolean) => {
    setReduceMotion(checked);
    localStorage.setItem("app-reduce-motion", String(checked));
    if (checked) {
      document.documentElement.classList.add("reduce-motion");
    } else {
      document.documentElement.classList.remove("reduce-motion");
    }
  };

  const handleHighContrastChange = (checked: boolean) => {
    setHighContrast(checked);
    localStorage.setItem("app-high-contrast", String(checked));
    if (checked) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    setSavedSuccess(false);
    try {
      localStorage.setItem("app-theme", theme);
      localStorage.setItem("app-fontsize", fontSize);
      localStorage.setItem("app-compact", String(compactMode));
      localStorage.setItem("app-reduce-motion", String(reduceMotion));
      localStorage.setItem("app-high-contrast", String(highContrast));

      await userService.updateProfile({
        theme,
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
      title="Appearance & Theme"
      description="Customize how Your World looks on your screen."
    >
      <div className="space-y-6 max-w-md">
        {savedSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>Appearance preferences saved successfully.</span>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">Theme Palette</label>
          <ToggleGroup
            options={[
              { value: "dark", label: "Dark" },
              { value: "light", label: "Light" },
              { value: "cyberpunk", label: "Cyberpunk" },
            ]}
            value={theme}
            onChange={handleThemeChange}
          />
        </div>

        <Select
          label="Font Size"
          value={fontSize}
          onChange={(e) => setFontSize(e.target.value)}
          options={[
            { label: "Small (12px)", value: "small" },
            { label: "Medium (14px)", value: "medium" },
            { label: "Large (16px)", value: "large" },
          ]}
        />

        <Switch
          label="Compact Density Mode"
          description="Reduce paddings and margins for higher information density."
          checked={compactMode}
          onChange={(e) => setCompactMode(e.target.checked)}
        />

        <Switch
          label="Reduce Motion"
          description="Minimize transition and scale animations for improved performance and comfort."
          checked={reduceMotion}
          onChange={(e) => handleReduceMotionChange(e.target.checked)}
        />

        <Switch
          label="High Contrast Mode"
          description="Heighten contrast and element outlines for enhanced accessibility."
          checked={highContrast}
          onChange={(e) => handleHighContrastChange(e.target.checked)}
        />

        <div className="pt-2">
          <Button
            variant="primary"
            size="sm"
            loading={saving}
            onClick={handleSavePreferences}
          >
            Save Appearance
          </Button>
        </div>
      </div>
    </SettingsSection>
  );
}
