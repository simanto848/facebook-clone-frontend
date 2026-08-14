"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  badge?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  icon,
  badge,
  actions,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border border-[#1f2937] bg-linear-to-r from-[#111827] via-[#1f2937]/40 to-[#111827] p-6 shadow-xl space-y-4 mb-6 backdrop-blur-md overflow-hidden",
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="h-12 w-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 shadow-lg shadow-blue-600/5">
              {icon}
            </div>
          )}

          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-none">{title}</h1>
              {badge}
            </div>
            {description && <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">{description}</p>}
          </div>
        </div>

        {actions && <div className="flex items-center gap-2.5">{actions}</div>}
      </div>

      {children && <div className="pt-2 border-t border-[#1f2937]/60">{children}</div>}
    </div>
  );
}
