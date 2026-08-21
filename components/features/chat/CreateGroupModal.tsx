"use client";

import React, { useState, useEffect } from "react";
import { Users, Search, Check, X, Loader2 } from "lucide-react";
import { Dialog, Button, Input, Avatar, Checkbox } from "@/components/ui";
import { friendshipService } from "@/services/friendshipService";
import { messageService } from "@/services/messageService";
import { useChatStore } from "@/store/chatStore";

interface FriendItem {
  id: string;
  name: string;
  avatar: string;
  username?: string;
}

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateGroupModal({ isOpen, onClose }: CreateGroupModalProps) {
  const [groupTitle, setGroupTitle] = useState("");
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { fetchConversations, setActiveConversationId } = useChatStore();

  useEffect(() => {
    if (!isOpen) return;

    const loadFriends = async () => {
      setLoading(true);
      try {
        const res = await friendshipService.getFriends();
        const items = res.data || res || [];
        if (Array.isArray(items) && items.length > 0) {
          const parsed: FriendItem[] = items.map((f: any) => {
            const u = f.user || f;
            return {
              id: u.id,
              name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.displayName || u.username || "Friend",
              avatar: u.avatarUrl || u.profilePicture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
              username: u.username,
            };
          });
          setFriends(parsed);
        }
      } catch (err) {
        console.error("Error loading friends for group modal:", err);
      } finally {
        setLoading(false);
      }
    };

    loadFriends();
  }, [isOpen]);

  const toggleSelectUser = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupTitle.trim() || selectedUserIds.length === 0) return;

    setSubmitting(true);
    try {
      const res = await messageService.createGroupConversation({
        title: groupTitle.trim(),
        recipientIds: selectedUserIds,
      });

      const newConvId = res?.data?.id || res?.id;
      await fetchConversations();

      if (newConvId) {
        setActiveConversationId(newConvId);
      }

      setGroupTitle("");
      setSelectedUserIds([]);
      onClose();
    } catch (err) {
      console.error("Error creating group:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredFriends = friends.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.username && f.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="md" showHeader={false}>
      <form onSubmit={handleCreateGroup} className="space-y-4 p-6 bg-[#111827] rounded-3xl border border-[#1f2937] text-white select-none">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#1f2937] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Create Group Chat</h2>
              <p className="text-xs text-slate-400">Add friends to a shared group conversation</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-[#1f2937] transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Group Name Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Group Name</label>
          <Input
            placeholder="e.g. Design Team, Weekend Hangout"
            value={groupTitle}
            onChange={(e) => setGroupTitle(e.target.value)}
            className="bg-[#1f2937] border-[#374151]"
            required
          />
        </div>

        {/* Friend Search Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">Add Members</label>
            <span className="text-[11px] text-blue-400 font-mono font-semibold">
              {selectedUserIds.length} Selected
            </span>
          </div>

          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-[#1f2937] border-[#374151] h-9 text-xs"
            />
          </div>
        </div>

        {/* Members Checklist */}
        <div className="max-h-56 overflow-y-auto space-y-1 custom-scrollbar pr-1">
          {loading ? (
            <div className="flex items-center justify-center p-6 text-slate-400 gap-2">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-xs">Loading friends...</span>
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No friends found to add.
            </div>
          ) : (
            filteredFriends.map((friend) => {
              const isSelected = selectedUserIds.includes(friend.id);
              return (
                <div
                  key={friend.id}
                  onClick={() => toggleSelectUser(friend.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl transition cursor-pointer border ${
                    isSelected
                      ? "bg-blue-600/15 border-blue-500/40"
                      : "bg-[#1f2937]/50 border-transparent hover:bg-[#1f2937]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar src={friend.avatar} name={friend.name} size="sm" />
                    <div>
                      <p className="text-xs font-bold text-white leading-tight">{friend.name}</p>
                      {friend.username && <p className="text-[10px] text-slate-400">@{friend.username}</p>}
                    </div>
                  </div>

                  <div className={`flex h-5 w-5 items-center justify-center rounded-md border transition ${
                    isSelected ? "bg-blue-500 border-blue-400 text-white" : "border-slate-600 bg-slate-800"
                  }`}>
                    {isSelected && <Check size={12} />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1f2937]">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={submitting}
            disabled={!groupTitle.trim() || selectedUserIds.length === 0}
            className="bg-blue-600 hover:bg-blue-500"
          >
            Create Group ({selectedUserIds.length})
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
