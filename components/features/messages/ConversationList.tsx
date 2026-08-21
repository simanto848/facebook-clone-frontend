"use client";

import React, { useEffect, useState } from "react";
import { Search, Users, Plus } from "lucide-react";
import Image from "next/image";
import { useChatStore } from "@/store/chatStore";
import { CreateGroupModal } from "../chat/CreateGroupModal";

export default function ConversationList() {
  const { conversations, activeConversationId, setActiveConversationId, fetchConversations } = useChatStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

        <div className="flex items-center rounded-xl bg-[#1f2937] px-4">
          <Search size={18} className="text-slate-400" />

          <input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 flex-1 bg-transparent px-3 text-white outline-none text-xs"
          />
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
            <p className="text-[11px] text-slate-500">Search for friends or send a message to start chatting.</p>
          </div>
        ) : (
          filteredConversations.map((user) => {
            const isActive = user.id === activeConversationId;
            const lastMsg = user.messages[user.messages.length - 1];

            return (
              <button
                key={user.id}
                onClick={() => setActiveConversationId(user.id)}
                className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${
                  isActive ? "bg-[#1f2937]" : "hover:bg-[#1f2937]/50"
                }`}
              >
                <div className="relative">
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
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-white text-sm truncate">{user.name}</h3>
                    {lastMsg && <span className="text-[10px] text-slate-500 shrink-0">{lastMsg.time}</span>}
                  </div>

                  <p className={`truncate text-xs ${isActive ? "text-slate-200" : "text-slate-400"}`}>
                    {lastMsg ? `${lastMsg.sender === "me" ? "You: " : ""}${lastMsg.text}` : "No messages yet"}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
