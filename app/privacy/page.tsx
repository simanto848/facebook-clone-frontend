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
  LogOut,
  Trash2,
  Download,
  Laptop,
  Globe,
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

  const [sessions, setSessions] = useState([
    { id: "s1", device: "MacBook Pro (Chrome 122)", ip: "103.114.98.24", location: "Dhaka, Bangladesh · Active now", isCurrent: true, type: "desktop" },
    { id: "s2", device: "iPhone 15 Pro (Safari 17)", ip: "103.114.98.81", location: "Dhaka, Bangladesh · 2 hours ago", isCurrent: false, type: "mobile" },
    { id: "s3", device: "iPad Air (Chrome Mobile)", ip: "119.73.200.12", location: "Singapore · 3 days ago", isCurrent: false, type: "tablet" },
  ]);
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);

  const handleRevokeSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    setSessionNotice("Session logged out successfully.");
    setTimeout(() => setSessionNotice(null), 3000);
  };

  const handleRevokeAllOtherSessions = () => {
    setSessions((prev) => prev.filter((s) => s.isCurrent));
    setSessionNotice("All other sessions logged out successfully.");
    setTimeout(() => setSessionNotice(null), 3000);
  };

  const handleExportSessions = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sessions, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `security_sessions_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setSessionNotice("Active login sessions audit log exported as JSON.");
    setTimeout(() => setSessionNotice(null), 3000);
  };

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
                  <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Smartphone size={18} className="text-purple-400" />
                      Active Login Sessions ({sessions.length})
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs text-slate-300 hover:text-white"
                        leftIcon={<Download size={13} />}
                        onClick={handleExportSessions}
                      >
                        Export Log
                      </Button>
                      {sessions.some((s) => !s.isCurrent) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-rose-400 hover:text-rose-300"
                          leftIcon={<LogOut size={13} />}
                          onClick={handleRevokeAllOtherSessions}
                        >
                          Log Out Other Sessions
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {sessionNotice && (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
                        <Check size={14} />
                        <span>{sessionNotice}</span>
                      </div>
                    )}
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex justify-between items-center bg-[#0b0f19]/60 p-3.5 rounded-xl border border-[#1f2937]"
                      >
                        <div className="flex items-center gap-3">
                          {session.type === "desktop" ? (
                            <Laptop
                              size={18}
                              className={session.isCurrent ? "text-emerald-400" : "text-slate-400"}
                            />
                          ) : (
                            <Smartphone
                              size={18}
                              className={session.isCurrent ? "text-emerald-400" : "text-slate-400"}
                            />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-white">{session.device}</p>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700/60 font-mono">
                                {session.ip}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">{session.location}</p>
                          </div>
                        </div>
                        {session.isCurrent ? (
                          <Badge variant="success">Current</Badge>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 text-xs"
                            onClick={() => handleRevokeSession(session.id)}
                          >
                            Log Out
                          </Button>
                        )}
                      </div>
                    ))}
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
