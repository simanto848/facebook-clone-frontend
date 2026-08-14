"use client";

import Image from "next/image";
import { cva, type VariantProps } from "@/lib/cva";
import { cn } from "@/lib/utils";

const avatarVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#374151] bg-[#1f2937] text-white font-bold select-none",
  {
    variants: {
      size: {
        xs: "h-6 w-6 text-[10px]",
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-xs",
        lg: "h-12 w-12 text-sm",
        xl: "h-16 w-16 text-base",
        "2xl": "h-24 w-24 text-xl",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export type AvatarProps = VariantProps<typeof avatarVariants> & {
  src?: string | null;
  alt?: string;
  name?: string;
  online?: boolean;
  className?: string;
  onClick?: () => void;
};

const pixelSizes: Record<string, string> = {
  xs: "24px",
  sm: "32px",
  md: "40px",
  lg: "48px",
  xl: "64px",
  "2xl": "96px",
};

export function Avatar({
  src,
  alt = "Avatar",
  name,
  size = "md",
  online,
  className,
  onClick,
}: AvatarProps) {
  const getInitials = (n?: string) => {
    if (!n) return "?";
    const parts = n.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  const currentSizeKey = String(size || "md");
  const computedSizes = pixelSizes[currentSizeKey] || "40px";

  return (
    <div className="relative inline-block shrink-0" onClick={onClick}>
      <div className={cn(avatarVariants({ size }), className)}>
        {src ? (
          <Image
            src={src}
            alt={alt || name || "Avatar"}
            fill
            sizes={computedSizes}
            className="object-cover"
          />
        ) : (
          <span>{getInitials(name || alt)}</span>
        )}
      </div>

      {online !== undefined && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-[#111827]",
            online ? "bg-green-500" : "bg-slate-500",
            size === "xs" || size === "sm" ? "h-2 w-2" : size === "lg" || size === "xl" ? "h-3.5 w-3.5" : "h-2.5 w-2.5"
          )}
        />
      )}
    </div>
  );
}
