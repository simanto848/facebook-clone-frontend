import React from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui";

export interface ShareProfileButtonProps {
  url?: string;
  className?: string;
  variant?: "outline" | "ghost" | "secondary" | "primary";
  size?: "xs" | "sm" | "md" | "lg";
  iconOnly?: boolean;
  label?: string;
  copiedLabel?: string;
}

export function ShareProfileButton({
  url,
  className = "",
  variant = "ghost",
  size = "sm",
  iconOnly = false,
  label = "Share",
  copiedLabel = "Copied!",
}: ShareProfileButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== "undefined") {
      try {
        const link = url || window.location.href;
        await navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.warn("Failed to copy link:", err);
      }
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleCopy}
      leftIcon={copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
      className={`border border-[#1f2937] text-slate-300 hover:text-white transition cursor-pointer ${className}`}
      title={copied ? copiedLabel : label}
    >
      {!iconOnly && (copied ? copiedLabel : label)}
    </Button>
  );
}

export default ShareProfileButton;
