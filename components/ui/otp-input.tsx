"use client";

import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface OTPInputProps {
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export function OTPInput({
  length = 6,
  value: controlledValue,
  onChange,
  onComplete,
  disabled = false,
  error,
  className,
}: OTPInputProps) {
  const [internalValue, setInternalValue] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const isControlled = controlledValue !== undefined;
  const digits = isControlled
    ? controlledValue.split("").concat(Array(length).fill("")).slice(0, length)
    : internalValue;

  const updateValue = (newDigits: string[]) => {
    const combined = newDigits.join("");
    if (!isControlled) setInternalValue(newDigits);
    onChange?.(combined);
    if (combined.length === length && !newDigits.includes("")) {
      onComplete?.(combined);
    }
  };

  const handleChange = (index: number, val: string) => {
    if (disabled) return;
    const digit = val.replace(/[^0-9a-zA-Z]/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    updateValue(newDigits);

    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim().slice(0, length);
    if (!pasted) return;

    const newDigits = pasted.split("").concat(Array(length).fill("")).slice(0, length);
    updateValue(newDigits);
    const focusIdx = Math.min(pasted.length, length - 1);
    inputRefs.current[focusIdx]?.focus();
  };

  return (
    <div className="flex flex-col gap-2">
      <div className={cn("flex items-center gap-2.5 justify-center", className)}>
        {Array.from({ length }).map((_, idx) => (
          <input
            key={idx}
            ref={(el) => (inputRefs.current[idx] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digits[idx] || ""}
            disabled={disabled}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={handlePaste}
            className={cn(
              "h-12 w-12 rounded-xl border border-[#374151] bg-[#111827] text-center text-lg font-bold text-white outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50",
              error && "border-red-500 text-red-400 focus:border-red-500"
            )}
          />
        ))}
      </div>
      {error && <span className="text-center text-xs font-medium text-red-400">{error}</span>}
    </div>
  );
}
