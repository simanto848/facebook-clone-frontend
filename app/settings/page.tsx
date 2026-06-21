"use client";

import { useState } from "react";
import SettingsSidebar from "@/components/features/settings/SettingsSidebar";
import AccountSection from "@/components/features/settings/sections/AccountSection";
import NotificationsSection from "@/components/features/settings/sections/NotificationsSection";
import PrivacySection from "@/components/features/settings/sections/PrivacySection";
import SecuritySection from "@/components/features/settings/sections/SecuritySection";
import AppearanceSection from "@/components/features/settings/sections/AppearanceSection";
import LanguageSection from "@/components/features/settings/sections/LanguageSection";
import FeedSection from "@/components/features/settings/sections/FeedSection";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("account");

  const renderSection = () => {
    switch (activeTab) {
      case "account":
        return <AccountSection />;
      case "notifications":
        return <NotificationsSection />;
      case "privacy":
        return <PrivacySection />;
      case "security":
        return <SecuritySection />;
      case "appearance":
        return <AppearanceSection />;
      case "language":
        return <LanguageSection />;
      case "feed":
        return <FeedSection />;
      default:
        return <AccountSection />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] p-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-4xl font-bold text-white">Settings</h1>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-12 md:col-span-4 lg:col-span-3">
            <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>

          {/* Content */}
          <div className="col-span-12 md:col-span-8 lg:col-span-9 space-y-6">
            <div className="transition-all duration-300 ease-in-out">
              {renderSection()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

