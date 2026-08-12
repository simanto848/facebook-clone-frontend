"use client";

import React, { useState } from "react";
import { Flag, ShieldAlert } from "lucide-react";
import { reportService } from "@/services/reportService";
import { Dialog, Button, Select } from "@/components/ui";

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
          <p className="text-xs text-slate-400">Thank you for helping keep our community safe.</p>
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
            <label className="text-slate-300 font-semibold block">Additional Details (Optional)</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide details about why this violates guidelines..."
              className="w-full h-24 rounded-xl border border-[#374151] bg-[#0f172a] p-3 text-xs text-white outline-none resize-none focus:border-red-500 transition"
            />
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
