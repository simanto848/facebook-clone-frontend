"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { cva, type VariantProps } from "@/lib/cva";
import { cn } from "@/lib/utils";

const loaderVariants = cva("animate-spin shrink-0 text-blue-500", {
  variants: {
    size: {
      sm: "h-4 w-4",
      md: "h-6 w-6",
      lg: "h-10 w-10",
      xl: "h-16 w-16",
    },
    variant: {
      spinner: "border-0",
      dots: "animate-pulse",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "spinner",
  },
});

export type LoaderProps = VariantProps<typeof loaderVariants> & {
  className?: string;
  label?: string;
  fullScreen?: boolean;
};

export function Loader({ size = "md", variant = "spinner", className, label, fullScreen = false }: LoaderProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className={cn(loaderVariants({ size, variant }), className)} />
      {label && <p className="text-xs font-semibold text-slate-400 animate-pulse">{label}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
}
