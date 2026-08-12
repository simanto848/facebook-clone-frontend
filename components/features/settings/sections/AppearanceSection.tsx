"use client";

import React, { useEffect, useState } from "react";
import SettingsSection from "@/components/features/settings/SettingsSection";
import { Select, ToggleGroup } from "@/components/ui";

export default function AppearanceSection() {
  const [theme, setTheme] = useState("dark");
  const [fontSize, setFontSize] = useState("medium");

  useEffect(() => {
    const savedTheme = localStorage.getItem("app-theme") || "dark";
    setTheme(savedTheme);
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

  return (
    <SettingsSection
      title="Appearance & Theme"
      description="Customize how Your World looks on your screen."
    >
      <div className="space-y-6 max-w-md">
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
      </div>
    </SettingsSection>
  );
}
