import React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "../../lib/cn";

export interface NeuSwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  label?: string;
  helperText?: string;
}

export const NeuSwitch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  NeuSwitchProps
>(({ className, label, helperText, id, checked, ...props }, ref) => {
  const generatedId = React.useId();
  const switchId = id || generatedId;

  return (
    <div className="inline-flex items-center gap-3 select-none">
      <SwitchPrimitive.Root
        ref={ref}
        id={switchId}
        checked={checked}
        className={cn(
          "peer inline-flex h-7 w-13 shrink-0 cursor-pointer items-center rounded-full border border-[var(--input-border)] transition-colors duration-200",
          "bg-[var(--bg)] shadow-[var(--neu-inset-sm)]",
          "focus-visible:outline-[2px] focus-visible:outline-[var(--accent)] focus-visible:outline-offset-[3px]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        <SwitchPrimitive.Thumb
          className={cn(
            "pointer-events-none block h-5 w-5 rounded-full transition-transform duration-200",
            "bg-[var(--bg)] shadow-[var(--neu-raised-sm)]",
            "data-[state=checked]:translate-x-6.5 data-[state=checked]:bg-[var(--accent)]",
            "data-[state=unchecked]:translate-x-1"
          )}
        />
      </SwitchPrimitive.Root>
      {label && (
        <label htmlFor={switchId} className="cursor-pointer text-xs font-semibold text-[var(--text)]">
          <div>{label}</div>
          {helperText && <div className="text-[11px] font-normal text-[var(--text-muted)] mt-0.5">{helperText}</div>}
        </label>
      )}
    </div>
  );
});
NeuSwitch.displayName = SwitchPrimitive.Root.displayName;
