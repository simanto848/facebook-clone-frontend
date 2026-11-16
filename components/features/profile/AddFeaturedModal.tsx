import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Dialog, Input, Button } from "@/components/ui";

export interface AddFeaturedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddHighlight: (title: string, image?: string) => void;
}

const DEFAULT_FEATURED_PRESETS = [
  "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300",
  "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=300",
  "https://images.unsplash.com/photo-1778192391493-7436d746b128?w=300",
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=300",
];

export function AddFeaturedModal({
  isOpen,
  onClose,
  onAddHighlight,
}: AddFeaturedModalProps) {
  const [title, setTitle] = useState("");
  const [image, setImage] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setImage("");
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddHighlight(title.trim(), image.trim());
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Add to Featured Highlights"
      description="Pin favorite memories, collections, or project showcases to your profile."
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Highlight Title
          </label>
          <Input
            type="text"
            placeholder="e.g. Vacation 2026, Design Lab, Photography"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Cover Image URL (optional)
          </label>
          <Input
            type="url"
            placeholder="https://images.unsplash.com/photo-..."
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />
        </div>

        {/* Quick preset thumbnail options */}
        <div className="space-y-1.5">
          <span className="text-[11px] text-slate-400">Or pick an image:</span>
          <div className="grid grid-cols-4 gap-2">
            {DEFAULT_FEATURED_PRESETS.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setImage(img)}
                className="relative h-14 rounded-lg overflow-hidden border border-slate-700 hover:border-blue-500 transition cursor-pointer"
              >
                <Image src={img} fill className="object-cover" alt="" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1f2937]">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!title.trim()}
          >
            Save Highlight
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

export default AddFeaturedModal;
