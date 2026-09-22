"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SettingsSection from "@/components/features/settings/SettingsSection";
import { Input, Button, Dialog } from "@/components/ui";
import { useAuthStore } from "@/store/authStore";
import { useAuth } from "@/hooks/useAuth";
import { userService } from "@/services/userService";
import { Check, AlertCircle, AlertTriangle, Trash2, Globe } from "lucide-react";

const MAX_BIO_LENGTH = 200;

export default function AccountSection() {
  const router = useRouter();
  const { logout } = useAuth();
  const { user, updateUser } = useAuthStore();
  const [fullName, setFullName] = useState(user?.displayName || "");
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState((user as any)?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || "");
  const [website, setWebsite] = useState((user as any)?.website || "");
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  useEffect(() => {
    if (user) {
      setFullName(user.displayName || "");
      setUsername(user.username || "");
      setBio((user as any)?.bio || "");
      setAvatarUrl(user.avatar || "");
      setWebsite((user as any)?.website || "");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);

    const isWebsiteValid = !website.trim() || /^https?:\/\/.+\..+/.test(website.trim());
    if (!isWebsiteValid) {
      setErrorMessage("Please enter a valid website URL beginning with http:// or https://");
      setIsSaving(false);
      return;
    }

    try {
      await userService.updateProfile({
        displayName: fullName,
        bio: bio,
        avatar: avatarUrl,
        website: website.trim(),
      });
      updateUser({
        displayName: fullName,
        avatar: avatarUrl,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || err.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SettingsSection
      title="Account Information"
      description="Manage your personal details and profile info."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Display Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <Input
            label="Avatar Image URL"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
          />

          <div className="space-y-1">
            <Input
              label="Website or Portfolio URL"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yourportfolio.dev"
            />
            {website && !/^https?:\/\/.+\..+/.test(website.trim()) && (
              <p className="text-[10px] text-amber-400">Must start with http:// or https://</p>
            )}
          </div>

          <div className="space-y-1 md:col-span-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 block">Short Bio</label>
              <span
                className={`text-[11px] font-mono ${
                  bio.length >= MAX_BIO_LENGTH ? "text-amber-400 font-bold" : "text-slate-500"
                }`}
              >
                {bio.length} / {MAX_BIO_LENGTH}
              </span>
            </div>
            <textarea
              value={bio}
              maxLength={MAX_BIO_LENGTH}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell the community about yourself..."
              className="w-full h-20 rounded-xl border border-[#374151] bg-[#1f2937] p-3 text-xs text-white outline-none resize-none focus:border-blue-500 transition"
            />
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-[#1f2937]">
          {saved && (
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <Check size={16} />
              <span>Profile settings saved!</span>
            </div>
          )}
          <Button variant="primary" type="submit" loading={isSaving} className="ml-auto">
            Save Changes
          </Button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="mt-8 pt-6 border-t border-[#1f2937]">
        <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-rose-400">
              <Trash2 size={16} />
              <h4 className="text-sm font-bold text-white">Danger Zone</h4>
            </div>
            <p className="text-xs text-slate-400">
              Permanently delete your account, posts, friendships, and all associated profile data.
            </p>
          </div>

          <Button
            variant="danger"
            size="sm"
            type="button"
            onClick={() => {
              setDeleteConfirmationText("");
              setDeleteError(null);
              setIsDeleteModalOpen(true);
            }}
            className="shrink-0"
          >
            Delete Account
          </Button>
        </div>
      </div>

      {/* DELETE ACCOUNT CONFIRMATION MODAL */}
      <Dialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Account Permanently"
        description="This action cannot be undone. All your posts, bookmarks, friendships, and messages will be permanently erased."
        size="md"
      >
        <div className="space-y-4 pt-2">
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertTriangle size={18} className="shrink-0 text-rose-400 mt-0.5" />
            <p>
              Please be aware that your account will be immediately deleted from the database. Type <strong className="text-white">DELETE</strong> below to confirm.
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
