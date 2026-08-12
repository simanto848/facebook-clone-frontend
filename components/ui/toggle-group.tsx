"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ToggleGroupOption {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface ToggleGroupProps {
  options: ToggleGroupOption[];
  value: string | string[];
  onChange: (value: any) => void;
  type?: "single" | "multiple";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ToggleGroup({
  options = [],
  value,
  onChange,
  type = "single",
  size = "md",
  className,
}: ToggleGroupProps) {
  const isSelected = (val: string) => {
    if (type === "single") return value === val;
    return Array.isArray(value) && value.includes(val);
  };

  const handleSelect = (val: string) => {
    if (type === "single") {
      onChange(val);
    } else {
      const arr = Array.isArray(value) ? [...value] : [];
      if (arr.includes(val)) {
        onChange(arr.filter((v) => v !== val));
      } else {
        onChange([...arr, val]);
      }
    }
  };

  const sizeClasses = {
    sm: "h-8 px-2.5 text-xs gap-1.5",
    md: "h-10 px-3.5 text-xs gap-2",
    lg: "h-12 px-4 text-sm gap-2.5",
  };

  return (
    <div className={cn("inline-flex items-center rounded-xl border border-[#374151] bg-[#111827] p-1 gap-1", className)}>
      {options.map((opt) => {
        const active = isSelected(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            disabled={opt.disabled}
            onClick={() => handleSelect(opt.value)}
            className={cn(
              "inline-flex items-center justify-center rounded-lg font-medium transition-all select-none",
              sizeClasses[size],
              active
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 font-bold"
                : "text-slate-400 hover:bg-[#1f2937] hover:text-white",
              opt.disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {opt.icon && <span className="shrink-0">{opt.icon}</span>}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
