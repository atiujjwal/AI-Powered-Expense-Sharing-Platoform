"use client";
import React from "react";
import { cn } from "../../lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-mono-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-mono-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full h-10 px-3 rounded-lg border bg-white text-mono-900 placeholder:text-mono-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0",
              error
                ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                : "border-mono-300 focus:border-mono-500 focus:ring-mono-200",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-mono-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="mt-1.5 text-sm text-red-500">{error}</p>
        ) : (
          hint && <p className="mt-1.5 text-sm text-mono-500">{hint}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
export default Input;
