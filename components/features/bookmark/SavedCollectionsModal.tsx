"use client";

import React, { useState } from "react";
import { FolderPlus, Folder, Check, Search, X, Trash2 } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [newFolder, setNewFolder] = useState("");
  const [selectedCollection, setSelectedCollection] = useState<string>("c1");

  const handleDeleteCollection = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setCollections((prev) => prev.filter((c) => c.id !== id));
    if (selectedCollection === id) {
      setSelectedCollection("c1");
    }
  };

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

        {/* Search Bar */}
        {collections.length > 2 && (
          <div className="relative flex items-center">
            <Search size={13} className="absolute left-3 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search collections..."
              className="w-full h-8 pl-8 pr-7 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white placeholder:text-slate-500 outline-none focus:border-blue-500 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>
        )}

        {/* Existing Collections */}
        {(() => {
          const filtered = collections.filter((c) =>
            !searchQuery.trim() || c.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
          );

          if (filtered.length === 0) {
            return (
              <div className="py-6 text-center text-slate-400 text-xs bg-slate-900/30 rounded-xl border border-slate-800">
                No collections match &ldquo;{searchQuery}&rdquo;.
              </div>
            );
          }

          return (
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
              {filtered.map((col) => {
                const isSelected = selectedCollection === col.id;
                const isCustom = !["c1", "c2", "c3"].includes(col.id);

                return (
                  <div
                    key={col.id}
                    onClick={() => setSelectedCollection(col.id)}
                    className={`group flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
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
                      {isCustom && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteCollection(e, col.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition cursor-pointer opacity-0 group-hover:opacity-100"
                          title="Delete collection"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}

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
