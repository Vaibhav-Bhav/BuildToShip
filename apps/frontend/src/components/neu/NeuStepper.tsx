import React from "react";
import { Check } from "lucide-react";
import { cn } from "../../lib/cn";

export interface StepperStep {
  id: string;
  label: string;
  description?: string;
}

export interface NeuStepperProps {
  steps: StepperStep[];
  currentStepIndex: number;
  className?: string;
}

export const NeuStepper: React.FC<NeuStepperProps> = ({
  steps,
  currentStepIndex,
  className,
}) => {
  return (
    <div className={cn("w-full py-4", className)}>
      <nav aria-label="Progress">
        <ol className="flex items-center justify-between w-full">
          {steps.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isUpcoming = index > currentStepIndex;

            return (
              <li
                key={step.id}
                className={cn(
                  "relative flex flex-col items-center flex-1 text-center",
                  index !== steps.length - 1 && "after:content-[''] after:absolute after:top-4 after:left-[50%] after:w-full after:h-1 after:-translate-y-1/2 after:z-0",
                  index !== steps.length - 1 && (isCompleted ? "after:bg-[var(--accent)]" : "after:bg-[var(--input-border)]")
                )}
              >
                <div
                  className={cn(
                    "relative z-10 flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all duration-200 select-none",
                    isCompleted && "bg-[var(--accent)] text-[var(--accent-contrast)] shadow-[var(--neu-raised-sm)]",
                    isCurrent && "bg-[var(--bg)] text-[var(--accent)] border-2 border-[var(--accent)] shadow-[var(--neu-inset-sm)] font-extrabold ring-4 ring-[var(--accent)]/15",
                    isUpcoming && "bg-[var(--bg)] text-[var(--text-muted)] border border-[var(--input-border)] shadow-[var(--neu-inset-sm)]"
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : <span>{index + 1}</span>}
                </div>
                <div className="mt-2 px-1">
                  <span
                    className={cn(
                      "block text-xs font-semibold leading-tight",
                      isCurrent ? "text-[var(--accent)] font-bold" : isCompleted ? "text-[var(--text)]" : "text-[var(--text-muted)]"
                    )}
                  >
                    {step.label}
                  </span>
                  {step.description && (
                    <span className="hidden sm:block text-[11px] text-[var(--text-muted)] mt-0.5">
                      {step.description}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
};
