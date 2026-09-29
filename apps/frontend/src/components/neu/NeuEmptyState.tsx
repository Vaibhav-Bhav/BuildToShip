import React from "react";
import { FolderOpen } from "lucide-react";
import { cn } from "../../lib/cn";

export interface NeuEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  body: string;
  action?: React.ReactNode;
  className?: string;
}

export const NeuEmptyState: React.FC<NeuEmptyStateProps> = ({
  icon = <FolderOpen className="w-8 h-8 text-[var(--text-muted)]" />,
  title,
  body,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-[24px] bg-[var(--bg)] shadow-[var(--neu-inset)] border border-[var(--input-border)]/40",
        className
      )}
    >
      <div className="p-4 rounded-full bg-[var(--bg)] shadow-[var(--neu-raised-sm)] text-[var(--accent)] mb-4">
        {icon}
      </div>
      <h3 className="text-base font-bold text-[var(--text)]">{title}</h3>
      <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-sm mt-1.5 leading-relaxed">
        {body}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};
