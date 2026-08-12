"use client";

import React, { useState, useMemo, type ReactNode } from "react";
import { ArrowUpDown, Search } from "lucide-react";
import { TablePagination } from "./table-pagination";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: ReactNode;
  cell?: (row: T) => ReactNode;
  sortable?: boolean;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchable?: boolean;
  searchPlaceholder?: string;
  pagination?: boolean;
  pageSize?: number;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns = [],
  data = [],
  searchable = true,
  searchPlaceholder = "Search records...",
  pagination = true,
  pageSize: initialPageSize = 10,
  className,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Search Filter
  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const query = search.toLowerCase();
    return data.filter((row) =>
      Object.values(row).some((val) =>
        String(val ?? "").toLowerCase().includes(query)
      )
    );
  }, [data, search]);

  // Sort Filter
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortKey, sortOrder]);

  // Pagination Slice
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, pagination, currentPage, pageSize]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortOrder === "asc") setSortOrder("desc");
      else setSortKey(null);
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  return (
    <div className={cn("w-full rounded-2xl border border-[#1f2937] bg-[#111827] overflow-hidden shadow-xl", className)}>
      {searchable && (
        <div className="p-4 border-b border-[#1f2937] bg-[#111827]/50">
          <div className="relative flex items-center max-w-xs">
            <Search size={14} className="absolute left-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="h-9 w-full rounded-xl border border-[#374151] bg-[#0f172a] pl-9 pr-3 text-xs text-white outline-none placeholder:text-slate-500 focus:border-blue-500 transition"
            />
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-[#0f172a] uppercase text-[10px] font-bold text-slate-400 border-b border-[#1f2937]">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3.5 select-none">
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => handleSort(col.key)}
                      className="flex items-center gap-1.5 hover:text-white transition"
                    >
                      <span>{col.header}</span>
                      <ArrowUpDown size={12} className={cn(sortKey === col.key && "text-blue-400")} />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f2937]">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-400 font-medium">
                  No data available
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#1f2937]/40 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 font-medium">
                      {col.cell ? col.cell(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={sortedData.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      )}
    </div>
  );
}
