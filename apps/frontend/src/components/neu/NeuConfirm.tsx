import React from "react";
import {
  NeuDialog,
  NeuDialogContent,
  NeuDialogHeader,
  NeuDialogTitle,
  NeuDialogDescription,
  NeuDialogFooter,
} from "./NeuDialog";
import { NeuButton } from "./NeuButton";

export interface NeuConfirmProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "primary" | "danger";
  loading?: boolean;
  onConfirm: () => void;
}

export const NeuConfirm: React.FC<NeuConfirmProps> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "primary",
  loading = false,
  onConfirm,
}) => {
  return (
    <NeuDialog open={open} onOpenChange={onOpenChange}>
      <NeuDialogContent className="max-w-md">
        <NeuDialogHeader>
          <NeuDialogTitle>{title}</NeuDialogTitle>
          <NeuDialogDescription className="mt-2 text-sm leading-6">
            {description}
          </NeuDialogDescription>
        </NeuDialogHeader>
        <NeuDialogFooter className="gap-2 sm:gap-0">
          <NeuButton
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {cancelLabel}
          </NeuButton>
          <NeuButton
            variant={tone === "danger" ? "danger" : "primary"}
            loading={loading}
            onClick={() => {
              onConfirm();
            }}
          >
            {confirmLabel}
          </NeuButton>
        </NeuDialogFooter>
      </NeuDialogContent>
    </NeuDialog>
  );
};
