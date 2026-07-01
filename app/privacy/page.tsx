"use client";

import React, { useState } from "react";
import { 
  Shield, 
  Lock, 
  Eye, 
  KeyRound, 
  Smartphone, 
  BellRing, 
  UserX, 
  ChevronRight, 
  Check, 
  Globe, 
  Users, 
  UserCheck,
  AlertCircle
} from "lucide-react";
import SettingToggle from "@/components/features/settings/SettingToggle";
import SettingSelect from "@/components/features/settings/SettingSelect";

export default function PrivacySecurityPage() {
  const [activeTab, setActiveTab] = useState<"privacy" | "security">("privacy");
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordData.current || !passwordData.new || !passwordData.confirm) return;
    
    setPasswordSaved(true);
    setTimeout(() => {
      setPasswordSaved(false);
      setPasswordData({ current: "", new: "", confirm: "" });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header banner */}
        <div className="relative mb-8 overflow-hidden rounded-2xl border border-[#1f2937] bg-gradient-to-r from-blue-600/10 via-purple-600/5 to-transparent p-6 sm:p-8">
          <div className="relative z-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/25">
              <Shield size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">Privacy & Security</h1>
              <p className="mt-1 text-sm text-slate-400">
                Manage your profile visibility, customize access controls, and configure account security preferences.
              </p>
            </div>
          </div>
          <div className="absolute right-0 top-0 -mr-12 -mt-12 h-40 w-40 rounded-full bg-blue-500/5 blur-3xl" />
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-12 gap-8">
          {/* Section Selector */}
          <div className="col-span-12 md:col-span-3 space-y-2">
            <button
              onClick={() => setActiveTab("privacy")}
              className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition duration-200 ${
                activeTab === "privacy"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/10"
                  : "text-slate-400 hover:bg-[#111827] hover:text-white border border-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                <Eye size={18} />
                <span>Privacy</span>
              </div>
              <ChevronRight size={16} className={activeTab === "privacy" ? "text-white" : "text-slate-500"} />
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition duration-200 ${
                activeTab === "security"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/10"
                  : "text-slate-400 hover:bg-[#111827] hover:text-white border border-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                <Lock size={18} />
                <span>Security</span>
              </div>
              <ChevronRight size={16} className={activeTab === "security" ? "text-white" : "text-slate-500"} />
            </button>
          </div>

          {/* Active Section Content */}
          <div className="col-span-12 md:col-span-9 space-y-6">
            {activeTab === "privacy" && (
              <div className="space-y-6">
                {/* Profile Privacy Card */}
                <div className="rounded-2xl border border-[#1f2937] bg-[#111827]/60 backdrop-blur-md p-6">
                  <div className="border-b border-[#1f2937] pb-4 mb-5">
                    <h3 className="text-lg font-semibold text-white">Profile Privacy</h3>
                    <p className="text-xs text-slate-400 mt-1">Control who can discover and see your profile info.</p>
                  </div>
                  <div className="space-y-6">
                    <SettingToggle
                      title="Private Profile"
                      description="When active, only accepted connections can see your posts, stories, and details."
                    />
                    <hr className="border-[#1f2937]" />
                    <SettingToggle
                      title="Active Status"
                      description="Show when you are active. Friends and connections will see when you're online."
                    />
                    <hr className="border-[#1f2937]" />
                    <SettingSelect
                      label="Who can send you friend requests?"
                      defaultValue="everyone"
                      description="Choose who is allowed to connect with you."
                      options={[
                        { label: "Everyone", value: "everyone" },
                        { label: "Friends of Friends", value: "friends-of-friends" },
                        { label: "No one", value: "none" }
                      ]}
                    />
                  </div>
                </div>

                {/* Sharing and Interactions */}
                <div className="rounded-2xl border border-[#1f2937] bg-[#111827]/60 backdrop-blur-md p-6">
                  <div className="border-b border-[#1f2937] pb-4 mb-5">
                    <h3 className="text-lg font-semibold text-white">Sharing & Interactions</h3>
                    <p className="text-xs text-slate-400 mt-1">Manage comment permissions and tagging settings.</p>
                  </div>
                  <div className="space-y-6">
                    <SettingSelect
                      label="Who can comment on your public posts?"
                      defaultValue="everyone"
                      description="Manage who can post comments under your content."
                      options={[
                        { label: "Everyone", value: "everyone" },
                        { label: "Friends & Connections", value: "friends" },
                        { label: "Only Me", value: "private" }
                      ]}
                    />
                    <hr className="border-[#1f2937]" />
                    <SettingToggle
                      title="Allow Story Sharing"
                      description="Permit other users to share your public stories to their own stories feed."
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6">
                {/* Change Password Card */}
                <div className="rounded-2xl border border-[#1f2937] bg-[#111827]/60 backdrop-blur-md p-6">
                  <div className="border-b border-[#1f2937] pb-4 mb-5">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <KeyRound size={20} className="text-blue-400" />
                      Update Password
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Keep your account secure with a strong password.</p>
                  </div>
                  
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Current Password</label>
                        <input
                          type="password"
                          value={passwordData.current}
                          onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                          className="w-full h-11 bg-[#0b0f19] border border-[#1f2937] rounded-xl px-4 text-white outline-none focus:border-blue-500 transition duration-150 text-sm"
                          placeholder="••••••••"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">New Password</label>
                        <input
                          type="password"
                          value={passwordData.new}
                          onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                          className="w-full h-11 bg-[#0b0f19] border border-[#1f2937] rounded-xl px-4 text-white outline-none focus:border-blue-500 transition duration-150 text-sm"
                          placeholder="••••••••"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Confirm New Password</label>
                        <input
                          type="password"
                          value={passwordData.confirm}
                          onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                          className="w-full h-11 bg-[#0b0f19] border border-[#1f2937] rounded-xl px-4 text-white outline-none focus:border-blue-500 transition duration-150 text-sm"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      {passwordSaved ? (
                        <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                          <Check size={16} />
                          <span>Password updated successfully!</span>
                        </div>
                      ) : (
                        <div />
                      )}
                      <button
                        type="submit"
                        className="h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 rounded-xl transition duration-150 shadow-lg shadow-blue-600/15"
                      >
                        Save Password
                      </button>
                    </div>
                  </form>
                </div>

                {/* Two-Factor Authentication & Devices */}
                <div className="rounded-2xl border border-[#1f2937] bg-[#111827]/60 backdrop-blur-md p-6">
                  <div className="border-b border-[#1f2937] pb-4 mb-5">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Smartphone size={20} className="text-purple-400" />
                      Two-Factor Authentication
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Add an extra layer of protection to your account.</p>
                  </div>
                  <div className="space-y-5">
                    <SettingToggle
                      title="Two-Factor Authentication (2FA)"
                      description="Receive a code via app or SMS whenever you log in from a new device."
                    />
                  </div>
                </div>

                {/* Login History */}
                <div className="rounded-2xl border border-[#1f2937] bg-[#111827]/60 backdrop-blur-md p-6">
                  <div className="border-b border-[#1f2937] pb-4 mb-5">
                    <h3 className="text-lg font-semibold text-white">Active Sessions</h3>
                    <p className="text-xs text-slate-400 mt-1">Where you are currently logged in.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-[#0b0f19]/40 p-3.5 rounded-xl border border-[#1f2937]/50">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center border border-green-500/20">
                          <Smartphone size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">MacBook Pro (Chrome)</p>
                          <p className="text-xs text-slate-400">Dhaka, Bangladesh · Active now</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">Current</span>
                    </div>

                    <div className="flex justify-between items-center bg-[#0b0f19]/40 p-3.5 rounded-xl border border-[#1f2937]/50">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-slate-500/10 text-slate-400 flex items-center justify-center border border-slate-500/20">
                          <Smartphone size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">iPhone 15 Pro</p>
                          <p className="text-xs text-slate-400">Dhaka, Bangladesh · 2 hours ago</p>
                        </div>
                      </div>
                      <button className="text-xs font-semibold text-red-400 hover:text-red-300 transition duration-150">Log Out</button>
                    </div>
                  </div>
                </div>

                {/* Account Deletion / Danger Zone */}
                <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 shrink-0">
                      <AlertCircle size={20} />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <h4 className="text-base font-semibold text-white">Danger Zone</h4>
                        <p className="text-xs text-slate-400 mt-1">Permanently remove your profile page, posts, and data.</p>
                      </div>
                      <button className="h-10 border border-red-500 hover:bg-red-500/10 text-red-400 text-sm font-semibold px-5 rounded-xl transition duration-150">
                        Deactivate Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
