import React from "react";
import { AlertOctagon, RotateCw } from "lucide-react";
import { cn } from "../../lib/cn";
import { NeuButton } from "./NeuButton";

export interface NeuErrorPanelProps {
  message?: string;
  retry?: () => void;
  className?: string;
}

export const NeuErrorPanel: React.FC<NeuErrorPanelProps> = ({
  message = "An error occurred while loading this view.",
  retry,
  className,
}) => {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-[20px] bg-[var(--bg)] shadow-[var(--neu-raised-sm)] border border-[var(--danger)]/30",
        className
      )}
    >
      <div className="p-3 rounded-full bg-[var(--danger)]/10 text-[var(--danger)] mb-3">
        <AlertOctagon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-[var(--text)]">Unable to load data</h3>
      <p className="text-xs text-[var(--text-muted)] max-w-sm mt-1 mb-4 leading-relaxed">
        {message}
      </p>
      {retry && (
        <NeuButton
          variant="secondary"
          size="sm"
          onClick={retry}
          icon={<RotateCw className="w-4 h-4" />}
        >
          Try again
        </NeuButton>
      )}
    </div>
  );
};
