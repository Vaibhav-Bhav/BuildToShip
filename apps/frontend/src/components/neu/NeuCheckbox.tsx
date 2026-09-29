import React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "../../lib/cn";

export interface NeuCheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  label?: React.ReactNode;
  description?: React.ReactNode;
}

export const NeuCheckbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  NeuCheckboxProps
>(({ className, label, description, id, checked, ...props }, ref) => {
  const generatedId = React.useId();
  const checkboxId = id || generatedId;

  return (
    <div className="flex items-start gap-3 select-none">
      <CheckboxPrimitive.Root
        ref={ref}
        id={checkboxId}
        checked={checked}
        className={cn(
          "peer h-5 w-5 shrink-0 rounded-[6px] border border-[var(--input-border)] transition-all duration-150 cursor-pointer",
          "bg-[var(--bg)] shadow-[var(--neu-inset-sm)]",
          "focus-visible:outline-[2px] focus-visible:outline-[var(--accent)] focus-visible:outline-offset-[2px]",
          "data-[state=checked]:bg-[var(--accent)] data-[state=checked]:border-[var(--accent)] data-[state=checked]:shadow-[var(--neu-raised-sm)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center text-[var(--accent-contrast)]">
          <Check className="h-3.5 w-3.5 stroke-[3]" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {(label || description) && (
        <div className="flex flex-col text-sm leading-none pt-0.5">
          {label && (
            <label
              htmlFor={checkboxId}
              className="text-xs font-semibold text-[var(--text)] cursor-pointer"
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-[var(--text-muted)] mt-1 leading-normal">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
});
NeuCheckbox.displayName = CheckboxPrimitive.Root.displayName;
