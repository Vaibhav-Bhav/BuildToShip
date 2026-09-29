import React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "../../lib/cn";

export interface NeuProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value?: number;
  max?: number;
  tone?: "accent" | "success" | "warning" | "danger" | "info";
}

export const NeuProgress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  NeuProgressProps
>(({ className, value = 0, max = 100, tone = "accent", ...props }, ref) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const toneClasses = {
    accent: "bg-[var(--accent)]",
    success: "bg-[var(--success)]",
    warning: "bg-[var(--warning)]",
    danger: "bg-[var(--danger)]",
    info: "bg-[var(--info)]",
  };

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-3 w-full overflow-hidden rounded-full border border-[var(--input-border)]/50",
        "bg-[var(--bg)] shadow-[var(--neu-inset-sm)]",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 transition-all duration-300 rounded-full",
          toneClasses[tone]
        )}
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
    </ProgressPrimitive.Root>
  );
});
NeuProgress.displayName = ProgressPrimitive.Root.displayName;
