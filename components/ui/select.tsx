"use client";

import { forwardRef, useId, type SelectHTMLAttributes, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: ReactNode;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  containerClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      options = [],
      placeholder,
      containerClassName,
      id,
      disabled,
      required,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const selectId = id || generatedId;

    return (
      <div className={cn("flex w-full flex-col gap-1.5", containerClassName)}>
        {label && (
          <label htmlFor={selectId} className="flex items-center gap-1 text-xs font-semibold text-slate-300">
            <span>{label}</span>
            {required && <span className="text-red-400">*</span>}
          </label>
        )}

        <div className="relative flex items-center w-full">
          <select
            ref={ref}
            id={selectId}
            value={value}
            onChange={onChange}
            disabled={disabled}
            required={required}
            className={cn(
              "flex h-11 w-full appearance-none rounded-xl border border-[#374151] bg-[#111827] px-3.5 pr-10 text-xs text-white outline-none transition-all focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#0f172a]",
              error && "border-red-500 focus:border-red-500",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled className="text-slate-500 bg-[#111827]">
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled} className="bg-[#111827] text-white py-1">
                {opt.label}
              </option>
            ))}
          </select>

          <span className="pointer-events-none absolute right-3 text-slate-400">
            <ChevronDown size={14} />
          </span>
        </div>

        {error && <span className="text-xs text-red-400 font-medium">{error}</span>}
      </div>
    );
  }
);

Select.displayName = "Select";
