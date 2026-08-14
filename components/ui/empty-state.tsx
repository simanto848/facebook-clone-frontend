"use client";

import { type ReactNode } from "react";
import { FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon = <FolderOpen size={40} className="text-slate-500" />,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-dashed border-[#1f2937] bg-[#111827]/40 text-slate-400 space-y-3 my-4 select-none",
        className
      )}
    >
      <div className="h-16 w-16 rounded-full bg-[#1f2937]/50 flex items-center justify-center shrink-0 border border-[#374151]/30">
        {icon}
      </div>

      <div className="space-y-1 max-w-sm">
        <h4 className="font-bold text-white text-base">{title}</h4>
        {description && <p className="text-xs text-slate-400 leading-relaxed">{description}</p>}
      </div>

      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
