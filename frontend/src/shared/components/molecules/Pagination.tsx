import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/components/atoms/Button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export function Pagination({ currentPage, totalPages, totalElements, pageSize, onPageChange, onPageSizeChange }: PaginationProps) {
  const start = currentPage * pageSize + 1;
  const end = Math.min((currentPage + 1) * pageSize, totalElements);

  return (
    <div className="flex items-center justify-between px-2 py-3">
      <p className="text-sm text-slate-500">
        Hi?n th? <span className="font-medium">{start}�{end}</span> trong {" "}
        <span className="font-medium">{totalElements}</span> k?t qu?
      </p>
      <div className="flex items-center gap-2">
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-8 rounded border border-slate-300 px-2 text-sm text-slate-700"
          >
            {[10, 20, 50].map((s) => <option key={s} value={s}>{s} / trang</option>)}
          </select>
        )}
        <Button variant="outline" size="sm" disabled={currentPage === 0} onClick={() => onPageChange(currentPage - 1)}>
          <ChevronLeft size={16} />
        </Button>
        <span className="min-w-[60px] text-center text-sm text-slate-600">
          {currentPage + 1} / {totalPages}
        </span>
        <Button variant="outline" size="sm" disabled={currentPage >= totalPages - 1} onClick={() => onPageChange(currentPage + 1)}>
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}
