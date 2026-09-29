import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/cn";

export interface NeuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

export const NeuButton = forwardRef<HTMLButtonElement, NeuButtonProps>(
  (
    {
      className,
      variant = "secondary",
      size = "md",
      loading = false,
      disabled = false,
      icon,
      iconPosition = "left",
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    // Sizes with minimum touch target compliance (>= 44px)
    const sizeClasses = {
      sm: "h-9 px-3.5 text-xs min-w-[36px] rounded-[10px]",
      md: "h-11 px-5 text-sm min-w-[44px] rounded-[12px]",
      lg: "h-13 px-6 text-base min-w-[48px] rounded-[14px]",
    };

    // Variants according to Neumorphic design rules:
    // Primary: FILLED with --accent and --accent-contrast text plus raised shadow.
    // Secondary: Soft background with raised shadow, active inset.
    // Ghost: Flat background with border, subtle hover.
    // Danger: Filled or tinted with --danger and clear contrast.
    const variantClasses = {
      primary: cn(
        "bg-[var(--accent)] text-[var(--accent-contrast)] font-medium shadow-[var(--neu-raised-sm)]",
        "hover:brightness-105 active:shadow-[var(--neu-inset-sm)] active:translate-y-[1px]"
      ),
      secondary: cn(
        "bg-[var(--bg)] text-[var(--text)] font-medium shadow-[var(--neu-raised-sm)]",
        "hover:text-[var(--text)] active:shadow-[var(--neu-inset-sm)] active:translate-y-[1px]"
      ),
      ghost: cn(
        "bg-transparent text-[var(--text-muted)] font-medium border border-[var(--input-border)]",
        "hover:bg-[var(--bg)] hover:text-[var(--text)] active:shadow-[var(--neu-inset-sm)] active:translate-y-[1px]"
      ),
      danger: cn(
        "bg-[var(--danger)] text-white font-medium shadow-[var(--neu-raised-sm)]",
        "hover:brightness-105 active:shadow-[var(--neu-inset-sm)] active:translate-y-[1px]"
      ),
    };

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 cursor-pointer transition-all duration-150 select-none",
          "focus-visible:outline-[2px] focus-visible:outline-[var(--accent)] focus-visible:outline-offset-[3px]",
          sizeClasses[size],
          variantClasses[variant],
          isDisabled && "opacity-50 !shadow-none cursor-not-allowed !translate-y-0 active:!translate-y-0 pointer-events-none",
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          icon && iconPosition === "left" && <span className="shrink-0">{icon}</span>
        )}
        <span>{children}</span>
        {!loading && icon && iconPosition === "right" && <span className="shrink-0">{icon}</span>}
      </button>
    );
  }
);

NeuButton.displayName = "NeuButton";
