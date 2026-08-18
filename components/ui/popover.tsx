"use client";

import React, { useState, useRef, useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface PopoverProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  children: ReactNode;
  className?: string;
  onEscape?: () => void;
  placement?: { type?: string; estimatedHeight?: number };
  positionDeps?: any[];
  disabled?: boolean;
}

export function Popover({
  open: controlledOpen,
  onOpenChange,
  trigger,
  children,
  className,
  onEscape,
  disabled = false,
}: PopoverProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const popoverRef = useRef<HTMLDivElement>(null);

  const handleToggle = (next: boolean) => {
    if (disabled) return;
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        handleToggle(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        onEscape?.();
        handleToggle(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (trigger) {
    return (
      <div ref={popoverRef} className={cn("relative inline-block text-left", className)}>
        <PopoverTrigger isOpen={isOpen} handleToggle={handleToggle} disabled={disabled}>
          {trigger}
        </PopoverTrigger>
        <PopoverContent isOpen={isOpen}>{children}</PopoverContent>
      </div>
    );
  }

  return (
    <div ref={popoverRef} className={cn("relative inline-block text-left w-full", className)}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child as any, {
          isOpen,
          handleToggle,
        });
      })}
    </div>
  );
}

export function PopoverTrigger({
  children,
  className,
  isOpen,
  handleToggle,
  disabled,
  id,
  ...props
}: any) {
  return (
    <div
      id={id}
      onClick={() => !disabled && handleToggle?.(!isOpen)}
      className={cn("cursor-pointer", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function PopoverContent({
  children,
  className,
  isOpen,
  align = "left",
  ...props
}: any) {
  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "absolute z-50 mt-1.5 w-full rounded-2xl border border-[#1f2937] bg-[#111827] p-2 text-white shadow-2xl backdrop-blur-md animate-in fade-in-0 zoom-in-95",
        align === "right" ? "right-0" : "left-0",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
