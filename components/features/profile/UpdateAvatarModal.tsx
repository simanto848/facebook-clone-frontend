import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Dialog, Input, Button } from "@/components/ui";

export interface UpdateAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: string;
  onSave: (newAvatarUrl: string) => Promise<void> | void;
  isSaving?: boolean;
}

const DEFAULT_AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
];

export function UpdateAvatarModal({
  isOpen,
  onClose,
  currentAvatar,
  onSave,
  isSaving = false,
}: UpdateAvatarModalProps) {
  const [avatarInput, setAvatarInput] = useState(currentAvatar);

  useEffect(() => {
    if (isOpen) {
      setAvatarInput(currentAvatar);
    }
  }, [isOpen, currentAvatar]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!avatarInput.trim() || isSaving) return;
    await onSave(avatarInput.trim());
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Update Profile Picture"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {/* Live Preview */}
        <div className="flex flex-col items-center justify-center py-2">
          <div className="relative h-28 w-28 rounded-full overflow-hidden border-4 border-blue-500 shadow-xl bg-slate-800">
            <Image
              src={avatarInput || currentAvatar}
              alt="Avatar Preview"
              fill
              className="object-cover"
            />
          </div>
          <span className="text-[11px] text-slate-400 mt-2">Live Preview</span>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">
            Avatar Image URL
          </label>
          <Input
            type="url"
            required
            value={avatarInput}
            onChange={(e) => setAvatarInput(e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
            className="bg-[#0f172a] border-[#1f2937]"
          />
        </div>

        {/* Quick Presets */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-400">
            Or choose a preset avatar:
          </span>
          <div className="flex items-center gap-2">
            {DEFAULT_AVATAR_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setAvatarInput(preset)}
                className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-[#1f2937] hover:border-blue-500 transition cursor-pointer"
              >
                <Image
                  src={preset}
                  fill
                  className="object-cover"
                  alt={`Preset ${idx + 1}`}
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
            disabled={!avatarInput.trim() || isSaving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? "Saving..." : "Save Avatar"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

export default UpdateAvatarModal;
