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
      <form onSubmit={handlePasswordSubmit} className="space-y-6">
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

        <div className="space-y-4 max-w-md">
          <Input
            label="Current Password"
            type="password"
            placeholder="Enter current password..."
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
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
          />
        </div>

        <div className="pt-4 border-t border-[#1f2937] space-y-4">
          <Switch
            label="Two-Factor Authentication (2FA)"
            description="Require a verification code when signing in from an unknown device."
            checked={twoFactor}
            onChange={(e) => setTwoFactor(e.target.checked)}
          />
        </div>

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

          <Button variant="primary" type="submit" loading={loading}>
            Update Security
          </Button>
        </div>
      </form>

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
