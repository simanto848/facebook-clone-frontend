import React, { useState, useEffect } from "react";
import { Dialog, Button } from "@/components/ui";

export interface CreateCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

export default function CreateCollectionModal({
  isOpen,
  onClose,
  onCreate,
}: CreateCollectionModalProps) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setName("");
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(name.trim());
    setName("");
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Saved Collection"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Collection Folder Name
          </label>
          <input
            type="text"
            placeholder="e.g., Design Inspiration, Recipes, Vacation Ideas"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="w-full text-xs bg-[#0f172a] border border-[#374151] rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500 transition"
          />
        </div>

        <p className="text-[11px] text-slate-400">
          Organize your bookmarked posts into custom collections for easy access.
        </p>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1f2937]">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!name.trim()}
          >
            Create Collection
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
