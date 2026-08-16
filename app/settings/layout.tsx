import React from "react";
import { Settings as SettingsIcon } from "lucide-react";
import { PageHeader } from "@/components/ui";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <div className="flex">

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 flex justify-center">
          <div className="w-full max-w-5xl px-6 py-6 space-y-6">
            <PageHeader
              title="Settings & Preferences"
              description="Manage your account profile, privacy controls, security authentication, and application preferences."
              icon={<SettingsIcon size={24} className="text-blue-400" />}
            />

            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
