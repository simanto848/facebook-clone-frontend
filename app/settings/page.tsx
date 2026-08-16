"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import SettingsSidebar from "@/components/features/settings/SettingsSidebar";
import AccountSection from "@/components/features/settings/sections/AccountSection";
import NotificationsSection from "@/components/features/settings/sections/NotificationsSection";
import PrivacySection from "@/components/features/settings/sections/PrivacySection";
import SecuritySection from "@/components/features/settings/sections/SecuritySection";
import AppearanceSection from "@/components/features/settings/sections/AppearanceSection";
import LanguageSection from "@/components/features/settings/sections/LanguageSection";
import FeedSection from "@/components/features/settings/sections/FeedSection";
import ActivityLogSection from "@/components/features/settings/sections/ActivityLogSection";
import { Loader } from "@/components/ui";

function SettingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentTabFromUrl = searchParams.get("tab") || "account";
  const [activeTab, setActiveTab] = useState(currentTabFromUrl);

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabId);
    router.push(`${pathname}?${params.toString()}`);
  };

  const renderSection = () => {
    switch (activeTab) {
      case "account":
        return <AccountSection />;
      case "activity_log":
        return <ActivityLogSection />;
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
    <div className="grid grid-cols-12 gap-6">
      {/* Sidebar */}
      <div className="col-span-12 md:col-span-4 lg:col-span-3">
        <SettingsSidebar activeTab={activeTab} setActiveTab={handleTabChange} />
      </div>

      {/* Section Content */}
      <div className="col-span-12 md:col-span-8 lg:col-span-9 space-y-6">
        <div className="transition-all duration-300 ease-in-out">
          {renderSection()}
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<Loader label="Loading settings..." />}>
      <SettingsContent />
    </Suspense>
  );
}
