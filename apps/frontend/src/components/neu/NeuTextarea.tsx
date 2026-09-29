import React, { forwardRef, useId } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "../../lib/cn";

export interface NeuTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  maxLength?: number;
  showCount?: boolean;
}

export const NeuTextarea = forwardRef<HTMLTextAreaElement, NeuTextareaProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      maxLength,
      showCount = false,
      value,
      defaultValue,
      onChange,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const textareaId = id || generatedId;
    const helperId = `${textareaId}-helper`;
    const errorId = `${textareaId}-error`;

    const [currentLength, setCurrentLength] = React.useState<number>(() => {
      if (typeof value === "string") return value.length;
      if (typeof defaultValue === "string") return defaultValue.length;
      return 0;
    });

    React.useEffect(() => {
      if (typeof value === "string") {
        setCurrentLength(value.length);
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCurrentLength(e.target.value.length);
      onChange?.(e);
    };

    const describedBy = [
      helperText ? helperId : null,
      error ? errorId : null,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className="flex flex-col gap-1.5 w-full">
        <div className="flex items-center justify-between">
          {label && (
            <label htmlFor={textareaId} className="text-xs font-semibold text-[var(--text)] select-none">
              {label}
            </label>
          )}
          {showCount && maxLength && (
            <span
              className={cn(
                "text-[11px] font-mono",
                currentLength >= maxLength ? "text-[var(--danger)] font-bold" : "text-[var(--text-muted)]"
              )}
            >
              {currentLength} / {maxLength}
            </span>
          )}
        </div>
        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy || undefined}
          className={cn(
            "neu-field w-full p-3.5 text-sm font-sans resize-y min-h-[100px] transition-all duration-150",
            "focus-visible:outline-[2px] focus-visible:outline-[var(--accent)] focus-visible:outline-offset-[2px]",
            error && "!border-[var(--danger)]",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
          {...props}
        />
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

NeuTextarea.displayName = "NeuTextarea";
