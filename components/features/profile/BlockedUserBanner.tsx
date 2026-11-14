import React from "react";
import { UserX } from "lucide-react";
import { Button } from "@/components/ui";

export interface BlockedUserBannerProps {
  username: string;
  onUnblock: () => void;
  loading?: boolean;
  className?: string;
}

export function BlockedUserBanner({
  username,
  onUnblock,
  loading = false,
  className = "",
}: BlockedUserBannerProps) {
  return (
    <div
      className={`rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 flex items-center justify-between text-rose-300 text-sm ${className}`}
    >
      <div className="flex items-center gap-2.5">
        <UserX size={18} className="text-rose-400 shrink-0" />
        <span>
          You have blocked @{username}. Their posts and activities are hidden from your view.
        </span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onUnblock}
        disabled={loading}
        className="border-rose-500/30 text-rose-300 hover:bg-rose-500/20 shrink-0 cursor-pointer"
      >
        {loading ? "Unblocking..." : "Unblock"}
      </Button>
    </div>
  );
}

export default BlockedUserBanner;
