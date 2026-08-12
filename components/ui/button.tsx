"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2, ChevronDown } from "lucide-react";
import { cva, type VariantProps } from "@/lib/cva";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 disabled:cursor-not-allowed disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        primary: "bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700 shadow-md shadow-blue-600/20",
        secondary: "bg-[#1f2937] text-white hover:bg-[#374151] active:bg-[#111827] border border-[#374151]/50",
        outline: "border border-[#374151] bg-transparent text-slate-200 hover:bg-[#1f2937] hover:text-white",
        ghost: "bg-transparent text-slate-300 hover:bg-[#1f2937] hover:text-white",
        danger: "bg-red-600 text-white hover:bg-red-500 active:bg-red-700 shadow-md shadow-red-600/20",
        link: "h-auto rounded-none bg-transparent p-0 font-semibold text-blue-400 hover:text-blue-300 underline-offset-4 hover:underline",
        filter: "h-10 rounded-xl border border-[#374151] bg-[#111827] px-3.5 text-xs text-slate-200 hover:bg-[#1f2937]",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base font-semibold",
        filter: "h-10 px-3.5 text-xs",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
      active: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "filter",
        active: true,
        class: "border-blue-500 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20",
      },
    ],
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
      active: false,
    },
  }
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  Omit<VariantProps<typeof buttonVariants>, "active"> & {
    loading?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    /** Highlights filter-style triggers when open or a value is selected. */
    active?: boolean;
  };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      active = false,
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    const resolvedSize = variant === "filter" ? "filter" : size;
    const resolvedRightIcon =
      rightIcon !== undefined ? (
        rightIcon
      ) : variant === "filter" && !loading ? (
        <ChevronDown size={14} className="shrink-0 opacity-70" aria-hidden />
      ) : undefined;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={cn(
          buttonVariants({ variant, size: resolvedSize, fullWidth, active }),
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin shrink-0" />
        ) : (
          leftIcon
        )}
        {children}
        {resolvedRightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";

export { buttonVariants };
