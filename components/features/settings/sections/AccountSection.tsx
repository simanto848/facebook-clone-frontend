"use client";

import React, { useState } from "react";
import SettingsSection from "@/components/features/settings/SettingsSection";
import { Input, Button } from "@/components/ui";

export default function AccountSection() {
  const [fullName, setFullName] = useState("Simanto Hasan");
  const [username, setUsername] = useState("simanto");
  const [email, setEmail] = useState("simanto@example.com");
  const [phone, setPhone] = useState("+880 1712-345678");

  return (
    <SettingsSection
      title="Account Information"
      description="Manage your personal details and account info."
    >
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="flex justify-end pt-2 border-t border-[#1f2937]">
          <Button variant="primary" type="submit">
            Save Changes
          </Button>
        </div>
      </form>
    </SettingsSection>
  );
}
