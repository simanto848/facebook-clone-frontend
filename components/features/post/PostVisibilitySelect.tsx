import React from "react";
import { Globe, Users, Lock, ChevronDown } from "lucide-react";

interface Props {
  value: "public" | "friends" | "private";
  onChange: (value: "public" | "friends" | "private") => void;
}

export default function PostVisibilitySelect({ value, onChange }: Props) {
  const [isOpen, setIsOpen] = React.useState(false);

  const options = [
    { id: "public", label: "Public", icon: Globe, description: "Anyone on or off platform" },
    { id: "friends", label: "Friends", icon: Users, description: "Your followers only" },
    { id: "private", label: "Only Me", icon: Lock, description: "Only you can see this" },
  ] as const;

  const currentOption = options.find((opt) => opt.id === value) || options[0];
  const Icon = currentOption.icon;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-full border border-[#1f2937] bg-[#1f2937]/50 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-[#1f2937] hover:text-white"
      >
        <Icon size={12} />
        <span>{currentOption.label}</span>
        <ChevronDown size={12} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 mt-1.5 w-60 z-50 rounded-xl border border-[#1f2937] bg-[#111827] p-1.5 shadow-xl">
            {options.map((opt) => {
              const OptIcon = opt.icon;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-start gap-3 rounded-lg p-2.5 text-left transition hover:bg-[#1f2937] ${
                    value === opt.id ? "bg-[#1f2937]/50" : ""
                  }`}
                >
                  <OptIcon size={16} className="mt-0.5 text-slate-300" />
                  <div>
                    <p className="text-xs font-semibold text-white">{opt.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{opt.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
