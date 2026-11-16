import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Dialog, Input, Button } from "@/components/ui";

export interface UpdateCoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCover: string;
  onSave: (newCoverUrl: string) => Promise<void> | void;
  isSaving?: boolean;
}

const DEFAULT_COVER_PRESETS = [
  "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=1200",
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200",
];

export function UpdateCoverModal({
  isOpen,
  onClose,
  currentCover,
  onSave,
  isSaving = false,
}: UpdateCoverModalProps) {
  const [coverInput, setCoverInput] = useState(currentCover);

  useEffect(() => {
    if (isOpen) {
      setCoverInput(currentCover);
    }
  }, [isOpen, currentCover]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverInput.trim() || isSaving) return;
    await onSave(coverInput.trim());
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Update Cover Photo"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {/* Live Widescreen Preview */}
        <div className="space-y-1">
          <span className="text-[11px] text-slate-400">Live Preview</span>
          <div className="relative h-44 w-full rounded-2xl overflow-hidden border border-[#1f2937] shadow-xl bg-slate-800">
            <Image
              src={coverInput || currentCover}
              alt="Cover Preview"
              fill
              className="object-cover"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">
            Cover Image URL
          </label>
          <Input
            type="url"
            required
            value={coverInput}
            onChange={(e) => setCoverInput(e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
            className="bg-[#0f172a] border-[#1f2937]"
          />
        </div>

        {/* Quick Presets */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-400">
            Or pick a landscape preset:
          </span>
          <div className="grid grid-cols-3 gap-2">
            {DEFAULT_COVER_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCoverInput(preset)}
                className="relative h-16 rounded-xl overflow-hidden border border-[#1f2937] hover:border-blue-500 transition cursor-pointer"
              >
                <Image
                  src={preset}
                  fill
                  className="object-cover"
                  alt={`Cover ${idx + 1}`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-[#1f2937]">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={!coverInput.trim() || isSaving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? "Saving..." : "Save Cover Photo"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

export default UpdateCoverModal;
