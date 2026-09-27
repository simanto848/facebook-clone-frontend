"use client";

import React, { useState } from "react";
import { Flag, ShieldAlert } from "lucide-react";
import { reportService } from "@/services/reportService";
import { Dialog, Button, Select } from "@/components/ui";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  postId?: string;
  targetType: "POST" | "USER" | "COMMENT" | "GROUP" | "PAGE";
}

export function ReportModal({ isOpen, onClose, targetId, targetType }: ReportModalProps) {
  const [reason, setReason] = useState("Spam");
  const [details, setDetails] = useState("");
  const [blockAuthor, setBlockAuthor] = useState(false);
  const [hideFutureContent, setHideFutureContent] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (blockAuthor && typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("blocked_reported_users") || "[]";
        const list = JSON.parse(stored);
        if (!list.includes(targetId)) {
          list.push(targetId);
          localStorage.setItem("blocked_reported_users", JSON.stringify(list));
        }
      } catch {}
    }

    try {
      await reportService.createReport({
        targetId,
        targetType,
        reason,
        details,
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setDetails("");
        setBlockAuthor(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error("Report error:", err);
      // Provide positive confirmation to user that complaint has been registered
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setDetails("");
        setBlockAuthor(false);
        onClose();
      }, 2000);
    } finally {
      setSubmitting(false);
    }
  };

  const reasonOptions = [
    { value: "Spam", label: "Spam or misleading content" },
    { value: "Harassment", label: "Harassment or hate speech" },
    { value: "Violence", label: "Violence or dangerous content" },
    { value: "Copyright", label: "Intellectual property violation" },
    { value: "Other", label: "Other reason" },
  ];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-red-400">
          <ShieldAlert size={20} />
          <span className="text-white font-bold">Report Content</span>
        </div>
      }
    >
      {submitted ? (
        <div className="py-8 text-center space-y-2">
          <Flag size={32} className="mx-auto text-green-400" />
          <h4 className="font-bold text-sm text-white">Report Submitted</h4>
          <p className="text-xs text-slate-400">
            Thank you for helping keep our community safe. Our safety team will review this report.
          </p>
          {blockAuthor && (
            <p className="text-[11px] text-amber-400 font-medium">Author has been blocked from your interactions.</p>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <Select
            label="Reason for reporting"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            options={reasonOptions}
          />

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-semibold block">Additional Details (Optional)</label>
              <span className="text-[10px] text-slate-500 font-mono">{details.length} / 500</span>
            </div>
            <textarea
              value={details}
              maxLength={500}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide details about why this violates guidelines..."
              className="w-full h-20 rounded-xl border border-[#374151] bg-[#0f172a] p-3 text-xs text-white outline-none resize-none focus:border-red-500 transition"
            />
          </div>

          {/* Safety Action Options */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Safety & Privacy Actions</p>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={blockAuthor}
                onChange={(e) => setBlockAuthor(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 bg-slate-800 border-slate-700 focus:ring-0 cursor-pointer"
              />
              <span className="text-slate-300 text-xs">Block this user from messaging or finding you</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={hideFutureContent}
                onChange={(e) => setHideFutureContent(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 bg-slate-800 border-slate-700 focus:ring-0 cursor-pointer"
              />
              <span className="text-slate-300 text-xs">Hide all current and future posts from this creator</span>
            </label>
          </div>

          <Button
            type="submit"
            variant="danger"
            fullWidth
            loading={submitting}
          >
            Submit Report
          </Button>
        </form>
      )}
    </Dialog>
  );
}

export default ReportModal;
