import React from "react";

export interface SortToggleOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  title?: string;
}

export interface SortToggleGroupProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: SortToggleOption<T>[];
  className?: string;
}

export function SortToggleGroup<T extends string = string>({
  value,
  onChange,
  options,
  className = "",
}: SortToggleGroupProps<T>) {
  return (
    <div
      className={`flex items-center gap-1 bg-[#111827] border border-[#1f2937] rounded-xl p-1 text-xs ${className}`}
    >
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
              isActive
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
            title={opt.title}
          >
            {opt.icon}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default SortToggleGroup;
