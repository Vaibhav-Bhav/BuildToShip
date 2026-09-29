import React from "react";
import { cn } from "../../lib/cn";
import { type NeuBadgeTone } from "./NeuBadge";

export interface NeuStatProps {
  label: string;
  value: React.ReactNode;
  tone?: NeuBadgeTone;
  hint?: string;
  className?: string;
}

export const NeuStat: React.FC<NeuStatProps> = ({
  label,
  value,
  tone,
  hint,
  className,
}) => {
  const dotClasses: Record<NeuBadgeTone, string> = {
    neutral: "bg-[var(--text-muted)]",
    success: "bg-[var(--success)]",
    warning: "bg-[var(--warning)]",
    danger: "bg-[var(--danger)]",
    info: "bg-[var(--info)]",
    accent: "bg-[var(--accent)]",
  };

  return (
    <div
      className={cn(
        "p-5 rounded-[20px] bg-[var(--bg)] shadow-[var(--neu-raised-sm)] border border-[var(--input-border)]/40 flex flex-col justify-between select-none",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
          {label}
        </span>
        {tone && (
          <span
            className={cn("w-2.5 h-2.5 rounded-full shrink-0 shadow-sm", dotClasses[tone])}
            aria-hidden="true"
          />
        )}
      </div>
      <div className="mt-3">
        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text)]">
          {value}
        </div>
        {hint && <p className="text-xs text-[var(--text-muted)] mt-1">{hint}</p>}
      </div>
    </div>
  );
};
