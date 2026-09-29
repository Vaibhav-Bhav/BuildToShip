import React from "react";
import { cn } from "../../lib/cn";

export type NeuBadgeTone = "neutral" | "success" | "warning" | "danger" | "info" | "accent";

export interface NeuBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: NeuBadgeTone;
  dot?: boolean;
}

export const NeuBadge: React.FC<NeuBadgeProps> = ({
  className,
  tone = "neutral",
  dot = true,
  children,
  ...props
}) => {
  const dotClasses: Record<NeuBadgeTone, string> = {
    neutral: "bg-[var(--text-muted)]",
    success: "bg-[var(--success)]",
    warning: "bg-[var(--warning)]",
    danger: "bg-[var(--danger)]",
    info: "bg-[var(--info)]",
    accent: "bg-[var(--accent)]",
  };

  const textClasses: Record<NeuBadgeTone, string> = {
    neutral: "text-[var(--text-muted)]",
    success: "text-[var(--success)]",
    warning: "text-[var(--warning)]",
    danger: "text-[var(--danger)]",
    info: "text-[var(--info)]",
    accent: "text-[var(--accent)]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-[var(--radius-pill)] select-none",
        "bg-[var(--bg)] shadow-[var(--neu-inset-sm)] border border-[var(--input-border)]/50",
        textClasses[tone],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("w-2 h-2 rounded-full shrink-0 shadow-sm", dotClasses[tone])}
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </span>
  );
};
