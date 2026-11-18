import React from "react";
import { Dialog, Avatar, Button } from "@/components/ui";

export interface UnfriendTargetUser {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}

export interface UnfriendConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UnfriendTargetUser | null;
  onConfirm: (userId: string) => void | Promise<void>;
  loading?: boolean;
}

export default function UnfriendConfirmModal({
  isOpen,
  onClose,
  user,
  onConfirm,
  loading = false,
}: UnfriendConfirmModalProps) {
  if (!user) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Remove ${user.name}?`}
    >
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0f172a] border border-[#1f2937]">
          <Avatar src={user.avatar} name={user.name} size="md" />
          <div>
            <p className="text-sm font-semibold text-white">{user.name}</p>
            {user.role && <p className="text-xs text-slate-400">{user.role}</p>}
          </div>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Are you sure you want to remove{" "}
          <span className="text-white font-medium">{user.name}</span> from your developer
          connections? They will not be notified, but you will no longer see each other&apos;s
          updates.
        </p>
        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onConfirm(user.id)}
            disabled={loading}
          >
            {loading ? "Removing..." : "Remove Connection"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
