import React, { forwardRef, useId } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "../../lib/cn";

export interface NeuInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const NeuInput = forwardRef<HTMLInputElement, NeuInputProps>(
  ({ className, label, helperText, error, icon, id, disabled, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;

    const describedBy = [
      helperText ? helperId : null,
      error ? errorId : null,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-[var(--text)] select-none">
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {icon && (
            <div className="absolute left-3.5 pointer-events-none text-[var(--text-muted)] shrink-0">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy || undefined}
            className={cn(
              "neu-field w-full h-11 px-4 text-sm font-sans transition-all duration-150",
              "focus-visible:outline-[2px] focus-visible:outline-[var(--accent)] focus-visible:outline-offset-[2px]",
              icon && "pl-10",
              error && "!border-[var(--danger)] !shadow-[inset_2px_2px_4px_var(--shadow-dark),_inset_-2px_-2px_4px_var(--shadow-light)]",
              disabled && "opacity-50 cursor-not-allowed",
              className
            )}
            {...props}
          />
        </div>
        {error ? (
          <p id={errorId} className="flex items-center gap-1.5 text-xs text-[var(--danger)] font-medium mt-0.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-[var(--text-muted)] mt-0.5">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

NeuInput.displayName = "NeuInput";
