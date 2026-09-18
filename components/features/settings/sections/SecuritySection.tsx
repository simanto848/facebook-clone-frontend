"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import SettingsSection from "@/components/features/settings/SettingsSection";
import { PasswordStrength, Input, Button, Switch, Dialog } from "@/components/ui";
import { userService } from "@/services/userService";
import { useAuth } from "@/hooks/useAuth";
import { CheckCircle2, AlertCircle, AlertTriangle } from "lucide-react";

export default function SecuritySection() {
  const router = useRouter();
  const { logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
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
          <Switch
            label="Two-Factor Authentication (2FA)"
            description="Require an authentication code when signing in from unrecognized browsers or mobile apps."
            checked={twoFactor}
            onChange={(e) => setTwoFactor(e.target.checked)}
          />
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
    </SettingsSection>
  );
}
