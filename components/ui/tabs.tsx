"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  badge?: number | string;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: "line" | "pills" | "glass";
  className?: string;
}

export function Tabs({
  tabs = [],
  activeTab,
  onChange,
  variant = "line",
  className,
}: TabsProps) {
  if (variant === "pills") {
    return (
      <div className={cn("inline-flex items-center gap-1.5 rounded-xl border border-[#1f2937] bg-[#111827] p-1.5", className)}>
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              disabled={tab.disabled}
              onClick={() => onChange(tab.id)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all select-none",
                active
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "text-slate-400 hover:bg-[#1f2937] hover:text-white",
                tab.disabled && "opacity-40 cursor-not-allowed"
              )}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                    active ? "bg-white/20 text-white" : "bg-[#1f2937] text-slate-400"
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-6 border-b border-[#1f2937] overflow-x-auto custom-scrollbar select-none", className)}>
      {tabs.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            disabled={tab.disabled}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-2 py-3 px-1 border-b-2 text-xs font-bold transition-all relative shrink-0",
              active
                ? "border-blue-500 text-blue-400 font-extrabold"
                : "border-transparent text-slate-400 hover:text-slate-200",
              tab.disabled && "opacity-40 cursor-not-allowed"
            )}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full font-bold",
                  active ? "bg-blue-600/20 text-blue-400" : "bg-[#1f2937] text-slate-400"
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
