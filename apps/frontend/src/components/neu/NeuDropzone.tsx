import React, { useRef, useState } from "react";
import { UploadCloud, X, FileImage, AlertCircle } from "lucide-react";
import { cn } from "../../lib/cn";

export interface SelectedFile {
  file: File;
  previewUrl: string;
}

export interface NeuDropzoneProps {
  maxFiles?: number;
  maxSizeBytes?: number; // default 5 MB = 5 * 1024 * 1024
  allowedTypes?: string[];
  files: SelectedFile[];
  onFilesChange: (files: SelectedFile[]) => void;
  className?: string;
  disabled?: boolean;
}

export const NeuDropzone: React.FC<NeuDropzoneProps> = ({
  maxFiles = 3,
  maxSizeBytes = 5 * 1024 * 1024,
  allowedTypes = ["image/jpeg", "image/png", "image/webp"],
  files,
  onFilesChange,
  className,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validateAndAddFiles = (incomingList: FileList | File[]) => {
    setErrorMessage(null);
    const newFiles: SelectedFile[] = [...files];

    for (let i = 0; i < incomingList.length; i++) {
      const file = incomingList[i];

      if (newFiles.length >= maxFiles) {
        setErrorMessage(`You can only upload up to ${maxFiles} images.`);
        break;
      }

      if (!allowedTypes.includes(file.type)) {
        setErrorMessage(`"${file.name}" has an unsupported format. Please upload JPEG, PNG, or WebP images.`);
        continue;
      }

      if (file.size > maxSizeBytes) {
        setErrorMessage(`"${file.name}" exceeds the 5 MB limit.`);
        continue;
      }

      const previewUrl = URL.createObjectURL(file);
      newFiles.push({ file, previewUrl });
    }

    onFilesChange(newFiles);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeFile = (index: number) => {
    const target = files[index];
    if (target?.previewUrl) {
      URL.revokeObjectURL(target.previewUrl);
    }
    const updated = files.filter((_, i) => i !== index);
    onFilesChange(updated);
  };

  return (
    <div className={cn("flex flex-col gap-3 w-full", className)}>
      <div
        onClick={() => !disabled && files.length < maxFiles && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-150 select-none",
          "rounded-[20px] bg-[var(--bg)] shadow-[var(--neu-inset)] border-2 border-dashed",
          isDragging ? "border-[var(--accent)] bg-[var(--accent)]/5" : "border-[var(--input-border)]",
          disabled && "opacity-50 cursor-not-allowed",
          files.length >= maxFiles && "cursor-default opacity-80"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={allowedTypes.join(",")}
          multiple
          disabled={disabled || files.length >= maxFiles}
          className="hidden"
          onChange={(e) => {
            if (e.target.files) validateAndAddFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <div className="p-3 rounded-full bg-[var(--bg)] shadow-[var(--neu-raised-sm)] text-[var(--accent)] mb-2">
          <UploadCloud className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-[var(--text)]">
          {files.length >= maxFiles ? (
            `Maximum ${maxFiles} images attached`
          ) : (
            <>
              Click or drag photos here to attach evidence
            </>
          )}
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          JPEG, PNG, or WebP · Max 5 MB each · Up to {maxFiles} files
        </p>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-1.5 text-xs text-[var(--danger)] font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {files.map((item, index) => (
            <div
              key={index}
              className="relative group rounded-[14px] bg-[var(--bg)] shadow-[var(--neu-raised-sm)] border border-[var(--input-border)]/50 p-2 overflow-hidden flex flex-col items-center"
            >
              <div className="w-full h-24 rounded-[10px] overflow-hidden bg-[var(--bg)] shadow-[var(--neu-inset-sm)] flex items-center justify-center">
                {item.previewUrl ? (
                  <img
                    src={item.previewUrl}
                    alt={`Evidence preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FileImage className="w-8 h-8 text-[var(--text-muted)]" />
                )}
              </div>
              <div className="w-full mt-2 flex items-center justify-between gap-1 px-1">
                <span className="text-[11px] font-medium text-[var(--text)] truncate max-w-[100px]">
                  {item.file.name}
                </span>
                <span className="text-[10px] text-[var(--text-muted)] shrink-0">
                  {(item.file.size / (1024 * 1024)).toFixed(1)} MB
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-[var(--bg)] shadow-[var(--neu-raised-sm)] text-[var(--danger)] hover:scale-105 active:shadow-[var(--neu-inset-sm)] transition-all cursor-pointer"
                aria-label={`Remove ${item.file.name}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
