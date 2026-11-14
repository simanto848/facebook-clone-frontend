import React from "react";
import Image from "next/image";
import { Camera } from "lucide-react";

export interface ProfileCoverProps {
  src: string;
  alt?: string;
  onEditCover?: () => void;
  overlayClassName?: string;
  className?: string;
  heightClassName?: string;
  editButtonLabel?: string;
}

export function ProfileCover({
  src,
  alt = "Cover",
  onEditCover,
  overlayClassName = "bg-black/40",
  className = "",
  heightClassName = "h-48 sm:h-64 md:h-72",
  editButtonLabel = "Edit Cover Photo",
}: ProfileCoverProps) {
  return (
    <div className={`relative ${heightClassName} w-full overflow-hidden group/cover ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      {overlayClassName && <div className={`absolute inset-0 ${overlayClassName}`} />}

      {onEditCover && (
        <button
          type="button"
          onClick={onEditCover}
          className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-xs font-semibold text-white transition border border-white/10 shadow-lg cursor-pointer"
        >
          <Camera size={14} />
          <span>{editButtonLabel}</span>
        </button>
      )}
    </div>
  );
}

export default ProfileCover;
