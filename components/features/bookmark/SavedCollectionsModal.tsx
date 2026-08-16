"use client";

import React, { useState } from "react";
import { FolderPlus, Folder, Check } from "lucide-react";
import { Dialog, Input, Button, Badge } from "@/components/ui";

interface CollectionItem {
  id: string;
  name: string;
  count: number;
}

const defaultCollections: CollectionItem[] = [
  { id: "c1", name: "Read Later", count: 5 },
  { id: "c2", name: "Tech Articles", count: 12 },
  { id: "c3", name: "Design Inspo", count: 8 },
];

interface SavedCollectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId?: string;
  onSaveToCollection?: (collectionId: string) => void;
}

export function SavedCollectionsModal({
  isOpen,
  onClose,
  postId,
  onSaveToCollection,
}: SavedCollectionsModalProps) {
  const [collections, setCollections] = useState<CollectionItem[]>(defaultCollections);
  const [newFolder, setNewFolder] = useState("");
  const [selectedCollection, setSelectedCollection] = useState<string>("c1");

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolder.trim()) return;

    const created: CollectionItem = {
      id: `c_${Date.now()}`,
      name: newFolder.trim(),
      count: 1,
    };
    setCollections((prev) => [...prev, created]);
    setSelectedCollection(created.id);
    setNewFolder("");
  };

  const handleSave = () => {
    if (onSaveToCollection) {
      onSaveToCollection(selectedCollection);
    }
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Save to Collection">
      <div className="space-y-4">
        <p className="text-xs text-slate-400">Organize your saved post into a custom bookmark collection folder.</p>

        {/* Existing Collections */}
        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
          {collections.map((col) => {
            const isSelected = selectedCollection === col.id;
            return (
              <div
                key={col.id}
                onClick={() => setSelectedCollection(col.id)}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                  isSelected
                    ? "bg-blue-600/10 border-blue-500 text-white"
                    : "bg-[#111827] border-[#1f2937] text-slate-300 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Folder size={18} className={isSelected ? "text-blue-400" : "text-slate-400"} />
                  <span className="text-xs font-bold">{col.name}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="secondary" size="sm">
                    {col.count} Items
                  </Badge>
                  {isSelected && <Check size={16} className="text-blue-400" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Create New Collection Form */}
        <form onSubmit={handleCreateCollection} className="flex gap-2 pt-2 border-t border-[#1f2937]">
          <Input
            placeholder="New collection name..."
            value={newFolder}
            onChange={(e) => setNewFolder(e.target.value)}
            className="h-9 text-xs bg-[#111827]"
          />
          <Button variant="secondary" size="sm" type="submit" leftIcon={<FolderPlus size={14} />}>
            Create
          </Button>
        </form>

        <div className="flex justify-end gap-2 pt-3 border-t border-[#1f2937]">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Post
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
