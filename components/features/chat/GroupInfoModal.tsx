"use client";

import React, { useState } from "react";
import { Users, Shield, ShieldAlert, LogOut, UserMinus, X, Edit3, Check, UserPlus } from "lucide-react";
import { Dialog, Button, Avatar, Badge, Input } from "@/components/ui";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { groupChatService } from "@/services/groupChatService";
import { friendshipService, FriendUser } from "@/services/friendshipService";

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
  groupTitle: initialTitle,
  participants: initialParticipants = [],
  groupId,
}: GroupInfoModalProps) {
  const currentUser = useAuthStore((state) => state.user);
  const { setActiveConversationId, fetchConversations } = useChatStore();

  const [groupTitle, setGroupTitle] = useState(initialTitle);
  const [participants, setParticipants] = useState<GroupParticipant[]>(initialParticipants);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(initialTitle);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [friendsList, setFriendsList] = useState<FriendUser[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [customInput, setCustomInput] = useState("");

  const isCurrentUserAdmin = participants.some(
    (p) => p.id === currentUser?.id && p.role === "ADMIN"
  );

  const handleOpenAdd = async () => {
    setIsAddOpen((prev) => !prev);
    if (!isAddOpen && friendsList.length === 0) {
      setLoadingFriends(true);
      try {
        const res = await friendshipService.getFriends();
        const raw = res.data?.friends || res.data || res.friends || res || [];
        if (Array.isArray(raw)) {
          setFriendsList(raw);
        }
      } catch (e) {
        console.warn("Could not load friends list, using fallbacks:", e);
        setFriendsList([
          { id: "f1", name: "David Miller", username: "davidm", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" },
          { id: "f2", name: "Emma Watson", username: "emmaw", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" },
        ]);
      } finally {
        setLoadingFriends(false);
      }
    }
  };

  const handleAddParticipant = async (userToAdd: { id: string; name: string; avatar?: string }) => {
    setAddingId(userToAdd.id);
    const newParticipant: GroupParticipant = {
      id: userToAdd.id,
      name: userToAdd.name,
      avatar: userToAdd.avatar || "/avatars/default.png",
      role: "MEMBER",
    };
    setParticipants((prev) => [...prev, newParticipant]);
    try {
      await groupChatService.addParticipants(groupId, [userToAdd.id]);
      await fetchConversations();
    } catch (e) {
      console.error("Failed to add participant:", e);
    } finally {
      setAddingId(null);
    }
  };

  const handleUpdateTitle = async () => {
    if (!titleInput.trim() || titleInput === groupTitle) {
      setIsEditingTitle(false);
      return;
    }
    try {
      await groupChatService.updateGroupChatTitle(groupId, titleInput.trim());
      setGroupTitle(titleInput.trim());
      await fetchConversations();
    } catch (e) {
      console.error("Failed to update group title:", e);
    } finally {
      setIsEditingTitle(false);
    }
  };

  const handleRemoveParticipant = async (userId: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== userId));
    try {
      await groupChatService.removeParticipant(groupId, userId);
      await fetchConversations();
    } catch (e) {
      console.error("Failed to remove participant:", e);
    }
  };

  const handleToggleRole = async (userId: string, currentRole: "ADMIN" | "MEMBER") => {
    const newRole = currentRole === "ADMIN" ? "MEMBER" : "ADMIN";
    setParticipants((prev) =>
      prev.map((p) => (p.id === userId ? { ...p, role: newRole } : p))
    );
    try {
      await groupChatService.updateParticipantRole(groupId, userId, newRole);
      await fetchConversations();
    } catch (e) {
      console.error("Failed to update participant role:", e);
    }
  };

  const handleLeaveGroup = async () => {
    setIsLeaving(true);
    try {
      await groupChatService.leaveGroupChat(groupId);
    } catch (e) {
      console.error("Error leaving group:", e);
    } finally {
      setIsLeaving(false);
      setActiveConversationId(null);
      await fetchConversations();
      onClose();
    }
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
              {isEditingTitle ? (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Input
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    className="h-7 text-xs bg-slate-800 border-slate-700 py-0.5"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleUpdateTitle}
                    className="p-1 rounded bg-blue-600 hover:bg-blue-500 text-white"
                  >
                    <Check size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">{groupTitle}</h2>
                  {isCurrentUserAdmin && (
                    <button
                      type="button"
                      onClick={() => setIsEditingTitle(true)}
                      className="p-1 text-slate-400 hover:text-white"
                      title="Edit group title"
                    >
                      <Edit3 size={13} />
                    </button>
                  )}
                </div>
              )}
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
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Group Members</h3>
            {isCurrentUserAdmin && (
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<UserPlus size={13} />}
                onClick={handleOpenAdd}
                className="text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-600/10 h-7 px-2.5"
              >
                {isAddOpen ? "Close" : "Add Member"}
              </Button>
            )}
          </div>

          {/* Add Member Panel */}
          {isAddOpen && (
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Add People to Group</span>
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="flex gap-1.5">
                <Input
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Enter user ID or name..."
                  className="h-8 text-xs bg-slate-800 border-slate-700 flex-1"
                />
                <Button
                  size="sm"
                  disabled={!customInput.trim()}
                  onClick={() => {
                    handleAddParticipant({ id: customInput.trim(), name: customInput.trim() });
                    setCustomInput("");
                  }}
                  className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-500"
                >
                  Add
                </Button>
              </div>

              {loadingFriends ? (
                <div className="text-center py-2 text-xs text-slate-400">Loading friends...</div>
              ) : (
                (() => {
                  const availableFriends = friendsList.filter(
                    (f) => !participants.some((p) => p.id === f.id)
                  );
                  if (availableFriends.length === 0) return null;
                  return (
                    <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">From Friends</span>
                      {availableFriends.map((friend) => (
                        <div
                          key={friend.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 transition"
                        >
                          <div className="flex items-center gap-2">
                            <Avatar
                              src={friend.avatar || friend.profilePicture || friend.avatarUrl}
                              name={friend.name || friend.username || "Friend"}
                              size="xs"
                            />
                            <span className="text-xs text-white">{friend.name || friend.username}</span>
                          </div>
                          <Button
                            size="sm"
                            loading={addingId === friend.id}
                            onClick={() =>
                              handleAddParticipant({
                                id: friend.id,
                                name: friend.name || friend.username || "Friend",
                                avatar: friend.avatar || friend.profilePicture || friend.avatarUrl,
                              })
                            }
                            className="h-6 px-2 text-[11px] bg-blue-600 hover:bg-blue-500"
                          >
                            Add
                          </Button>
                        </div>
                      ))}
                    </div>
                  );
                })()
              )}
            </div>
          )}
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
                    {isCurrentUserAdmin && !isSelf ? (
                      <button
                        type="button"
                        onClick={() => handleToggleRole(member.id, member.role)}
                        className="cursor-pointer transition hover:opacity-80"
                        title={`Click to ${member.role === "ADMIN" ? "demote to Member" : "promote to Admin"}`}
                      >
                        {member.role === "ADMIN" ? (
                          <Badge variant="primary" className="flex items-center gap-1 bg-blue-600/20 text-blue-400 border border-blue-500/30">
                            <Shield size={10} />
                            <span>Admin</span>
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="hover:bg-slate-700">
                            Member
                          </Badge>
                        )}
                      </button>
                    ) : member.role === "ADMIN" ? (
                      <Badge variant="primary" className="flex items-center gap-1 bg-blue-600/20 text-blue-400 border border-blue-500/30">
                        <Shield size={10} />
                        <span>Admin</span>
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Member</Badge>
                    )}
                    {isCurrentUserAdmin && !isSelf && (
                      <button
                        type="button"
                        onClick={() => handleRemoveParticipant(member.id)}
                        className="p-1 text-slate-400 hover:text-rose-400 hover:bg-white/5 rounded-lg transition"
                        title="Remove member"
                      >
                        <UserMinus size={13} />
                      </button>
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
            loading={isLeaving}
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
