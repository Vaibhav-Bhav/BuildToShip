import React from "react";
import { cn } from "../../lib/cn";
import { getInitials } from "../../lib/format";

export interface NeuAvatarProps {
  name?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const NeuAvatar: React.FC<NeuAvatarProps> = ({
  name,
  size = "md",
  className,
}) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-[11px]",
    md: "w-10 h-10 text-xs",
    lg: "w-13 h-13 text-sm",
  };

  const initials = getInitials(name);

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center rounded-full font-bold select-none shrink-0",
        "bg-[var(--bg)] text-[var(--accent)] shadow-[var(--neu-inset-sm)] ring-2 ring-[var(--input-border)]/50",
        sizeClasses[size],
        className
      )}
      title={name ?? "User"}
    >
      <span>{initials}</span>
    </div>
  );
};
