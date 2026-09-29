import React from "react";
import { cn } from "../../lib/cn";

export interface NeuSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shape?: "rect" | "circle" | "pill";
}

export const NeuSkeleton: React.FC<NeuSkeletonProps> = ({
  className,
  shape = "rect",
  ...props
}) => {
  const shapeClasses = {
    rect: "rounded-[12px]",
    circle: "rounded-full",
    pill: "rounded-full",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-[var(--bg)] shadow-[var(--neu-inset-sm)] border border-[var(--input-border)]/30",
        "before:content-[''] before:absolute before:inset-0",
        "before:bg-gradient-to-r before:from-transparent before:via-[var(--shadow-light)]/40 before:to-transparent",
        "before:animate-[shimmer_1.6s_infinite] before:-translate-x-full",
        shapeClasses[shape],
        className
      )}
      {...props}
    />
  );
};
