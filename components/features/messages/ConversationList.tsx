"use client";

import React, { useEffect, useState } from "react";
import { Search, Users, X, CheckCheck, MessageSquare, Pin } from "lucide-react";
import Image from "next/image";
import { useChatStore } from "@/store/chatStore";
import { CreateGroupModal } from "../chat/CreateGroupModal";

export default function ConversationList() {
  const { conversations, activeConversationId, setActiveConversationId, fetchConversations, markConversationAsRead } = useChatStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "unread" | "online" | "groups">("all");
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);

  useEffect(() => {
    fetchConversations();
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("pinned_conversations");
        if (stored) setPinnedIds(JSON.parse(stored));
      } catch {}
    }
  }, [fetchConversations]);

  const togglePin = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setPinnedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id];
      if (typeof window !== "undefined") {
        localStorage.setItem("pinned_conversations", JSON.stringify(next));
      }
      return next;
    });
  };

  const unreadCount = conversations.filter((c) => c.hasUnread).length;
  const onlineCount = conversations.filter((c) => c.online).length;
  const groupsCount = conversations.filter((c) => c.id.startsWith("group_") || (c as any).isGroup).length;

  const handleMarkAllAsRead = () => {
    conversations
      .filter((c) => c.hasUnread)
      .forEach((c) => {
        markConversationAsRead(c.id);
      });
  };

  const filteredConversations = conversations.filter((c) => {
    if (filterTab === "unread" && !c.hasUnread) return false;
    if (filterTab === "online" && !c.online) return false;
    if (filterTab === "groups" && !(c.id.startsWith("group_") || (c as any).isGroup)) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchesName = c.name.toLowerCase().includes(q);
    const matchesMessage = c.messages.some((m) => m.text?.toLowerCase().includes(q));
    return matchesName || matchesMessage;
  });

  const sortedConversations = [...filteredConversations].sort((a, b) => {
    const aPinned = pinnedIds.includes(a.id) ? 1 : 0;
    const bPinned = pinnedIds.includes(b.id) ? 1 : 0;
    return bPinned - aPinned;
  });

  return (
    <div className="h-full">
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Messages</h1>

          <button
            onClick={() => setIsGroupModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-500/30 transition text-xs font-bold cursor-pointer"
            title="Create new group chat"
          >
            <Users size={14} />
            <span>+ Group</span>
          </button>
        </div>

        {/* Search input with clear button */}
        <div className="flex items-center rounded-xl bg-[#1f2937] px-4 relative">
          <Search size={16} className="text-slate-400 shrink-0" />

          <input
            placeholder="Search messages or people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 flex-1 bg-transparent px-3 text-white outline-none text-xs placeholder:text-slate-500"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-slate-400 hover:text-white p-1 transition cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5">
            {[
              { id: "all" as const, label: "All", count: conversations.length },
              { id: "unread" as const, label: "Unread", count: unreadCount },
              { id: "online" as const, label: "Online", count: onlineCount },
              { id: "groups" as const, label: "Groups", count: groupsCount },
            ].map((tab) => {
              const isActive = filterTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterTab(tab.id)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-[#1f2937]/70 text-slate-400 hover:text-white hover:bg-[#1f2937]"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isActive ? "bg-white/20 text-white" : "bg-slate-700 text-slate-400"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition font-medium whitespace-nowrap px-1"
              title="Mark all conversations as read"
            >
              <CheckCheck size={13} />
              <span>Read all</span>
            </button>
          )}
        </div>
      </div>

      <CreateGroupModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
      />

      <div className="space-y-1 px-3">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <p className="text-xs font-semibold text-slate-300">No conversations found</p>
            <p className="text-[11px] text-slate-500">
              {searchQuery
                ? `No messages or contacts match "${searchQuery}".`
                : filterTab === "unread"
                ? "You're all caught up! No unread conversations."
                : filterTab === "online"
                ? "None of your friends are currently active."
                : "Search for friends or send a message to start chatting."}
            </p>
          </div>
        ) : (
          sortedConversations.map((user) => {
            const isActive = user.id === activeConversationId;
            const isPinned = pinnedIds.includes(user.id);
            const lastMsg = user.messages[user.messages.length - 1];

            return (
              <div
                key={user.id}
                className={`group relative flex w-full items-center gap-3 rounded-xl p-3 text-left transition cursor-pointer ${
                  isActive ? "bg-[#1f2937]" : "hover:bg-[#1f2937]/50"
                }`}
                onClick={() => setActiveConversationId(user.id)}
              >
                <div className="relative shrink-0">
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full object-cover"
                  />

                  {user.online && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#111827] bg-green-500" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <h3 className="font-medium text-white text-sm truncate">{user.name}</h3>
                      {isPinned && (
                        <Pin size={11} className="text-blue-400 rotate-45 shrink-0 fill-blue-400" />
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {lastMsg && <span className="text-[10px] text-slate-500">{lastMsg.time}</span>}
                      <button
                        type="button"
                        onClick={(e) => togglePin(e, user.id)}
                        className={`p-1 rounded-md text-xs transition cursor-pointer opacity-0 group-hover:opacity-100 ${
                          isPinned ? "opacity-100 text-blue-400 hover:text-blue-300" : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                        }`}
                        title={isPinned ? "Unpin conversation" : "Pin conversation to top"}
                      >
                        <Pin size={12} className={isPinned ? "fill-blue-400 rotate-45" : ""} />
                      </button>
                    </div>
                  </div>

                  <p className={`truncate text-xs ${isActive ? "text-slate-200" : "text-slate-400"}`}>
                    {lastMsg ? `${lastMsg.sender === "me" ? "You: " : ""}${lastMsg.text}` : "No messages yet"}
                  </p>
                </div>

                {user.hasUnread && (
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500 shrink-0 self-center" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
