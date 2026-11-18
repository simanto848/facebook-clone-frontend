import React from "react";
import { Dialog, Button } from "@/components/ui";

export interface BlockUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
}

export default function BlockUserModal({
  isOpen,
  onClose,
  userName,
  onConfirm,
  loading = false,
}: BlockUserModalProps) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Block ${userName}?`}
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-300">
          {userName} will no longer be able to message you, see your posts, or find your profile. They will not be notified that you blocked them.
        </p>
        <div className="flex justify-end gap-3 pt-2">
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
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Blocking..." : "Block"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
