import React, { useId } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, AlertCircle } from "lucide-react";
import { cn } from "../../lib/cn";

export interface NeuSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface NeuSelectProps {
  label?: string;
  helperText?: string;
  error?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  options: NeuSelectOption[];
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const NeuSelect: React.FC<NeuSelectProps> = ({
  label,
  helperText,
  error,
  placeholder = "Select an option...",
  value,
  defaultValue,
  onValueChange,
  options,
  disabled = false,
  className,
  id,
}) => {
  const generatedId = useId();
  const selectId = id || generatedId;
  const helperId = `${selectId}-helper`;
  const errorId = `${selectId}-error`;

  const describedBy = [
    helperText ? helperId : null,
    error ? errorId : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={selectId} className="text-xs font-semibold text-[var(--text)] select-none">
          {label}
        </label>
      )}
      <SelectPrimitive.Root
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectPrimitive.Trigger
          id={selectId}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy || undefined}
          className={cn(
            "neu-field flex items-center justify-between w-full h-11 px-4 text-sm font-sans cursor-pointer transition-all duration-150 select-none",
            "focus-visible:outline-[2px] focus-visible:outline-[var(--accent)] focus-visible:outline-offset-[2px]",
            error && "!border-[var(--danger)]",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
        >
          <SelectPrimitive.Value placeholder={<span className="text-[var(--text-muted)]">{placeholder}</span>} />
          <SelectPrimitive.Icon asChild>
            <ChevronDown className="w-4 h-4 text-[var(--text-muted)] shrink-0 transition-transform duration-150" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={6}
            className={cn(
              "z-50 min-w-[var(--radix-select-trigger-width)] max-h-80 overflow-y-auto p-1.5",
              "bg-[var(--bg)] shadow-[var(--neu-raised)] border border-[var(--input-border)] rounded-[14px]",
              "animate-in fade-in-80 zoom-in-95 duration-100"
            )}
          >
            <SelectPrimitive.Viewport>
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-[10px] cursor-pointer outline-none select-none text-[var(--text)]",
                    "hover:bg-[var(--bg)] hover:shadow-[var(--neu-inset-sm)]",
                    "focus:bg-[var(--bg)] focus:shadow-[var(--neu-inset-sm)]",
                    "data-[state=checked]:text-[var(--accent)] data-[state=checked]:font-semibold",
                    option.disabled && "opacity-40 cursor-not-allowed"
                  )}
                >
                  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator>
                    <Check className="w-4 h-4 text-[var(--accent)] shrink-0" />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>

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
};
