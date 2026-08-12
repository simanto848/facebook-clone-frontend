"use client";

import { useId, useState, type ReactNode } from "react";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "@/lib/utils";

export interface DatePickerProps {
  label?: ReactNode;
  value?: string; // YYYY-MM-DD
  onChange?: (date: string) => void;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  error?: string;
  containerClassName?: string;
}

export function DatePicker({
  label,
  value = "",
  onChange,
  placeholder = "Select date",
  disabled = false,
  clearable = true,
  error,
  containerClassName,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const inputId = useId();

  const selectedDate = value ? new Date(value) : null;
  const [currentMonth, setCurrentMonth] = useState<Date>(selectedDate || new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handleSelectDay = (day: number) => {
    const formattedMonth = String(month + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");
    const isoString = `${year}-${formattedMonth}-${formattedDay}`;
    onChange?.(isoString);
    setOpen(false);
  };

  const handleMonthChange = (delta: number) => {
    setCurrentMonth(new Date(year, month + delta, 1));
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.("");
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
            <Calendar size={14} className="text-slate-400" />
            <span className={cn(value ? "text-white font-medium" : "text-slate-500")}>
              {value || placeholder}
            </span>
          </span>

          <div className="flex items-center gap-1">
            {clearable && value && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 rounded text-slate-400 hover:bg-[#374151] hover:text-white transition"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </PopoverTrigger>

        <PopoverContent className="w-64 p-3 border border-[#374151] bg-[#111827] text-white shadow-2xl">
          {/* Month Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#374151]/50">
            <button
              type="button"
              onClick={() => handleMonthChange(-1)}
              className="p-1 rounded hover:bg-[#1f2937] text-slate-300 hover:text-white"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-bold text-white">
              {monthNames[month]} {year}
            </span>
            <button
              type="button"
              onClick={() => handleMonthChange(1)}
              className="p-1 rounded hover:bg-[#1f2937] text-slate-300 hover:text-white"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-400 mb-1">
            <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const formattedMonth = String(month + 1).padStart(2, "0");
              const formattedDay = String(day).padStart(2, "0");
              const dayStr = `${year}-${formattedMonth}-${formattedDay}`;
              const isSelected = value === dayStr;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={cn(
                    "h-7 w-7 rounded-lg font-medium transition-colors hover:bg-blue-600/30 hover:text-blue-300 flex items-center justify-center mx-auto",
                    isSelected ? "bg-blue-600 text-white font-bold" : "text-slate-200"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      {error && <span className="text-xs text-red-400 font-medium">{error}</span>}
    </div>
  );
}
