"use client";

import React, { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  showHeader?: boolean;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  showHeader = true,
  children,
  footer,
  className,
  size = "md",
}: DialogProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in-0"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        className={cn(
          "relative z-10 w-full rounded-2xl border border-[#1f2937] bg-[#111827] p-6 text-white shadow-2xl space-y-4 animate-in fade-in-0 zoom-in-95 duration-150",
          sizeClasses[size],
          className
        )}
      >
        {/* Header */}
        {showHeader && (title || description) && (
          <div className="flex items-start justify-between border-b border-[#1f2937] pb-3">
            <div>
              {title && <h3 className="font-bold text-base text-white">{title}</h3>}
              {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:bg-[#1f2937] hover:text-white transition"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="text-xs text-slate-300">{children}</div>

        {/* Footer */}
        {footer && <div className="border-t border-[#1f2937] pt-4 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}
