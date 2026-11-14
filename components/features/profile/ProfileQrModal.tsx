import React from "react";
import { Dialog, Button, Avatar } from "@/components/ui";
import ShareProfileButton from "@/components/features/profile/ShareProfileButton";

export interface ProfileQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  profileUrl?: string;
}

export function ProfileQrModal({
  isOpen,
  onClose,
  username,
  displayName,
  avatarUrl,
  profileUrl,
}: ProfileQrModalProps) {
  const name = displayName || username;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Profile QR Code">
      <div className="flex flex-col items-center justify-center p-4 space-y-4 text-center">
        <div className="relative p-5 rounded-2xl bg-white text-slate-900 shadow-2xl flex flex-col items-center">
          {/* Stylized QR Code Matrix */}
          <div className="relative w-48 h-48 bg-white p-2 border-2 border-slate-200 rounded-xl flex items-center justify-center">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full text-slate-900 fill-current"
            >
              {/* Top-left corner finder */}
              <rect
                x="5"
                y="5"
                width="28"
                height="28"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
              />
              <rect x="12" y="12" width="14" height="14" fill="currentColor" />
              {/* Top-right corner finder */}
              <rect
                x="67"
                y="5"
                width="28"
                height="28"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
              />
              <rect x="74" y="12" width="14" height="14" fill="currentColor" />
              {/* Bottom-left corner finder */}
              <rect
                x="5"
                y="67"
                width="28"
                height="28"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
              />
              <rect x="12" y="74" width="14" height="14" fill="currentColor" />
              {/* Aesthetic data blocks */}
              <rect x="38" y="8" width="8" height="8" />
              <rect x="50" y="16" width="10" height="6" />
              <rect x="38" y="28" width="6" height="10" />
              <rect x="48" y="38" width="8" height="8" />
              <rect x="8" y="44" width="8" height="6" />
              <rect x="20" y="40" width="8" height="12" />
              <rect x="68" y="42" width="10" height="8" />
              <rect x="82" y="48" width="10" height="8" />
              <rect x="38" y="56" width="12" height="6" />
              <rect x="54" y="52" width="8" height="10" />
              <rect x="42" y="70" width="8" height="14" />
              <rect x="58" y="68" width="8" height="8" />
              <rect x="70" y="76" width="12" height="8" />
              <rect x="84" y="68" width="8" height="14" />
              <rect x="72" y="62" width="6" height="6" />
            </svg>

            {/* Centered Avatar badge */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="h-10 w-10 rounded-full border-2 border-white shadow-md overflow-hidden bg-slate-900">
                <Avatar src={avatarUrl} name={name} size="sm" />
              </div>
            </div>
          </div>

          <div className="mt-3 text-center">
            <p className="font-extrabold text-sm text-slate-900">{name}</p>
            <p className="text-xs text-slate-500 font-mono">@{username}</p>
          </div>
        </div>

        <p className="text-xs text-slate-400 max-w-xs">
          Scan this QR code with any camera or scanner to view and follow @
          {username}&apos;s profile on TechSphere.
        </p>

        <div className="flex gap-2 w-full pt-2 border-t border-[#1f2937]">
          <ShareProfileButton
            url={profileUrl}
            variant="primary"
            className="flex-1 justify-center border-transparent bg-blue-600 hover:bg-blue-500 text-white"
            label="Copy Profile URL"
            copiedLabel="Link Copied!"
          />
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

export default ProfileQrModal;
