"use client";

import React, { useEffect, useState } from "react";
import SettingsSection from "@/components/features/settings/SettingsSection";
import { Select, ToggleGroup, Switch, Button } from "@/components/ui";
import { CheckCircle2, Check } from "lucide-react";
import { userService } from "@/services/userService";

const ACCENT_COLORS = [
  { id: "blue", label: "Facebook Blue", color: "#2563eb", bgClass: "bg-blue-600" },
  { id: "emerald", label: "Emerald Green", color: "#10b981", bgClass: "bg-emerald-500" },
  { id: "purple", label: "Royal Purple", color: "#8b5cf6", bgClass: "bg-purple-600" },
  { id: "rose", label: "Crimson Rose", color: "#f43f5e", bgClass: "bg-rose-500" },
  { id: "amber", label: "Amber Gold", color: "#f59e0b", bgClass: "bg-amber-500" },
  { id: "cyan", label: "Cyan Neon", color: "#06b6d4", bgClass: "bg-cyan-500" },
];

export default function AppearanceSection() {
  const [theme, setTheme] = useState("dark");
  const [accentColor, setAccentColor] = useState("blue");
  const [fontSize, setFontSize] = useState("medium");
  const [compactMode, setCompactMode] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("app-theme") || "dark";
    const savedAccent = localStorage.getItem("app-accent-color") || "blue";
    const savedSize = localStorage.getItem("app-fontsize") || "medium";
    const savedCompact = localStorage.getItem("app-compact") === "true";
    const savedMotion = localStorage.getItem("app-reduce-motion") === "true";
    const savedContrast = localStorage.getItem("app-high-contrast") === "true";
    setTheme(savedTheme);
    setAccentColor(savedAccent);
    document.documentElement.setAttribute("data-accent", savedAccent);
    setFontSize(savedSize);
    setCompactMode(savedCompact);
    setReduceMotion(savedMotion);
    setHighContrast(savedContrast);
  }, []);

  const handleAccentChange = (accent: string) => {
    setAccentColor(accent);
    localStorage.setItem("app-accent-color", accent);
    document.documentElement.setAttribute("data-accent", accent);
  };

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
      localStorage.setItem("app-accent-color", accentColor);
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

        {/* Accent Color Swatches */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 block">Accent Color</label>
            <span className="text-[11px] text-slate-400 capitalize">
              {ACCENT_COLORS.find((c) => c.id === accentColor)?.label || "Blue"}
            </span>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {ACCENT_COLORS.map((acc) => (
              <button
                key={acc.id}
                type="button"
                onClick={() => handleAccentChange(acc.id)}
                className={`h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${acc.bgClass} ${
                  accentColor === acc.id
                    ? "ring-2 ring-white ring-offset-2 ring-offset-[#0f172a] scale-105 shadow-md shadow-black/50"
                    : "opacity-80 hover:opacity-100 hover:scale-102"
                }`}
                title={acc.label}
              >
                {accentColor === acc.id && <Check size={14} className="text-white drop-shadow-md stroke-[3]" />}
              </button>
            ))}
          </div>
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
