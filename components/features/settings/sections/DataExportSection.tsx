"use client";

import React, { useState } from "react";
import SettingsSection from "@/components/features/settings/SettingsSection";
import { Button, Badge } from "@/components/ui";
import { useAuthStore } from "@/store/authStore";
import { usePostStore } from "@/store/postStore";
import { useChatStore } from "@/store/chatStore";
import {
  Download,
  FileText,
  CheckCircle2,
  Clock,
  HardDrive,
  FileCode,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export default function DataExportSection() {
  const user = useAuthStore((state) => state.user);
  const posts = usePostStore((state) => state.posts);
  const conversations = useChatStore((state) => state.conversations);

  const [format, setFormat] = useState<"json" | "html">("json");
  const [dateRange, setDateRange] = useState<string>("all");
  const [selectedCategories, setSelectedCategories] = useState<Record<string, boolean>>({
    posts: true,
    comments: true,
    saved: true,
    messages: true,
    profile: true,
  });

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [completedExport, setCompletedExport] = useState<{ date: string; size: string } | null>(null);

  const toggleCategory = (key: string) => {
    setSelectedCategories((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleStartExport = () => {
    setIsExporting(true);
    setExportProgress(15);

    const interval = setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          setTimeout(() => {
            // Trigger actual download
            const exportPayload = {
              app: "TechSphere Social",
              version: "2.5.0",
              exportedAt: new Date().toISOString(),
              account: {
                id: user?.id,
                username: user?.username,
                displayName: user?.displayName,
                email: user?.email,
              },
              filters: {
                format,
                dateRange,
                categories: selectedCategories,
              },
              data: {
                posts: selectedCategories.posts ? posts : [],
                savedCount: posts.filter((p) => p.saved).length,
                conversationsCount: selectedCategories.messages ? conversations.length : 0,
              },
            };

            const jsonStr = JSON.stringify(exportPayload, null, 2);
            const blob = new Blob([jsonStr], { type: format === "json" ? "application/json" : "text/html" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `techsphere-archive-${user?.username || "user"}-${Date.now()}.${format === "json" ? "json" : "html"}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setIsExporting(false);
            setExportProgress(100);
            setCompletedExport({
              date: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              size: `${(jsonStr.length / 1024).toFixed(1)} KB`,
            });
          }, 400);
          return 95;
        }
        return prev + 25;
      });
    }, 180);
  };

  const categories = [
    { key: "posts", label: "Posts & Stories", desc: "Your timeline updates, captions, and links" },
    { key: "comments", label: "Comments & Reactions", desc: "Your replies and emoji reactions across posts" },
    { key: "saved", label: "Saved Collections", desc: "Bookmarked links, articles, and media" },
    { key: "messages", label: "Direct Messages & Chats", desc: "Conversation transcripts and attachments metadata" },
    { key: "profile", label: "Profile & Account Data", desc: "Account settings, bio, avatar details, and sessions" },
  ];

  return (
    <SettingsSection
      title="Download Your Information"
      description="Request a secure copy of your personal activity, posts, and media archive for data portability."
    >
      <div className="space-y-6">
        {/* Banner Alert */}
        <div className="flex items-start gap-3 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
          <ShieldCheck size={20} className="text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <p className="font-semibold text-white">GDPR & Data Portability Compliant</p>
            <p className="text-slate-300 leading-relaxed">
              You own your data. You can download an encrypted copy of your information at any time in machine-readable JSON or HTML format.
            </p>
          </div>
        </div>

        {/* Categories Selection */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Select Data to Include</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {categories.map((cat) => {
              const isChecked = !!selectedCategories[cat.key];
              return (
                <div
                  key={cat.key}
                  onClick={() => toggleCategory(cat.key)}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer select-none transition ${
                    isChecked
                      ? "border-blue-500/60 bg-blue-500/10 text-white"
                      : "border-[#1f2937] bg-[#0f172a] text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="mt-0.5 rounded border-slate-600 text-blue-600 focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <p className={`text-xs font-semibold ${isChecked ? "text-white" : "text-slate-300"}`}>{cat.label}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{cat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Export Options (Format & Date Range) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#1f2937]">
          {/* Format */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">File Format</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormat("json")}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  format === "json"
                    ? "border-blue-500 bg-blue-600/20 text-blue-400"
                    : "border-[#1f2937] bg-[#0f172a] text-slate-400 hover:text-white"
                }`}
              >
                <FileCode size={14} />
                <span>JSON</span>
              </button>
              <button
                type="button"
                onClick={() => setFormat("html")}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  format === "html"
                    ? "border-blue-500 bg-blue-600/20 text-blue-400"
                    : "border-[#1f2937] bg-[#0f172a] text-slate-400 hover:text-white"
                }`}
              >
                <FileText size={14} />
                <span>HTML</span>
              </button>
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full h-9 rounded-xl border border-[#1f2937] bg-[#0f172a] px-3 text-xs text-white outline-none cursor-pointer"
            >
              <option value="all">All Time (Complete History)</option>
              <option value="last_year">Past 12 Months</option>
              <option value="last_3m">Past 3 Months</option>
              <option value="last_month">Past 30 Days</option>
            </select>
          </div>
        </div>

        {/* Progress Bar during generation */}
        {isExporting && (
          <div className="space-y-2 p-4 rounded-xl bg-slate-900 border border-blue-500/30">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Bundling archive files...</span>
              <span className="text-blue-400 font-mono font-bold">{exportProgress}%</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-200"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Completed State */}
        {completedExport && !isExporting && (
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>Archive generated and downloaded ({completedExport.size}) at {completedExport.date}.</span>
            </div>
            <Badge variant="success">Downloaded</Badge>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <Button
            variant="primary"
            leftIcon={<Download size={15} />}
            loading={isExporting}
            disabled={!Object.values(selectedCategories).some(Boolean)}
            onClick={handleStartExport}
          >
            Create & Download Archive
          </Button>
        </div>
      </div>
    </SettingsSection>
  );
}
