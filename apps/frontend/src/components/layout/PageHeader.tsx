import React from "react";
import { cn } from "../../lib/cn";

export interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  body?: string;
  action?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  eyebrow,
  title,
  body,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-wrap items-end justify-between gap-4 mb-8 pb-4 border-b border-[var(--input-border)]/40",
        className
      )}
    >
      <div className="space-y-1">
        {eyebrow && (
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--accent)]">
            {eyebrow}
          </span>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text)]">
          {title}
        </h1>
        {body && (
          <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-2xl leading-relaxed">
            {body}
          </p>
        )}
      </div>
      {action && <div className="shrink-0 flex items-center gap-3">{action}</div>}
    </div>
  );
};
