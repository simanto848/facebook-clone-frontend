"use client";

import React, { useMemo } from "react";
import { Input, type InputProps } from "./input";
import { cn } from "@/lib/utils";

export interface PasswordStrengthProps extends Omit<InputProps, "type"> {
  value: string;
}

export function PasswordStrength({ value, className, ...props }: PasswordStrengthProps) {
  const strength = useMemo(() => {
    if (!value) return { score: 0, label: "Enter password", color: "bg-slate-700" };
    let score = 0;
    if (value.length >= 8) score += 1;
    if (/[A-Z]/.test(value)) score += 1;
    if (/[0-9]/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: "Weak", color: "bg-red-500" };
      case 2:
        return { score: 2, label: "Fair", color: "bg-yellow-500" };
      case 3:
        return { score: 3, label: "Good", color: "bg-blue-500" };
      case 4:
        return { score: 4, label: "Strong", color: "bg-green-500" };
      default:
        return { score: 1, label: "Too short", color: "bg-red-500" };
    }
  }, [value]);

  return (
    <div className="flex flex-col gap-2 w-full">
      <Input type="password" value={value} className={className} {...props} />

      {value ? (
        <div className="space-y-1.5 px-0.5">
          <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  step <= strength.score ? strength.color : "bg-[#1f2937]"
                )}
              />
            ))}
          </div>
          <p className="text-[11px] font-semibold text-slate-400">
            Strength: <span className="text-white">{strength.label}</span>
          </p>
        </div>
      ) : null}
    </div>
  );
}
