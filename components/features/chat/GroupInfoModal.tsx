"use client";

import React, { useState } from "react";
import { Users, Shield, ShieldAlert, LogOut, UserMinus, X } from "lucide-react";
import { Dialog, Button, Avatar, Badge } from "@/components/ui";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";

interface GroupParticipant {
  id: string;
  name: string;
  avatar: string;
  role: "ADMIN" | "MEMBER";
}

interface GroupInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupTitle: string;
  participants: GroupParticipant[];
  groupId: string;
}

export function GroupInfoModal({
  isOpen,
  onClose,
  groupTitle,
  participants = [],
  groupId,
}: GroupInfoModalProps) {
  const currentUser = useAuthStore((state) => state.user);
  const { conversations, setActiveConversationId, fetchConversations } = useChatStore();

  const isCurrentUserAdmin = participants.some(
    (p) => p.id === currentUser?.id && p.role === "ADMIN"
  );

  const handleLeaveGroup = async () => {
    setActiveConversationId(null);
    await fetchConversations();
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="md" showHeader={false}>
      <div className="space-y-5 p-6 bg-[#111827] rounded-3xl border border-[#1f2937] text-white select-none">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1f2937] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 font-bold text-lg">
              <Users size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{groupTitle}</h2>
              <p className="text-xs text-slate-400">{participants.length} Members</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-[#1f2937] transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Member List */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Group Members</h3>
          <div className="max-h-60 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
            {participants.map((member) => {
              const isSelf = member.id === currentUser?.id;
              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#1f2937]/50 border border-[#1f2937] hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <Avatar src={member.avatar} name={member.name} size="sm" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-white">{member.name}</p>
                        {isSelf && <span className="text-[10px] text-blue-400 font-semibold">(You)</span>}
                      </div>
                      <span className="text-[10px] text-slate-400">Joined Group</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {member.role === "ADMIN" ? (
                      <Badge variant="primary" className="flex items-center gap-1 bg-blue-600/20 text-blue-400 border border-blue-500/30">
                        <Shield size={10} />
                        <span>Admin</span>
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Member</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-[#1f2937]">
          <Button
            variant="danger"
            size="sm"
            onClick={handleLeaveGroup}
            className="flex items-center gap-1.5 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white border border-red-500/30 cursor-pointer"
          >
            <LogOut size={14} />
            <span>Leave Group</span>
          </Button>

          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
