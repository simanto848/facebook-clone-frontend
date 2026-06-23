"use client";

import {
  ArrowLeft,
  ImageIcon,
  Info,
  MessageSquare,
  Paperclip,
  Phone,
  Search,
  SendHorizontal,
  Video,
} from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import ChatInfoPanel from "./ChatInfoPanel";
import { useChatStore } from "@/store/chatStore";

export default function ChatWindow() {
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    sendDirectMessage,
  } = useChatStore();

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );

  // Auto scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConversation) return;

    sendDirectMessage(activeConversation.id, messageText);
    setMessageText("");
  };

  if (!activeConversation) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-[#111827] text-slate-400 p-6 text-center">
        <div className="h-16 w-16 rounded-full bg-[#1f2937] flex items-center justify-center text-slate-500 mb-4 border border-[#374151]/30">
          <MessageSquare size={32} />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">No Chat Selected</h3>
        <p className="text-sm text-slate-400 max-w-xs">
          Choose a conversation from the sidebar or start a new message thread.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-[#111827]">
      <div className="flex flex-1 flex-col h-full overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-[#1f2937] px-4 md:px-6 py-4 shrink-0">
          <div className="flex items-center gap-3 md:gap-4">
            {/* Mobile Back Button */}
            <button
              onClick={() => setActiveConversationId(null)}
              className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl bg-[#1f2937] text-slate-400 hover:text-white transition"
            >
              <ArrowLeft size={20} />
            </button>

            {/* Avatar */}
            <div className="relative h-11 w-11 overflow-hidden rounded-full">
              <Image
                src={activeConversation.avatar}
                alt={activeConversation.name}
                fill
                className="object-cover"
              />

              {activeConversation.online && (
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#111827] bg-green-500" />
              )}
            </div>

            {/* User Info */}
            <div>
              <h2 className="font-semibold text-white text-sm md:text-base">{activeConversation.name}</h2>
              <p className="text-xs text-green-400">
                {activeConversation.online ? "Active now" : "Offline"}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-[#1f2937] text-slate-400 transition hover:bg-[#263247] hover:text-white">
              <Search size={18} />
            </button>

            <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1f2937] text-slate-400 transition hover:bg-[#263247] hover:text-white">
              <Phone size={18} />
            </button>

            <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1f2937] text-slate-400 transition hover:bg-[#263247] hover:text-white">
              <Video size={18} />
            </button>

            <button
              onClick={() => setShowInfoPanel(!showInfoPanel)}
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                showInfoPanel
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-[#1f2937] text-slate-400 hover:bg-[#263247] hover:text-white"
              }`}
            >
              <Info size={18} />
            </button>
          </div>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-4">
          {/* Date separator */}
          <div className="mb-6 flex justify-center">
            <span className="rounded-full bg-[#1f2937]/50 border border-[#374151]/30 px-4 py-1 text-xs text-slate-400">
              Active Thread
            </span>
          </div>

          <div className="space-y-4">
            {activeConversation.messages.map((msg, index) => {
              const isMe = msg.sender === "me";
              return (
                <div
                  key={index}
                  className={`flex items-end gap-3 ${isMe ? "justify-end" : ""}`}
                >
                  {!isMe && (
                    <div className="relative h-8 w-8 overflow-hidden rounded-full shrink-0">
                      <Image
                        src={activeConversation.avatar}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="flex flex-col max-w-[70%] sm:max-w-md gap-1">
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm text-white ${
                        isMe
                          ? "rounded-br-none bg-blue-600 shadow-md shadow-blue-600/10"
                          : "rounded-bl-none bg-[#1f2937]"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span
                      className={`text-[10px] text-slate-500 px-1 ${
                        isMe ? "text-right" : "text-left"
                      }`}
                    >
                      {msg.time}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* INPUT */}
        <div className="border-t border-[#1f2937] p-4 shrink-0 bg-[#111827]">
          <form onSubmit={handleSendMessage} className="flex items-center gap-3 rounded-2xl bg-[#1f2937] p-2 md:p-3">
            <button
              type="button"
              className="text-slate-400 transition hover:text-white p-1"
            >
              <Paperclip size={20} />
            </button>

            <button
              type="button"
              className="text-slate-400 transition hover:text-white p-1"
            >
              <ImageIcon size={20} />
            </button>

            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-transparent text-white outline-none placeholder:text-slate-500 text-sm px-2"
            />

            <button
              type="submit"
              disabled={!messageText.trim()}
              className={`rounded-xl p-2 text-white transition ${
                messageText.trim()
                  ? "bg-blue-500 hover:bg-blue-600 cursor-pointer"
                  : "bg-blue-500/35 text-white/50 cursor-not-allowed"
              }`}
            >
              <SendHorizontal size={18} />
            </button>
          </form>
        </div>
      </div>

      {/* Chat Info Sidebar or Panel */}
      {showInfoPanel && (
        <ChatInfoPanel onClose={() => setShowInfoPanel(false)} />
      )}
    </div>
  );
}
