import React, { forwardRef } from "react";
import { cn } from "../../lib/cn";

export interface NeuCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  depth?: "raised" | "raised-lg" | "raised-sm" | "inset" | "flat";
  padding?: "none" | "sm" | "md" | "lg";
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerAction?: React.ReactNode;
  headerIcon?: React.ReactNode;
}

export const NeuCard = forwardRef<HTMLDivElement, NeuCardProps>(
  (
    {
      className,
      depth = "raised",
      padding = "md",
      title,
      subtitle,
      headerAction,
      headerIcon,
      children,
      ...props
    },
    ref
  ) => {
    const depthClasses = {
      raised: "bg-[var(--bg)] shadow-[var(--neu-raised)] rounded-[20px]",
      "raised-lg": "bg-[var(--bg)] shadow-[var(--neu-raised-lg)] rounded-[28px]",
      "raised-sm": "bg-[var(--bg)] shadow-[var(--neu-raised-sm)] rounded-[12px]",
      inset: "bg-[var(--bg)] shadow-[var(--neu-inset)] rounded-[20px]",
      flat: "bg-[var(--bg)] border border-[var(--input-border)] rounded-[20px]",
    };

    const paddingClasses = {
      none: "p-0",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    };

    const hasHeader = Boolean(title || subtitle || headerAction || headerIcon);

    return (
      <div
        ref={ref}
        className={cn(
          "transition-shadow duration-150 text-[var(--text)]",
          depthClasses[depth],
          paddingClasses[padding],
          className
        )}
        {...props}
      >
        {hasHeader && (
          <div className="flex items-start justify-between gap-4 mb-5 pb-3 border-b border-[var(--input-border)]/40">
            <div className="flex items-center gap-3">
              {headerIcon && (
                <div className="p-2.5 rounded-[12px] bg-[var(--bg)] shadow-[var(--neu-inset-sm)] text-[var(--accent)] shrink-0">
                  {headerIcon}
                </div>
              )}
              <div>
                {title && <h2 className="text-base font-semibold leading-tight text-[var(--text)]">{title}</h2>}
                {subtitle && <p className="text-xs text-[var(--text-muted)] mt-1">{subtitle}</p>}
              </div>
            </div>
            {headerAction && <div className="shrink-0">{headerAction}</div>}
          </div>
        )}
        {children}
      </div>
    );
  }
);

NeuCard.displayName = "NeuCard";
