import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/cn";
import { NeuButton } from "./NeuButton";

export interface NeuPaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const NeuPagination: React.FC<NeuPaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  className,
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-4 py-3 select-none",
        className
      )}
    >
      <div className="text-xs text-[var(--text-muted)] font-medium">
        Showing <span className="font-semibold text-[var(--text)]">{startItem}</span> to{" "}
        <span className="font-semibold text-[var(--text)]">{endItem}</span> of{" "}
        <span className="font-semibold text-[var(--text)]">{totalItems}</span> cases
      </div>

      <div className="flex items-center gap-2">
        <NeuButton
          variant="secondary"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
          icon={<ChevronLeft className="w-4 h-4" />}
        >
          Previous
        </NeuButton>

        <span className="px-3 py-1.5 rounded-[10px] bg-[var(--bg)] shadow-[var(--neu-inset-sm)] text-xs font-semibold text-[var(--text)]">
          {currentPage} / {totalPages}
        </span>

        <NeuButton
          variant="secondary"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
          icon={<ChevronRight className="w-4 h-4" />}
          iconPosition="right"
        >
          Next
        </NeuButton>
      </div>
    </div>
  );
};
