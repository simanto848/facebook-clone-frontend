import React from "react";
import { UserPlus, UserCheck, MessageSquare, UserX, Flag, QrCode } from "lucide-react";
import { Button } from "@/components/ui";
import ShareProfileButton from "./ShareProfileButton";

export interface UserProfileActionButtonsProps {
  friendStatus: "none" | "sent" | "friends";
  isFollowing: boolean;
  actionLoading?: boolean;
  onFriendAction: () => void | Promise<void>;
  onFollowToggle: () => void | Promise<void>;
  onMessage: () => void;
  onBlock: () => void;
  onReport: () => void;
  onShowQr: () => void;
  shareUrl?: string;
  className?: string;
}

export default function UserProfileActionButtons({
  friendStatus,
  isFollowing,
  actionLoading = false,
  onFriendAction,
  onFollowToggle,
  onMessage,
  onBlock,
  onReport,
  onShowQr,
  shareUrl,
  className = "flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap",
}: UserProfileActionButtonsProps) {
  return (
    <div className={className}>
      <Button
        variant={friendStatus === "friends" ? "secondary" : "primary"}
        size="sm"
        leftIcon={friendStatus === "friends" ? <UserCheck size={14} /> : <UserPlus size={14} />}
        onClick={onFriendAction}
        disabled={actionLoading}
        className="flex-1 sm:flex-none"
      >
        {friendStatus === "friends"
          ? "Friends"
          : friendStatus === "sent"
          ? "Request Sent"
          : "Add Friend"}
      </Button>

      <Button
        variant={isFollowing ? "secondary" : "ghost"}
        size="sm"
        onClick={onFollowToggle}
        disabled={actionLoading}
        className="flex-1 sm:flex-none border border-[#1f2937]"
      >
        {isFollowing ? "Following" : "Follow"}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        leftIcon={<MessageSquare size={14} />}
        onClick={onMessage}
        className="border border-[#1f2937] text-blue-400 hover:bg-blue-600/10"
      >
        Message
      </Button>

      <Button
        variant="ghost"
        size="sm"
        leftIcon={<UserX size={14} />}
        onClick={onBlock}
        className="border border-[#1f2937] text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
      >
        Block
      </Button>

      <Button
        variant="ghost"
        size="sm"
        leftIcon={<Flag size={14} />}
        onClick={onReport}
        className="border border-[#1f2937] text-slate-400 hover:text-amber-400 hover:bg-amber-500/10"
      >
        Report
      </Button>

      <Button
        variant="ghost"
        size="sm"
        leftIcon={<QrCode size={14} />}
        onClick={onShowQr}
        className="border border-[#1f2937] text-slate-300 hover:text-white"
        title="Display Profile QR Code"
      >
        QR Code
      </Button>

      <ShareProfileButton
        url={shareUrl}
        className="border border-[#1f2937] text-slate-300 hover:text-white"
        label="Share"
      />
    </div>
  );
}
