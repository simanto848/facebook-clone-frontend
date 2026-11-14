import React from "react";
import Image from "next/image";
import { Camera } from "lucide-react";

export interface ProfileAvatarProps {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  isOnline?: boolean | null;
  onEditAvatar?: () => void;
  className?: string;
  sizes?: string;
}

const SIZE_CLASSES = {
  sm: "h-16 w-16",
  md: "h-24 w-24",
  lg: "h-28 w-28 sm:h-32 sm:w-32",
  xl: "h-32 w-32 md:h-36 md:w-36",
};

export function ProfileAvatar({
  src,
  alt,
  size = "lg",
  isOnline = null,
  onEditAvatar,
  className = "",
  sizes = "128px",
}: ProfileAvatarProps) {
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.lg;

  return (
    <div
      className={`relative ${sizeClass} rounded-full overflow-hidden border-4 border-[#0f172a] shadow-xl bg-[#111827] shrink-0 group/avatar ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className="object-cover"
      />

      {isOnline !== null && (
        <span
          className={`absolute bottom-2 right-2 h-4 w-4 rounded-full border-2 border-[#0f172a] ${
            isOnline ? "bg-emerald-500" : "bg-slate-500"
          }`}
          title={isOnline ? "Online" : "Offline"}
        />
      )}

      {onEditAvatar && (
        <button
          type="button"
          onClick={onEditAvatar}
          title="Update avatar"
          aria-label="Update avatar"
          className="absolute bottom-1 right-1 p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-black/50 transition cursor-pointer"
        >
          <Camera size={14} />
        </button>
      )}
    </div>
  );
}

export default ProfileAvatar;
