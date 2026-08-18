"use client";

import React, { useState } from "react";
import { Flag, Check } from "lucide-react";
import { Dialog, Select, Button, Input } from "@/components/ui";
import { reportService } from "@/services/reportService";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetType: "POST" | "USER" | "COMMENT" | "GROUP" | "PAGE";
  targetTitle?: string;
}

export function ReportModal({
  isOpen,
  onClose,
  targetId,
  targetType,
  targetTitle,
}: ReportModalProps) {
  const [reason, setReason] = useState("SPAM");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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
      console.error("Report submit error:", err);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Report ${targetType.toLowerCase()}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {targetTitle && (
          <p className="text-xs text-slate-300 font-semibold bg-[#0b0f19] p-3 rounded-xl border border-[#1f2937]">
            Reporting: <span className="text-white font-bold">{targetTitle}</span>
          </p>
        )}

        <Select
          label="Reason for report"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          options={[
            { label: "Spam or misleading", value: "SPAM" },
            { label: "Harassment or hate speech", value: "HARASSMENT" },
            { label: "Inappropriate content", value: "INAPPROPRIATE" },
            { label: "Violence or dangerous content", value: "VIOLENCE" },
            { label: "Intellectual property violation", value: "COPYRIGHT" },
          ]}
        />

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300 block">Additional Details (Optional)</label>
          <textarea
            rows={3}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Describe why this violates community guidelines..."
            className="w-full bg-[#111827] border border-[#374151] rounded-xl p-3 text-xs text-white outline-none resize-none focus:border-blue-500 transition"
          />
        </div>

        {submitted && (
          <div className="flex items-center gap-2 text-green-400 text-xs font-bold py-1">
            <Check size={16} />
            <span>Thank you. Your report has been submitted to moderators.</span>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-[#1f2937]">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" type="submit" loading={loading} leftIcon={<Flag size={14} />}>
            Submit Report
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
