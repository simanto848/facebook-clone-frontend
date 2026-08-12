"use client";

import React, { useState } from "react";
import { Flag, X, ShieldAlert } from "lucide-react";
import { reportService } from "@/services/reportService";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetType: "POST" | "USER" | "COMMENT" | "GROUP" | "PAGE";
}

export default function ReportModal({ isOpen, onClose, targetId, targetType }: ReportModalProps) {
  const [reason, setReason] = useState("Spam");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

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
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Report error:", err);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-xs" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-[#1f2937] bg-[#111827] p-6 text-white shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#1f2937] pb-3">
          <div className="flex items-center gap-2 text-red-400">
            <ShieldAlert size={20} />
            <h3 className="font-bold text-base text-white">Report Content</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-[#1f2937]">
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <Flag size={32} className="mx-auto text-green-400" />
            <h4 className="font-bold text-sm text-white">Report Submitted</h4>
            <p className="text-xs text-slate-400">Thank you for helping keep our community safe.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Reason for reporting</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full h-11 rounded-xl border border-[#1f2937] bg-[#0f172a] px-3.5 outline-none focus:border-red-500"
              >
                <option value="Spam">Spam or misleading content</option>
                <option value="Harassment">Harassment or hate speech</option>
                <option value="Violence">Violence or dangerous content</option>
                <option value="Copyright">Intellectual property violation</option>
                <option value="Other">Other reason</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Additional Details (Optional)</label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Provide details about why this violates guidelines..."
                className="w-full h-24 rounded-xl border border-[#1f2937] bg-[#0f172a] p-3 outline-none resize-none focus:border-red-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-lg shadow-red-600/10"
            >
              {submitting ? "Submitting..." : "Submit Report"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
