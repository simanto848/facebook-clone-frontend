import React from "react";
import { ChevronDown } from "lucide-react";

interface SelectOption {
  label: string;
  value: string;
}

interface SettingSelectProps {
  label: string;
  options: SelectOption[];
  defaultValue?: string;
  description?: string;
}

const SettingSelect = ({
  label,
  options,
  defaultValue,
  description,
}: SettingSelectProps) => {
  return (
    <div className="space-y-2">
      <div>
        <label className="block text-sm font-medium text-slate-200">
          {label}
        </label>

        <p className="mt-1 min-h-5 text-xs text-slate-400">
          {description || ""}
        </p>
      </div>

      <div className="relative">
        <select
          defaultValue={defaultValue}
          className="
            h-12
            w-full
            appearance-none
            rounded-xl
            border
            border-[#1f2937]
            bg-[#0f172a]
            px-4
            pr-10
            text-white
            outline-none
            transition-all
            hover:border-[#374151]
            focus:border-[#7aa2ff]
            focus:ring-2
            focus:ring-[#7aa2ff]/20
          "
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-[#111827]"
            >
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown
          size={18}
          className="
            pointer-events-none
            absolute
            right-3
            top-1/2
            -translate-y-1/2
            text-slate-400
          "
        />
      </div>
    </div>
  );
};

export default SettingSelect;
