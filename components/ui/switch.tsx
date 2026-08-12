"use client";

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cva, type VariantProps } from "@/lib/cva";
import { cn } from "@/lib/utils";

const switchVariants = cva(
  "relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        sm: "h-5 w-9",
        md: "h-6 w-11",
        lg: "h-7 w-14",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

const thumbVariants = cva(
  "pointer-events-none inline-block rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
  {
    variants: {
      size: {
        sm: "h-4 w-4 translate-x-0 peer-checked:translate-x-4",
        md: "h-5 w-5 translate-x-0 peer-checked:translate-x-5",
        lg: "h-6 w-6 translate-x-0 peer-checked:translate-x-7",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> &
  VariantProps<typeof switchVariants> & {
    label?: ReactNode;
    description?: ReactNode;
    containerClassName?: string;
  };

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      className,
      size = "md",
      label,
      description,
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
      <div className={cn("flex items-center justify-between gap-3 select-none", containerClassName)}>
        {(label || description) && (
          <label htmlFor={inputId} className="flex flex-col cursor-pointer">
            {label && (
              <span className={cn("text-xs font-semibold text-slate-200", disabled && "opacity-50")}>
                {label}
              </span>
            )}
            {description && (
              <span className={cn("text-[11px] text-slate-400 leading-normal", disabled && "opacity-50")}>
                {description}
              </span>
            )}
          </label>
        )}

        <label htmlFor={inputId} className="relative inline-flex items-center cursor-pointer">
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
              switchVariants({ size }),
              "bg-[#1f2937] peer-checked:bg-blue-600 border-[#374151]",
              className
            )}
          >
            <span className={cn(thumbVariants({ size }))} />
          </div>
        </label>
      </div>
    );
  }
);

Switch.displayName = "Switch";
