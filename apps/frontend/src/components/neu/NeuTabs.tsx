import React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "../../lib/cn";

export interface NeuTabsProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> {
  className?: string;
}

export const NeuTabs = TabsPrimitive.Root;

export const NeuTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex items-center gap-1.5 p-1.5 bg-[var(--bg)] shadow-[var(--neu-inset-sm)] rounded-[14px] border border-[var(--input-border)]/60 select-none",
      className
    )}
    {...props}
  />
));
NeuTabsList.displayName = TabsPrimitive.List.displayName;

export const NeuTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-[10px] cursor-pointer transition-all duration-150 text-[var(--text-muted)] outline-none select-none",
      "hover:text-[var(--text)]",
      "data-[state=active]:bg-[var(--bg)] data-[state=active]:text-[var(--text)] data-[state=active]:shadow-[var(--neu-raised-sm)] data-[state=active]:font-bold",
      "focus-visible:outline-[2px] focus-visible:outline-[var(--accent)] focus-visible:outline-offset-[2px]",
      className
    )}
    {...props}
  />
));
NeuTabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

export const NeuTabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-4 outline-none focus-visible:outline-[2px] focus-visible:outline-[var(--accent)] focus-visible:outline-offset-[2px]",
      className
    )}
    {...props}
  />
));
NeuTabsContent.displayName = TabsPrimitive.Content.displayName;
