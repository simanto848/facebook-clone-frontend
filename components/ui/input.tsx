"use client";

import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import { cva, type VariantProps } from "@/lib/cva";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex h-11 w-full rounded-xl border border-[#374151] bg-[#111827] px-3.5 text-xs text-white placeholder:text-slate-500 outline-none transition-all focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#0f172a]",
  {
    variants: {
      variant: {
        default: "border-[#374151] focus:border-blue-500",
        error: "border-red-500 focus:border-red-500",
        ghost: "border-transparent bg-transparent hover:bg-[#1f2937]/50 focus:bg-[#111827] focus:border-blue-500",
      },
      size: {
        sm: "h-9 px-3 text-xs",
        md: "h-11 px-3.5 text-xs",
        lg: "h-12 px-4 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> &
  VariantProps<typeof inputVariants> & {
    label?: ReactNode;
    helperText?: ReactNode;
    error?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    clearable?: boolean;
    containerClassName?: string;
  };

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      size,
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      clearable = false,
      containerClassName,
      id,
      type = "text",
      value,
      onChange,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const [showPassword, setShowPassword] = useState(false);

    const isPasswordType = type === "password";
    const actualType = isPasswordType ? (showPassword ? "text" : "password") : type;

    const hasValue = value !== undefined && value !== null && String(value).length > 0;
    const effectiveVariant = error ? "error" : variant;

    return (
      <div className={cn("flex w-full flex-col gap-1.5", containerClassName)}>
        {label && (
          <label htmlFor={inputId} className="flex items-center gap-1 text-xs font-semibold text-slate-300">
            <span>{label}</span>
            {required && <span className="text-red-400">*</span>}
          </label>
        )}

        <div className="relative flex items-center w-full">
          {leftIcon && (
            <span className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={actualType}
            value={value}
            onChange={onChange}
            disabled={disabled}
            required={required}
            className={cn(
              inputVariants({ variant: effectiveVariant, size }),
              Boolean(leftIcon) && "pl-10",
              Boolean(rightIcon || isPasswordType || clearable) && "pr-10",
              className
            )}
            {...props}
          />

          <div className="absolute right-3 flex items-center gap-1.5 text-slate-400">
            {clearable && hasValue && !disabled && (
              <button
                type="button"
                onClick={() => onChange?.({ target: { value: "" } } as any)}
                className="hover:text-white p-0.5 rounded transition"
              >
                <X size={14} />
              </button>
            )}

            {isPasswordType && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="hover:text-white p-0.5 rounded transition"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            )}

            {!isPasswordType && rightIcon}
          </div>
        </div>

        {error ? (
          <span className="text-xs text-red-400 font-medium">{error}</span>
        ) : helperText ? (
          <span className="text-xs text-slate-400">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
