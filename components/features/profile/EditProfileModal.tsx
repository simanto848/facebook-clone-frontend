import React, { useState, useEffect } from "react";
import { Dialog, Input, Button } from "@/components/ui";

export interface EditProfileFormData {
  displayName: string;
  bio: string;
  location: string;
  website: string;
  avatar: string;
  coverPhoto: string;
}

export interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: EditProfileFormData;
  onSave: (data: EditProfileFormData) => Promise<void> | void;
  isSaving?: boolean;
}

export function EditProfileModal({
  isOpen,
  onClose,
  initialData,
  onSave,
  isSaving = false,
}: EditProfileModalProps) {
  const [formData, setFormData] = useState<EditProfileFormData>(initialData);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData);
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Profile"
      description="Update your display name, bio, links, and styling."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Display Name</label>
          <Input
            value={formData.displayName}
            onChange={(e) => setFormData((p) => ({ ...p, displayName: e.target.value }))}
            placeholder="Your full name"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Bio</label>
          <textarea
            rows={3}
            value={formData.bio}
            onChange={(e) => setFormData((p) => ({ ...p, bio: e.target.value }))}
            placeholder="Tell others what you are building..."
            className="w-full bg-[#1e293b] border border-[#334155] rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Location</label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
              placeholder="e.g., Tokyo, Japan"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Website</label>
            <Input
              value={formData.website}
              onChange={(e) => setFormData((p) => ({ ...p, website: e.target.value }))}
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Avatar Image URL</label>
          <Input
            value={formData.avatar}
            onChange={(e) => setFormData((p) => ({ ...p, avatar: e.target.value }))}
            placeholder="https://..."
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Cover Photo URL</label>
          <Input
            value={formData.coverPhoto}
            onChange={(e) => setFormData((p) => ({ ...p, coverPhoto: e.target.value }))}
            placeholder="https://..."
          />
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
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

export default EditProfileModal;
