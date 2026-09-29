import React from "react";
import { cn } from "../../lib/cn";

export const NeuTableContainer: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div
    className={cn(
      "w-full overflow-hidden rounded-[20px] bg-[var(--bg)] shadow-[var(--neu-raised-sm)] border border-[var(--input-border)]/50",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const NeuTableHead: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div
    className={cn(
      "hidden md:grid gap-4 px-5 py-3.5 border-b border-[var(--input-border)]/50 bg-[var(--bg)] shadow-[var(--neu-inset-sm)]",
      "text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] select-none",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export interface NeuTableRowProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
}

export const NeuTableRow: React.FC<NeuTableRowProps> = ({
  className,
  children,
  ...props
}) => (
  <div
    className={cn(
      "grid gap-3 p-4 md:px-5 md:py-4 border-b border-[var(--input-border)]/30 last:border-b-0 transition-all duration-150 cursor-pointer",
      "bg-[var(--bg)] hover:shadow-[var(--neu-raised-sm)] hover:z-10 relative",
      "focus-visible:outline-[2px] focus-visible:outline-[var(--accent)] focus-visible:outline-offset-[-2px]",
      className
    )}
    {...props}
  >
    {children}
  </div>
);
