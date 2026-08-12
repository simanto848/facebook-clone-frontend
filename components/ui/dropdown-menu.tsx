"use client";

import React, { type ReactNode } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "@/lib/utils";

export interface DropdownMenuItem {
  label: ReactNode;
  icon?: ReactNode;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
  divider?: boolean;
}

export interface DropdownMenuProps {
  trigger: ReactNode;
  items: DropdownMenuItem[];
  align?: "left" | "right";
  className?: string;
}

export function DropdownMenu({ trigger, items, align = "right", className }: DropdownMenuProps) {
  return (
    <Popover className={className}>
      <PopoverTrigger>{trigger}</PopoverTrigger>

      <PopoverContent align={align} className="w-48 p-1.5 space-y-0.5">
        {items.map((item, idx) => {
          if (item.divider) {
            return <div key={idx} className="my-1 border-t border-[#374151]/50" />;
          }

          return (
            <button
              key={idx}
              disabled={item.disabled}
              onClick={item.onClick}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors select-none",
                item.danger
                  ? "text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  : "text-slate-200 hover:bg-[#1f2937] hover:text-white",
                item.disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {item.icon && <span className="shrink-0">{item.icon}</span>}
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
