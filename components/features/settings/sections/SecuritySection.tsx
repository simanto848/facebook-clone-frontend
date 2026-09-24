"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import SettingsSection from "@/components/features/settings/SettingsSection";
import { PasswordStrength, Input, Button, Switch, Dialog } from "@/components/ui";
import { userService } from "@/services/userService";
import { useAuth } from "@/hooks/useAuth";
import { CheckCircle2, AlertCircle, AlertTriangle, ShieldCheck, QrCode, Copy, Check, RefreshCw, KeyRound, Laptop, Smartphone, Monitor, LogOut, ShieldAlert, Globe } from "lucide-react";

export default function SecuritySection() {
  const router = useRouter();
  const { logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [isTwoFactorModalOpen, setIsTwoFactorModalOpen] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);
  const [twoFactorSuccess, setTwoFactorSuccess] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([
    "8F3A-992B",
    "C41D-770E",
    "55A2-119F",
    "EE40-92B1",
    "771C-338A",
    "990D-22FA",
  ]);
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  // Active Sessions
  const [sessions, setSessions] = useState([
    {
      id: "sess-1",
      device: "MacBook Pro (Apple Silicon)",
      browser: "Chrome 124.0",
      location: "San Francisco, USA",
      time: "Active now",
      current: true,
      type: "laptop" as const,
    },
    {
      id: "sess-2",
      device: "iPhone 15 Pro",
      browser: "Mobile Safari",
      location: "San Jose, USA",
      time: "3 hours ago",
      current: false,
      type: "mobile" as const,
    },
    {
      id: "sess-3",
      device: "Windows Desktop PC",
      browser: "Firefox 125",
      location: "Austin, USA",
      time: "2 days ago",
      current: false,
      type: "desktop" as const,
    },
  ]);
  const [loggedOutOther, setLoggedOutOther] = useState(false);
  const [unrecognizedLoginAlerts, setUnrecognizedLoginAlerts] = useState(true);

  const handleLogOutSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const handleLogOutAllOtherSessions = () => {
    setSessions((prev) => prev.filter((s) => s.current));
    setLoggedOutOther(true);
    setTimeout(() => setLoggedOutOther(false), 3000);
  };

  const generateNewBackupCodes = () => {
    const chars = "0123456789ABCDEF";
    const newCodes = Array.from({ length: 6 }, () => {
      const p1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
      const p2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
      return `${p1}-${p2}`;
    });
    setBackupCodes(newCodes);
    setCopiedCodes(false);
  };

  const handleCopyBackupCodes = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(backupCodes.join("\n"));
      setCopiedCodes(true);
      setTimeout(() => setCopiedCodes(false), 2500);
    }
  };

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFactorCode.trim().length < 6) {
      setTwoFactorError("Please enter a valid 6-digit authentication code.");
      return;
    }
    setTwoFactor(true);
    setTwoFactorSuccess(true);
    setTwoFactorError(null);
    setTimeout(() => {
      setIsTwoFactorModalOpen(false);
      setTwoFactorSuccess(false);
      setTwoFactorCode("");
    }, 1200);
  };
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Delete account modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteAccount = async () => {
    if (deleteConfirmationText.trim() !== "DELETE") {
      setDeleteError('Please type "DELETE" exactly to confirm account deletion.');
      return;
    }

    setDeletingAccount(true);
    setDeleteError(null);
    try {
      await userService.deleteAccount();
      logout();
      router.push("/login");
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to delete account";
      setDeleteError(msg);
      setDeletingAccount(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!currentPassword) {
      setErrorMsg("Current password is required");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg("New password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("New password and confirmation do not match");
      return;
    }

    setLoading(true);
    try {
      await userService.changePassword({ currentPassword, newPassword });
      setSuccessMsg("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsPasswordModalOpen(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to update password";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsSection
      title="Security & Authentication"
      description="Protect your account with strong passwords and 2FA authentication."
    >
      <div className="space-y-6">
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Password Status Card */}
        <div className="p-4 rounded-2xl bg-[#111827] border border-[#1f2937] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">Login Password</h3>
            <p className="text-xs text-slate-400">
              Ensure your account is using a long, random password to stay secure.
            </p>
            <p className="text-[11px] text-slate-500">Last changed: Recently</p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setCurrentPassword("");
              setNewPassword("");
              setConfirmPassword("");
              setErrorMsg(null);
              setIsPasswordModalOpen(true);
            }}
            className="shrink-0 border border-[#1f2937] text-white"
          >
            Change Password
          </Button>
        </div>

        {/* 2FA Card */}
        <div className="p-4 rounded-2xl bg-[#111827] border border-[#1f2937] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Two-Factor Authentication (2FA)</h3>
                {twoFactor && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck size={11} /> Enabled
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Require an authentication code from your authenticator app when signing in from new devices.
              </p>
            </div>

            <Button
              variant={twoFactor ? "secondary" : "primary"}
              size="sm"
              type="button"
              onClick={() => {
                if (twoFactor) {
                  setTwoFactor(false);
                  setShowBackupCodes(false);
                } else {
                  setIsTwoFactorModalOpen(true);
                }
              }}
              className="shrink-0"
            >
              {twoFactor ? "Disable 2FA" : "Enable 2FA"}
            </Button>
          </div>

          {/* Backup Codes Section when 2FA is active */}
          {twoFactor && (
            <div className="pt-3 border-t border-[#1f2937] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                  <KeyRound size={14} className="text-blue-400" />
                  <span>Backup Recovery Codes</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBackupCodes(!showBackupCodes)}
                    className="text-xs text-blue-400 hover:underline cursor-pointer"
                  >
                    {showBackupCodes ? "Hide Codes" : "Reveal Codes"}
                  </button>
                </div>
              </div>

              {showBackupCodes ? (
                <div className="p-3.5 rounded-xl bg-[#0f172a] border border-[#1f2937] space-y-3">
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Store these single-use recovery codes in a safe place. If you lose access to your authenticator device, each code can be used once to access your account.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-xs text-white">
                    {backupCodes.map((code, idx) => (
                      <div
                        key={idx}
                        className="px-2.5 py-1.5 rounded-lg bg-[#111827] border border-[#1f2937] text-center select-all"
                      >
                        {code}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<RefreshCw size={12} />}
                      onClick={generateNewBackupCodes}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Regenerate
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={copiedCodes ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      onClick={handleCopyBackupCodes}
                      className="text-xs"
                    >
                      {copiedCodes ? "Codes Copied!" : "Copy All Codes"}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-slate-500">
                  Backup recovery codes are generated and ready. Reveal them to copy or download.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Where You're Logged In (Active Sessions) */}
        <div className="p-4 rounded-2xl bg-[#111827] border border-[#1f2937] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Laptop size={16} className="text-blue-400" />
                <span>Where You&apos;re Logged In</span>
              </h3>
              <p className="text-xs text-slate-400">
                Review devices that have recent or active sessions with your account.
              </p>
            </div>

            {sessions.some((s) => !s.current) && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleLogOutAllOtherSessions}
                leftIcon={<LogOut size={13} />}
                className="shrink-0 text-xs border border-rose-500/30 text-rose-300 hover:bg-rose-500/10"
              >
                Log Out All Other Devices
              </Button>
            )}
          </div>

          {loggedOutOther && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 size={15} />
              <span>All other sessions have been logged out securely.</span>
            </div>
          )}

          <div className="space-y-2.5">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                className="p-3 rounded-xl bg-[#0f172a] border border-[#1f2937] flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-[#111827] text-blue-400 shrink-0">
                    {sess.type === "mobile" ? (
                      <Smartphone size={16} />
                    ) : sess.type === "desktop" ? (
                      <Monitor size={16} />
                    ) : (
                      <Laptop size={16} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white truncate">{sess.device}</span>
                      {sess.current && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          This Device
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 flex-wrap">
                      <span>{sess.browser}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Globe size={10} /> {sess.location}
                      </span>
                      <span>·</span>
                      <span className={sess.current ? "text-emerald-400 font-medium" : "text-slate-500"}>
                        {sess.time}
                      </span>
                    </div>
                  </div>
                </div>

                {!sess.current && (
                  <button
                    type="button"
                    onClick={() => handleLogOutSession(sess.id)}
                    className="text-xs text-rose-400 hover:text-rose-300 hover:underline shrink-0 px-2 py-1"
                  >
                    Log Out
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Unrecognized Login Alerts */}
        <div className="p-4 rounded-2xl bg-[#111827] border border-[#1f2937] space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <ShieldAlert size={14} className="text-amber-400" />
                <span>Unrecognized Login Alerts</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                Receive instant security notifications if someone logs in from an unknown device or location.
              </p>
            </div>
            <Switch
              checked={unrecognizedLoginAlerts}
              onChange={(e) => setUnrecognizedLoginAlerts(e.target.checked)}
            />
          </div>
        </div>

        {/* Delete Account Trigger */}
        <div className="flex items-center justify-between pt-4 border-t border-[#1f2937]">
          <Button
            variant="danger"
            type="button"
            onClick={() => {
              setDeleteConfirmationText("");
              setDeleteError(null);
              setIsDeleteModalOpen(true);
            }}
          >
            Delete Account
          </Button>
        </div>
      </div>

      {/* CHANGE PASSWORD MODAL */}
      <Dialog
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Change Password"
        description="Update your current password to maintain account security."
        size="md"
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-2">
          <Input
            label="Current Password"
            type="password"
            placeholder="Enter current password..."
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="bg-[#0f172a] border-[#1f2937]"
          />

          <PasswordStrength
            label="New Password"
            placeholder="Create strong password..."
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Confirm new password..."
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="bg-[#0f172a] border-[#1f2937]"
          />

          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-rose-500/20 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1f2937]">
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => setIsPasswordModalOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              loading={loading}
            >
              Update Password
            </Button>
          </div>
        </form>
      </Dialog>

      {/* DELETE ACCOUNT CONFIRMATION MODAL */}
      <Dialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Account Permanently"
        description="This action cannot be undone. All your timeline posts, bookmarks, friendships, and messages will be permanently erased."
        size="md"
      >
        <div className="space-y-4 pt-2">
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertTriangle size={18} className="shrink-0 text-rose-400 mt-0.5" />
            <p>
              Please be aware that your account will be immediately wiped from the database. Type <strong className="text-white">DELETE</strong> below to confirm.
            </p>
          </div>

          {deleteError && (
            <div className="p-2.5 rounded-lg bg-rose-500/20 text-rose-300 text-xs">
              {deleteError}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Type DELETE to confirm</label>
            <Input
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              placeholder="DELETE"
              className="bg-[#111827] border-[#1f2937]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1f2937]">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deletingAccount}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              type="button"
              loading={deletingAccount}
              disabled={deleteConfirmationText.trim() !== "DELETE"}
              onClick={handleDeleteAccount}
            >
              Confirm Permanent Deletion
            </Button>
          </div>
        </div>
      </Dialog>

      {/* 2FA SETUP MODAL */}
      <Dialog
        isOpen={isTwoFactorModalOpen}
        onClose={() => {
          setIsTwoFactorModalOpen(false);
          setTwoFactorError(null);
          setTwoFactorCode("");
        }}
        title="Set Up Two-Factor Authentication"
        description="Scan the QR code with an authenticator app (Google Authenticator, Authy, or 1Password) and enter the 6-digit code."
        size="md"
      >
        <div className="space-y-4 pt-2">
          {twoFactorSuccess ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 size={18} className="shrink-0" />
              <span>Two-Factor Authentication has been successfully enabled!</span>
            </div>
          ) : (
            <>
              {/* Simulated QR Code & Key */}
              <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#0f172a] border border-[#1f2937] text-center space-y-2">
                <div className="p-3 bg-white rounded-xl shadow-md">
                  <QrCode size={120} className="text-slate-900" />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400">Can't scan? Use manual setup key:</span>
                  <div className="font-mono text-xs text-blue-400 bg-[#111827] px-2.5 py-1 rounded-md border border-[#1f2937] select-all">
                    FBCL-SEC-9842-AUTHENTICATOR
                  </div>
                </div>
              </div>

              {twoFactorError && (
                <div className="p-2.5 rounded-lg bg-rose-500/20 text-rose-300 text-xs">
                  {twoFactorError}
                </div>
              )}

              <form onSubmit={handleVerify2FA} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Enter 6-Digit Authentication Code</label>
                  <Input
                    type="text"
                    maxLength={6}
                    placeholder="e.g. 492019"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ""))}
                    className="bg-[#0f172a] border-[#1f2937] text-center font-mono tracking-widest text-base"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1f2937]">
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => {
                      setIsTwoFactorModalOpen(false);
                      setTwoFactorError(null);
                      setTwoFactorCode("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={twoFactorCode.length < 6}
                  >
                    Verify & Enable
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </Dialog>
    </SettingsSection>
  );
}
