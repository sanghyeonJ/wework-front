import { ChevronLeft, ChevronRight } from "lucide-react";
import { IconButton } from "./IconButton";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalElements: number;
  unit?: string;  // "전체 42명"의 "명"
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, totalElements, unit = "건", onChange }: PaginationProps) {
  return (
    <div className="flex select-none items-center justify-end gap-3 text-sm text-fg-muted">
      <span>
        전체 {totalElements.toLocaleString()}{unit}
      </span>
      <div className="flex items-center gap-1">
        <IconButton label="이전 페이지" disabled={page <= 0} onClick={() => onChange(page - 1)}>
          <ChevronLeft aria-hidden="true" className="size-4" />
        </IconButton>
        <span className="min-w-14 text-center tabular-nums">
          {totalPages === 0 ? 0 : page + 1} / {totalPages}
        </span>
        <IconButton
          label="다음 페이지"
          disabled={page >= totalPages - 1}
          onClick={() => onChange(page + 1)}
        >
          <ChevronRight aria-hidden="true" className="size-4" />
        </IconButton>
      </div>
    </div>
  );
}