import React from "react";
import { cn } from "../../lib/cn";

export interface NeuSegmentedOption<T extends string = string> {
  value: T;
  label: React.ReactNode;
  icon?: React.ReactNode;
}

export interface NeuSegmentedProps<T extends string = string> {
  options: NeuSegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: "sm" | "md";
}

export function NeuSegmented<T extends string = string>({
  options,
  value,
  onChange,
  className,
  size = "md",
}: NeuSegmentedProps<T>) {
  const sizeClasses = {
    sm: "p-1 gap-1 text-xs",
    md: "p-1.5 gap-1.5 text-sm",
  };

  const itemSizeClasses = {
    sm: "px-3 py-1.5 rounded-[8px]",
    md: "px-4 py-2 rounded-[10px]",
  };

  return (
    <div
      role="radiogroup"
      className={cn(
        "inline-flex items-center bg-[var(--bg)] shadow-[var(--neu-inset-sm)] rounded-[14px] border border-[var(--input-border)]/60 select-none",
        sizeClasses[size],
        className
      )}
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex items-center justify-center gap-2 font-medium cursor-pointer transition-all duration-150 outline-none select-none",
              itemSizeClasses[size],
              isSelected
                ? "bg-[var(--bg)] text-[var(--text)] shadow-[var(--neu-raised-sm)] font-bold"
                : "text-[var(--text-muted)] hover:text-[var(--text)]",
              "focus-visible:outline-[2px] focus-visible:outline-[var(--accent)] focus-visible:outline-offset-[2px]"
            )}
          >
            {option.icon && <span className="shrink-0">{option.icon}</span>}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
