"use client";

import React, { useState, useEffect } from "react";
import { Trash2, History } from "lucide-react";
import { activityLogService } from "@/services/activityLogService";
import { DataTable, Button, type Column } from "@/components/ui";

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

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await activityLogService.getActivityLogs();
      const items = res.data || res || [];
      if (Array.isArray(items) && items.length > 0) {
        const parsed: LogEntry[] = items.map((l: any) => ({
          id: l.id,
          action: l.action || "ACTIVITY",
          details: l.details || l.description || "Activity performed",
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

  const handleDelete = async (id: string) => {
    setLogs((prev) => prev.filter((l) => l.id !== id));
    try {
      await activityLogService.deleteLog(id);
    } catch (err) {
      console.error("Delete log error:", err);
    }
  };

  const handleClear = async () => {
    setLogs([]);
    try {
      await activityLogService.clearLogs();
    } catch (err) {
      console.error("Clear logs error:", err);
    }
  };

  const columns: Column<LogEntry>[] = [
    {
      key: "action",
      header: "Action",
      sortable: true,
      cell: (row) => (
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-blue-600/20 text-blue-400 uppercase">
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

  return (
    <div className="rounded-2xl border border-[#1f2937] bg-[#111827] p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-[#1f2937] pb-4">
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
          <Button
            size="sm"
            variant="danger"
            leftIcon={<Trash2 size={13} />}
            onClick={handleClear}
          >
            Clear Log
          </Button>
        )}
      </div>

      {loading ? (
        <p className="text-xs text-slate-400 py-8 text-center">Loading audit log...</p>
      ) : (
        <DataTable
          columns={columns}
          data={logs}
          searchPlaceholder="Filter audit logs..."
          pageSize={5}
        />
      )}
    </div>
  );
}
