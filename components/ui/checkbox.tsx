"use client";

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { Check } from "lucide-react";
import { cva, type VariantProps } from "@/lib/cva";
import { cn } from "@/lib/utils";

const checkboxVariants = cva(
  "peer h-5 w-5 shrink-0 rounded-md border border-[#374151] bg-[#111827] ring-offset-[#0f172a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 disabled:cursor-not-allowed disabled:opacity-50 transition-colors cursor-pointer flex items-center justify-center text-white",
  {
    variants: {
      variant: {
        default: "checked:bg-blue-600 checked:border-blue-600",
        danger: "checked:bg-red-600 checked:border-red-600",
      },
      size: {
        sm: "h-4 w-4 rounded-sm",
        md: "h-5 w-5 rounded-md",
        lg: "h-6 w-6 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> &
  VariantProps<typeof checkboxVariants> & {
    label?: ReactNode;
    description?: ReactNode;
    error?: string;
    containerClassName?: string;
  };

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      variant,
      size = "md",
      label,
      description,
      error,
      containerClassName,
      id,
      checked,
      onChange,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className={cn("flex flex-col gap-1", containerClassName)}>
        <label htmlFor={inputId} className="inline-flex items-start gap-3 cursor-pointer select-none">
          <div className="relative flex items-center justify-center mt-0.5">
            <input
              ref={ref}
              type="checkbox"
              id={inputId}
              checked={checked}
              onChange={onChange}
              disabled={disabled}
              className="sr-only peer"
              {...props}
            />
            <div
              className={cn(
                checkboxVariants({ variant, size }),
                checked && "bg-blue-600 border-blue-600 text-white",
                error && "border-red-500",
                className
              )}
            >
              {checked && <Check size={size === "sm" ? 12 : size === "lg" ? 16 : 14} className="stroke-[3]" />}
            </div>
          </div>

          {(label || description) && (
            <div className="flex flex-col">
              {label && (
                <span className={cn("text-sm font-medium text-slate-200", disabled && "opacity-50")}>
                  {label}
                </span>
              )}
              {description && (
                <span className={cn("text-xs text-slate-400 leading-normal", disabled && "opacity-50")}>
                  {description}
                </span>
              )}
            </div>
          )}
        </label>

        {error && <span className="text-xs text-red-400 font-medium">{error}</span>}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
