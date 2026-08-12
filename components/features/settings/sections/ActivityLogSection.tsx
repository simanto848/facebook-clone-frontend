"use client";

import React, { useState, useEffect } from "react";
import { Activity, Trash2, History } from "lucide-react";
import { activityLogService } from "@/services/activityLogService";

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
    } catch (err) {
      console.error("Using fallback activity logs:", err);
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
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 transition border border-red-500/20"
          >
            <Trash2 size={13} />
            <span>Clear Log</span>
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-xs text-slate-400 py-8 text-center">Loading audit log...</p>
      ) : logs.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-xs">No recorded activity logs found.</div>
      ) : (
        <div className="divide-y divide-[#1f2937]">
          {logs.map((log) => (
            <div key={log.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 uppercase">
                    {log.action}
                  </span>
                  <span className="text-xs text-slate-300">{log.details}</span>
                </div>
                <p className="text-[10px] text-slate-500">{log.createdAt}</p>
              </div>

              <button
                onClick={() => handleDelete(log.id)}
                className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800 transition"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
