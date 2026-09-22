"use client";

import React, { useState, useEffect } from "react";
import { Trash2, History, AlertTriangle, Download, Check, Search, FileSpreadsheet } from "lucide-react";
import { activityLogService } from "@/services/activityLogService";
import { DataTable, Button, Dialog, type Column } from "@/components/ui";

interface LogEntry {
  id: string;
  action: string;
  details: string;
  createdAt: string;
}

const fallbackLogs: LogEntry[] = [
  { id: "1", action: "LOGIN", details: "Logged in from Chrome macOS", createdAt: "Just now" },
  { id: "2", action: "POST_CREATE", details: "Published a post in feed", createdAt: "2 hours ago" },
  { id: "3", action: "PROFILE_UPDATE", details: "Updated profile bio", createdAt: "Yesterday" },
  { id: "4", action: "SECURITY", details: "Updated account security settings", createdAt: "3 days ago" },
];

export default function ActivityLogSection() {
  const [logs, setLogs] = useState<LogEntry[]>(fallbackLogs);
  const [loading, setLoading] = useState(false);

  const getActionBadgeColor = (action: string) => {
    const upper = action.toUpperCase();
    if (upper.includes("LOGIN") || upper.includes("AUTH")) return "bg-emerald-600/20 text-emerald-400 border-emerald-500/30";
    if (upper.includes("DELETE") || upper.includes("REMOVE") || upper.includes("BLOCK")) return "bg-rose-600/20 text-rose-400 border-rose-500/30";
    if (upper.includes("UPDATE") || upper.includes("EDIT")) return "bg-amber-600/20 text-amber-400 border-amber-500/30";
    return "bg-blue-600/20 text-blue-400 border-blue-500/30";
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await activityLogService.getActivityLogs();
      const raw = res?.data?.logs || res?.logs || res?.data || res || [];
      const items = Array.isArray(raw) ? raw : [];
      if (items.length > 0) {
        const parsed: LogEntry[] = items.map((l: any) => ({
          id: l.id,
          action: l.action || "ACTIVITY",
          details: l.details || l.description || l.message || "Activity performed",
          createdAt: l.createdAt ? new Date(l.createdAt).toLocaleString() : "Recently",
        }));
        setLogs(parsed);
      }
    } catch {
      setLogs(fallbackLogs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const [isClearing, setIsClearing] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [exported, setExported] = useState(false);
  const [exportedCSV, setExportedCSV] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleExport = () => {
    if (logs.length === 0) return;
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-log-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 2500);
  };

  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const header = "ID,Action,Details,Timestamp\n";
    const rows = logs
      .map(
        (l) =>
          `"${l.id}","${l.action}","${l.details.replace(/"/g, '""')}","${l.createdAt}"`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-log-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExportedCSV(true);
    setTimeout(() => setExportedCSV(false), 2500);
  };

  const handleDelete = async (id: string) => {
    setLogs((prev) => prev.filter((l) => l.id !== id));
    try {
      await activityLogService.deleteLog(id);
    } catch (err) {
      console.error("Delete log error:", err);
    }
  };

  const handleClear = async () => {
    setIsClearing(true);
    try {
      await activityLogService.clearLogs();
      setLogs([]);
      setIsClearModalOpen(false);
    } catch (err) {
      console.error("Clear logs error:", err);
    } finally {
      setIsClearing(false);
    }
  };

  const columns: Column<LogEntry>[] = [
    {
      key: "action",
      header: "Action",
      sortable: true,
      cell: (row) => (
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border uppercase ${getActionBadgeColor(row.action)}`}>
          {row.action}
        </span>
      ),
    },
    {
      key: "details",
      header: "Details & Event",
      sortable: true,
      cell: (row) => <span className="text-xs text-slate-200 font-medium">{row.details}</span>,
    },
    {
      key: "createdAt",
      header: "Timestamp",
      sortable: true,
      cell: (row) => <span className="text-[11px] text-slate-400">{row.createdAt}</span>,
    },
    {
      key: "actions",
      header: "Manage",
      cell: (row) => (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleDelete(row.id)}
          className="hover:text-red-400"
        >
          <Trash2 size={14} />
        </Button>
      ),
    },
  ];

  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [timeFilter, setTimeFilter] = useState<"ALL" | "24H" | "7D">("ALL");

  const categories = [
    { id: "ALL", label: "All Events" },
    { id: "LOGIN", label: "Logins & Auth" },
    { id: "POST", label: "Posts & Comments" },
    { id: "FRIENDSHIP", label: "Connections" },
    { id: "PROFILE", label: "Profile Updates" },
    { id: "SECURITY", label: "Security & 2FA" },
  ];

  const filteredLogs = logs.filter((log) => {
    if (filterCategory !== "ALL") {
      const action = log.action.toUpperCase();
      if (filterCategory === "LOGIN" && !action.includes("LOGIN") && !action.includes("AUTH")) return false;
      if (filterCategory === "POST" && !action.includes("POST") && !action.includes("FEED") && !action.includes("COMMENT")) return false;
      if (filterCategory === "FRIENDSHIP" && !action.includes("FRIEND") && !action.includes("FOLLOW") && !action.includes("CONNECTION")) return false;
      if (filterCategory === "PROFILE" && !action.includes("PROFILE") && !action.includes("AVATAR") && !action.includes("COVER")) return false;
      if (filterCategory === "SECURITY" && !action.includes("SECURITY") && !action.includes("PASSWORD") && !action.includes("2FA")) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!log.action.toLowerCase().includes(q) && !log.details.toLowerCase().includes(q)) {
        return false;
      }
    }

    if (timeFilter !== "ALL") {
      const logDate = new Date(log.createdAt).getTime();
      if (!isNaN(logDate)) {
        const now = Date.now();
        if (timeFilter === "24H" && now - logDate > 24 * 60 * 60 * 1000) return false;
        if (timeFilter === "7D" && now - logDate > 7 * 24 * 60 * 60 * 1000) return false;
      }
    }
    return true;
  });

  return (
    <div className="rounded-2xl border border-[#1f2937] bg-[#111827] p-6 text-white space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f2937] pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-400">
            <History size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Activity Log & Audit History</h2>
            <p className="text-xs text-slate-400">View and manage your account activity history</p>
          </div>
        </div>

        {logs.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              leftIcon={exported ? <Check size={13} className="text-emerald-400" /> : <Download size={13} />}
              onClick={handleExport}
            >
              {exported ? "Exported" : "JSON"}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              leftIcon={exportedCSV ? <Check size={13} className="text-emerald-400" /> : <FileSpreadsheet size={13} />}
              onClick={handleExportCSV}
            >
              {exportedCSV ? "Exported" : "CSV"}
            </Button>
            <Button
              size="sm"
              variant="danger"
              leftIcon={<Trash2 size={13} />}
              onClick={() => setIsClearModalOpen(true)}
            >
              Clear Log
            </Button>
          </div>
        )}
      </div>

      {/* Category and time filter pills */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const count = logs.filter((log) => {
              if (cat.id === "ALL") return true;
              const action = log.action.toUpperCase();
              if (cat.id === "LOGIN") return action.includes("LOGIN") || action.includes("AUTH");
              if (cat.id === "POST") return action.includes("POST") || action.includes("FEED") || action.includes("COMMENT");
              if (cat.id === "FRIENDSHIP") return action.includes("FRIEND") || action.includes("FOLLOW") || action.includes("CONNECTION");
              if (cat.id === "PROFILE") return action.includes("PROFILE") || action.includes("AVATAR") || action.includes("COVER");
              if (cat.id === "SECURITY") return action.includes("SECURITY") || action.includes("PASSWORD") || action.includes("2FA");
              return true;
            }).length;

            const isActive = filterCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "bg-[#1f2937] text-slate-400 hover:text-white hover:bg-[#263345]"
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? "bg-white/20" : "bg-slate-800"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search input and Time Filter Toggle */}
        <div className="flex items-center gap-2 shrink-0 self-start lg:self-auto">
          <div className="relative w-40 sm:w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center rounded-xl bg-slate-800/80 p-1 border border-slate-700 text-xs shrink-0">
            {(["ALL", "24H", "7D"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeFilter(t)}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  timeFilter === t ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                {t === "ALL" ? "All Time" : t === "24H" ? "Last 24h" : "Last 7d"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-xs text-slate-400 py-8 text-center">Loading audit log...</p>
      ) : (
        <DataTable
          columns={columns}
          data={filteredLogs}
          searchPlaceholder="Filter audit logs..."
          pageSize={5}
        />
      )}

      {/* CLEAR LOG CONFIRMATION MODAL */}
      <Dialog
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        title="Clear Activity Log History"
        description="Are you sure you want to clear your entire activity log? This will remove all audit history and session events from your account."
        size="sm"
      >
        <div className="space-y-4 pt-2">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5">
            <AlertTriangle size={18} className="shrink-0 text-amber-400 mt-0.5" />
            <p>
              This action will reset your visible activity history. Security and audit alerts will no longer be listed.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1f2937]">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setIsClearModalOpen(false)}
              disabled={isClearing}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              type="button"
              loading={isClearing}
              onClick={handleClear}
            >
              Confirm Clear
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
