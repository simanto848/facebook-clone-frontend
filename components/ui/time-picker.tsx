"use client";

import { useId, useState, type ReactNode } from "react";
import { Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "@/lib/utils";

export interface TimePickerProps {
  label?: ReactNode;
  value?: string; // HH:MM AM/PM
  onChange?: (time: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  containerClassName?: string;
}

export function TimePicker({
  label,
  value = "",
  onChange,
  placeholder = "Select time",
  disabled = false,
  error,
  containerClassName,
}: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const inputId = useId();

  const [hour, setHour] = useState("12");
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState<"AM" | "PM">("AM");

  const hoursList = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const minutesList = ["00", "15", "30", "45"];

  const handleApply = (h: string, m: string, p: "AM" | "PM") => {
    setHour(h);
    setMinute(m);
    setPeriod(p);
    const formatted = `${h}:${m} ${p}`;
    onChange?.(formatted);
    setOpen(false);
  };

  return (
    <div className={cn("flex w-full flex-col gap-1.5", containerClassName)}>
      {label && <label htmlFor={inputId} className="text-xs font-semibold text-slate-300">{label}</label>}

      <Popover open={disabled ? false : open} onOpenChange={disabled ? () => {} : setOpen}>
        <PopoverTrigger
          id={inputId}
          disabled={disabled}
          className={cn(
            "flex h-11 w-full items-center justify-between rounded-xl border border-[#374151] bg-[#111827] px-3.5 text-xs text-white outline-none transition-all hover:bg-[#1f2937]/50 focus-within:border-blue-500",
            disabled && "cursor-not-allowed opacity-50 bg-[#0f172a]",
            error && "border-red-500"
          )}
        >
          <span className="flex items-center gap-2">
            <Clock size={14} className="text-slate-400" />
            <span className={cn(value ? "text-white font-medium" : "text-slate-500")}>
              {value || placeholder}
            </span>
          </span>
        </PopoverTrigger>

        <PopoverContent className="w-56 p-3 border border-[#374151] bg-[#111827] text-white shadow-2xl space-y-3">
          <div className="flex justify-between items-center gap-2">
            {/* Hours */}
            <div className="flex-1 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block text-center">Hour</span>
              <div className="max-h-36 overflow-y-auto space-y-1 border border-[#374151]/50 rounded-lg p-1 custom-scrollbar">
                {hoursList.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => handleApply(h, minute, period)}
                    className={cn(
                      "w-full py-1 text-center text-xs rounded hover:bg-[#1f2937] transition",
                      hour === h && "bg-blue-600 font-bold text-white"
                    )}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            {/* Minutes */}
            <div className="flex-1 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block text-center">Min</span>
              <div className="max-h-36 overflow-y-auto space-y-1 border border-[#374151]/50 rounded-lg p-1 custom-scrollbar">
                {minutesList.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleApply(hour, m, period)}
                    className={cn(
                      "w-full py-1 text-center text-xs rounded hover:bg-[#1f2937] transition",
                      minute === m && "bg-blue-600 font-bold text-white"
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* AM/PM */}
            <div className="flex flex-col gap-1 shrink-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 block text-center">Ampm</span>
              {(["AM", "PM"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleApply(hour, minute, p)}
                  className={cn(
                    "px-2 py-1 text-xs rounded-md border border-[#374151] font-bold transition",
                    period === p ? "bg-blue-600 text-white border-blue-600" : "bg-[#0f172a] text-slate-300 hover:bg-[#1f2937]"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {error && <span className="text-xs text-red-400 font-medium">{error}</span>}
    </div>
  );
}
