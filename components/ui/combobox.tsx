"use client";

import { useId, useMemo, useState, type MouseEvent, type ReactNode } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import Image from "next/image";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "@/lib/utils";

export type ComboboxOption = {
  value: string;
  label: string;
  avatarSrc?: string | null;
};

export type ComboboxProps = {
  label?: ReactNode;
  placeholder?: string;
  searchPlaceholder?: string;
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  containerClassName?: string;
  disabled?: boolean;
  required?: boolean;
  /** Render circular avatars from `avatarSrc` in the trigger and menu. */
  showAvatar?: boolean;
  /** When false, hides the search field (default true). */
  searchable?: boolean;
  /** Shows a clear control when a value is selected. */
  clearable?: boolean;
  error?: string;
};

export function Combobox({
  label,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  options = [],
  value = "",
  onChange,
  containerClassName,
  disabled = false,
  required = false,
  showAvatar = false,
  searchable = true,
  clearable = false,
  error,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputId = useId();

  const selected = options.find((option) => option.value === value);
  const hasValue = Boolean(selected) || Boolean(value.trim());
  const displayValue = selected?.label ?? (value.trim() ? value : placeholder);
  const isPlaceholder = !hasValue;
  const showAvatarInTrigger = showAvatar && Boolean(selected);
  const canClear = clearable && hasValue && !disabled;

  const filtered = useMemo(() => {
    if (!searchable) return options;
    const needle = query.trim().toLowerCase();
    if (!needle) return options;
    return options.filter((option) => option.label.toLowerCase().includes(needle));
  }, [options, query, searchable]);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setQuery("");
  }

  function closeMenu() {
    handleOpenChange(false);
  }

  function handleClear(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    onChange("");
    closeMenu();
  }

  return (
    <div className={cn("flex w-full flex-col gap-1.5", containerClassName)}>
      {label ? (
        <label
          htmlFor={inputId}
          className="flex items-center gap-1 text-xs font-semibold text-slate-300"
        >
          <span>{label}</span>
          {required ? <span className="text-red-400" aria-hidden="true">*</span> : null}
        </label>
      ) : null}

      <Popover
        open={disabled ? false : open}
        onOpenChange={disabled ? () => {} : handleOpenChange}
        onEscape={() => setQuery("")}
        className="relative w-full"
      >
        <PopoverTrigger
          id={inputId}
          disabled={disabled}
          className={cn(
            "flex h-11 w-full items-center justify-between rounded-xl border border-[#374151] bg-[#111827] px-3.5 text-xs text-white outline-none transition-all focus-within:border-blue-500 hover:bg-[#1f2937]/50",
            disabled && "cursor-not-allowed opacity-50 bg-[#0f172a]",
            error && "border-red-500"
          )}
        >
          <span className="flex min-w-0 flex-1 items-center gap-2">
            {showAvatarInTrigger && selected?.avatarSrc ? (
              <div className="relative h-6 w-6 rounded-full overflow-hidden shrink-0 border border-[#374151]">
                <Image src={selected.avatarSrc} fill sizes="24px" className="object-cover" alt="" />
              </div>
            ) : null}
            <span className={cn("truncate font-medium", isPlaceholder ? "text-slate-500" : "text-white")}>
              {displayValue}
            </span>
          </span>

          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {canClear ? (
              <button
                type="button"
                aria-label="Clear selection"
                onClick={handleClear}
                className="inline-flex h-5 w-5 items-center justify-center rounded-md text-slate-400 hover:bg-[#374151] hover:text-white transition"
              >
                <X size={12} />
              </button>
            ) : null}
            <ChevronDown size={14} className="text-slate-400 shrink-0" />
          </div>
        </PopoverTrigger>

        <PopoverContent className="overflow-hidden rounded-xl border border-[#374151] bg-[#111827] p-1.5 shadow-2xl">
          {searchable ? (
            <div className="border-b border-[#374151]/50 p-1.5 mb-1">
              <div className="relative flex items-center">
                <Search size={14} className="absolute left-2.5 text-slate-400" />
                <input
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={searchPlaceholder}
                  className="h-9 w-full rounded-lg border border-[#374151] bg-[#0f172a] pl-8 pr-3 text-xs text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
                />
              </div>
            </div>
          ) : null}
          <ul role="listbox" className="max-h-56 overflow-y-auto space-y-0.5 custom-scrollbar">
            {filtered.length === 0 ? (
              <li className="px-3 py-2.5 text-xs text-slate-400 text-center">No results found</li>
            ) : (
              filtered.map((option) => {
                const isSelected = option.value === value;
                return (
                  <li key={option.value} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(option.value);
                        closeMenu();
                      }}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-200 transition-colors hover:bg-[#1f2937] hover:text-white",
                        isSelected && "bg-blue-600/20 text-blue-400 font-semibold"
                      )}
                    >
                      {showAvatar && option.avatarSrc ? (
                        <div className="relative h-5 w-5 rounded-full overflow-hidden shrink-0 border border-[#374151]">
                          <Image src={option.avatarSrc} fill sizes="20px" className="object-cover" alt="" />
                        </div>
                      ) : null}
                      <span className="truncate flex-1">{option.label}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </PopoverContent>
      </Popover>

      {error && <span className="text-xs text-red-400 font-medium">{error}</span>}
    </div>
  );
}
