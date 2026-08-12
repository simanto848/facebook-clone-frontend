"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  totalItems?: number;
  pageSizeOptions?: number[];
  className?: string;
}

export function TablePagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  pageSize = 10,
  onPageSizeChange,
  totalItems,
  pageSizeOptions = [10, 20, 50, 100],
  className,
}: TablePaginationProps) {
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-4 py-3 px-4 bg-[#111827] border-t border-[#1f2937] text-xs text-slate-300", className)}>
      {/* Items info */}
      <div className="flex items-center gap-4">
        {totalItems !== undefined && (
          <span>
            Showing <span className="font-bold text-white">{Math.min((currentPage - 1) * pageSize + 1, totalItems)}</span> to{" "}
            <span className="font-bold text-white">{Math.min(currentPage * pageSize, totalItems)}</span> of{" "}
            <span className="font-bold text-white">{totalItems}</span> entries
          </span>
        )}

        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-8 rounded-lg border border-[#374151] bg-[#0f172a] px-2 text-xs text-white outline-none focus:border-blue-500"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(1)}
          className="h-8 w-8 rounded-lg border border-[#374151] bg-[#0f172a] flex items-center justify-center text-slate-300 hover:bg-[#1f2937] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <ChevronsLeft size={14} />
        </button>

        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="h-8 w-8 rounded-lg border border-[#374151] bg-[#0f172a] flex items-center justify-center text-slate-300 hover:bg-[#1f2937] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft size={14} />
        </button>

        <span className="px-3 font-semibold text-white">
          Page {currentPage} of {totalPages || 1}
        </span>

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="h-8 w-8 rounded-lg border border-[#374151] bg-[#0f172a] flex items-center justify-center text-slate-300 hover:bg-[#1f2937] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <ChevronRight size={14} />
        </button>

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(totalPages)}
          className="h-8 w-8 rounded-lg border border-[#374151] bg-[#0f172a] flex items-center justify-center text-slate-300 hover:bg-[#1f2937] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <ChevronsRight size={14} />
        </button>
      </div>
    </div>
  );
}
