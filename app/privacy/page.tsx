"use client";

import React, { useState } from "react";
import {
  Shield,
  Lock,
  Eye,
  KeyRound,
  Smartphone,
  Check,
  AlertCircle,
} from "lucide-react";
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Switch,
  Select,
  Button,
  Badge,
  Input,
  PasswordStrength,
} from "@/components/ui";

export default function PrivacySecurityPage() {
  const [activeTab, setActiveTab] = useState<"privacy" | "security">("privacy");
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;

    setPasswordSaved(true);
    setTimeout(() => {
      setPasswordSaved(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <PageHeader
          title="Privacy & Security Settings"
          description="Customize profile visibility, content permissions, and authentication controls."
          icon={<Shield size={24} className="text-blue-400" />}
          badge={<Badge variant="primary">Security Hub</Badge>}
        />

        {/* Layout Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Section Selector */}
          <div className="col-span-12 md:col-span-3 space-y-2">
            <Button
              variant={activeTab === "privacy" ? "primary" : "secondary"}
              fullWidth
              leftIcon={<Eye size={16} />}
              onClick={() => setActiveTab("privacy")}
              className="justify-start"
            >
              Privacy Controls
            </Button>

            <Button
              variant={activeTab === "security" ? "primary" : "secondary"}
              fullWidth
              leftIcon={<Lock size={16} />}
              onClick={() => setActiveTab("security")}
              className="justify-start"
            >
              Security & 2FA
            </Button>
          </div>

          {/* Active Section Content */}
          <div className="col-span-12 md:col-span-9 space-y-6">
            {activeTab === "privacy" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Profile Visibility & Access</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Switch
                      label="Private Profile"
                      description="When active, only accepted connections can see your posts and details."
                    />
                    <Switch
                      label="Show Online Active Status"
                      description="Allow friends and connections to see when you are currently online."
                    />
                    <Select
                      label="Who can send you connection requests?"
                      defaultValue="everyone"
                      options={[
                        { label: "Everyone", value: "everyone" },
                        { label: "Friends of Friends", value: "friends-of-friends" },
                        { label: "No One", value: "none" },
                      ]}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Sharing & Interactions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Select
                      label="Who can comment on your public posts?"
                      defaultValue="everyone"
                      options={[
                        { label: "Everyone", value: "everyone" },
                        { label: "Connections Only", value: "friends" },
                        { label: "Only Me", value: "private" },
                      ]}
                    />
                    <Switch
                      label="Allow Story Resharing"
                      description="Permit other developers to reshare your public stories to their timeline."
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <KeyRound size={18} className="text-blue-400" />
                      Update Password
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      <Input
                        label="Current Password"
                        type="password"
                        placeholder="••••••••"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />

                      <PasswordStrength
                        label="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />

                      <Input
                        label="Confirm New Password"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />

                      <div className="flex items-center justify-between pt-2">
                        {passwordSaved && (
                          <div className="flex items-center gap-2 text-green-400 text-xs font-bold">
                            <Check size={16} />
                            <span>Password updated successfully!</span>
                          </div>
                        )}
                        <Button variant="primary" type="submit">
                          Save Password
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Smartphone size={18} className="text-purple-400" />
                      Active Login Sessions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center bg-[#0b0f19]/60 p-3.5 rounded-xl border border-[#1f2937]">
                      <div className="flex items-center gap-3">
                        <Smartphone size={18} className="text-green-400" />
                        <div>
                          <p className="text-xs font-bold text-white">MacBook Pro (Chrome)</p>
                          <p className="text-[10px] text-slate-400">Dhaka, Bangladesh · Active now</p>
                        </div>
                      </div>
                      <Badge variant="success">Current</Badge>
                    </div>

                    <div className="flex justify-between items-center bg-[#0b0f19]/60 p-3.5 rounded-xl border border-[#1f2937]">
                      <div className="flex items-center gap-3">
                        <Smartphone size={18} className="text-slate-400" />
                        <div>
                          <p className="text-xs font-bold text-white">iPhone 15 Pro</p>
                          <p className="text-[10px] text-slate-400">Dhaka, Bangladesh · 2 hours ago</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                        Log Out
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
