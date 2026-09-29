import React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../../lib/cn";

export const NeuDialog = DialogPrimitive.Root;
export const NeuDialogTrigger = DialogPrimitive.Trigger;
export const NeuDialogPortal = DialogPrimitive.Portal;
export const NeuDialogClose = DialogPrimitive.Close;

export const NeuDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity duration-200",
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
NeuDialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

export const NeuDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <NeuDialogPortal>
    <NeuDialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 p-6 duration-200",
        "bg-[var(--bg)] shadow-[var(--neu-raised-lg)] border border-[var(--input-border)] rounded-[var(--radius-panel)]",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "focus-visible:outline-none",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-5 top-5 p-2 rounded-[10px] bg-[var(--bg)] shadow-[var(--neu-raised-sm)] text-[var(--text-muted)] hover:text-[var(--text)] active:shadow-[var(--neu-inset-sm)] transition-all cursor-pointer">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </NeuDialogPortal>
));
NeuDialogContent.displayName = DialogPrimitive.Content.displayName;

export const NeuDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-left", className)} {...props} />
);
NeuDialogHeader.displayName = "NeuDialogHeader";

export const NeuDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 mt-4 pt-3 border-t border-[var(--input-border)]/40",
      className
    )}
    {...props}
  />
);
NeuDialogFooter.displayName = "NeuDialogFooter";

export const NeuDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight text-[var(--text)]", className)}
    {...props}
  />
));
NeuDialogTitle.displayName = DialogPrimitive.Title.displayName;

export const NeuDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-[var(--text-muted)]", className)}
    {...props}
  />
));
NeuDialogDescription.displayName = DialogPrimitive.Description.displayName;
