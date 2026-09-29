import React, { useState } from "react";
import { useGetAttachmentUrl, getGetAttachmentUrlQueryKey } from "@workspace/api-client-react";
import { FileImage, Maximize2, X, AlertCircle } from "lucide-react";
import { NeuSkeleton } from "../neu/NeuSkeleton";
import { NeuDialog, NeuDialogContent } from "../neu/NeuDialog";
import { cn } from "../../lib/cn";

export interface AttachmentImageProps {
  attachmentId: number;
  fileName: string;
  className?: string;
}

export const AttachmentImage: React.FC<AttachmentImageProps> = ({
  attachmentId,
  fileName,
  className,
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Cache signed URL for ~50 seconds (backend expires in 60s)
  const { data, isLoading, isError } = useGetAttachmentUrl(attachmentId, {
    query: {
      queryKey: getGetAttachmentUrlQueryKey(attachmentId),
      staleTime: 50 * 1000,
      gcTime: 60 * 1000,
      retry: 2,
    },
  });

  const url = data?.url;

  if (isLoading) {
    return <NeuSkeleton className={cn("w-full h-32 rounded-[14px]", className)} />;
  }

  if (isError || !url) {
    return (
      <div
        className={cn(
          "w-full h-32 rounded-[14px] bg-[var(--bg)] shadow-[var(--neu-inset-sm)] border border-[var(--danger)]/30 flex flex-col items-center justify-center p-3 text-center",
          className
        )}
      >
        <AlertCircle className="w-5 h-5 text-[var(--danger)] mb-1" />
        <span className="text-[11px] text-[var(--text-muted)] truncate max-w-full">
          {fileName}
        </span>
      </div>
    );
  }

  return (
    <>
      <div
        onClick={() => setLightboxOpen(true)}
        className={cn(
          "relative group rounded-[14px] bg-[var(--bg)] shadow-[var(--neu-raised-sm)] border border-[var(--input-border)]/40 p-2 overflow-hidden cursor-pointer transition-all duration-150 select-none",
          "hover:scale-[1.02] active:shadow-[var(--neu-inset-sm)]",
          className
        )}
      >
        <div className="w-full h-28 rounded-[10px] overflow-hidden bg-[var(--bg)] shadow-[var(--neu-inset-sm)] flex items-center justify-center">
          <img
            src={url}
            alt={fileName}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
        </div>
        <div className="flex items-center justify-between gap-2 mt-2 px-1">
          <span className="text-xs font-medium text-[var(--text)] truncate max-w-[140px]">
            {fileName}
          </span>
          <Maximize2 className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--accent)] shrink-0" />
        </div>
      </div>

      {/* Lightbox dialog */}
      <NeuDialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <NeuDialogContent className="max-w-3xl p-3 bg-black/90 border-black/40">
          <div className="relative flex flex-col items-center justify-center max-h-[80vh]">
            <img
              src={url}
              alt={fileName}
              className="max-h-[75vh] w-auto max-w-full object-contain rounded-[10px]"
            />
            <div className="mt-3 text-xs text-white/80 font-medium">
              {fileName}
            </div>
          </div>
        </NeuDialogContent>
      </NeuDialog>
    </>
  );
};
