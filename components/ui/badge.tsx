"use client";

import { type ReactNode } from "react";
import { cva, type VariantProps } from "@/lib/cva";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 border select-none transition-colors",
  {
    variants: {
      variant: {
        primary: "border-blue-500/30 bg-blue-600/20 text-blue-400",
        secondary: "border-[#374151] bg-[#1f2937] text-slate-300",
        success: "border-green-500/30 bg-green-600/20 text-green-400",
        danger: "border-red-500/30 bg-red-600/20 text-red-400",
        warning: "border-yellow-500/30 bg-yellow-600/20 text-yellow-400",
        outline: "border-[#374151] bg-transparent text-slate-400",
        glass: "border-white/10 bg-white/5 backdrop-blur-md text-white",
      },
      size: {
        sm: "text-[9px] px-2 py-0.5",
        md: "text-[10px] px-2.5 py-0.5",
        lg: "text-xs px-3 py-1",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export type BadgeProps = VariantProps<typeof badgeVariants> & {
  children: ReactNode;
  icon?: ReactNode;
  pulse?: boolean;
  className?: string;
};

export function Badge({ children, icon, variant = "primary", size = "md", pulse = false, className }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)}>
      {pulse && (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
        </span>
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
