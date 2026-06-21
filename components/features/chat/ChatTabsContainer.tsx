"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, Minimize2, Maximize2, Send, Phone, Video, MoreVertical, BellOff, Search, Trash2, Ban, User } from "lucide-react";
import { useChatStore, ChatBox } from "@/store/chatStore";

function ChatTab({ box }: { box: ChatBox }) {
  const router = useRouter();
  const { closeChat, toggleCollapse, sendMessage } = useChatStore();
  const [inputText, setInputText] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(box.id, inputText);
    setInputText("");
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/profile/${box.id}`);
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    if (!box.isCollapsed) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [box.messages, box.isCollapsed]);

  return (
    <div
      className={`
        relative w-72 bg-[#111827] border border-[#1f2937] rounded-t-2xl shadow-2xl flex flex-col transition-all duration-200 pointer-events-auto
        ${box.isCollapsed ? "h-12" : "h-96"}
      `}
    >
      {/* Options Menu Dropdown */}
      {showMenu && !box.isCollapsed && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} />
          <div className="absolute right-2 top-11 z-40 w-48 rounded-xl border border-[#1f2937] bg-[#111827] p-1 shadow-xl animate-in fade-in slide-in-from-top-1 duration-100 text-xs">
            <button
              onClick={() => {
                router.push(`/profile/${box.id}`);
                setShowMenu(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-slate-300 hover:bg-[#1f2937] hover:text-white transition text-left"
            >
              <User size={13} />
              <span>View Profile</span>
            </button>
            <button
              onClick={() => {
                alert("Muted notifications.");
                setShowMenu(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-slate-300 hover:bg-[#1f2937] hover:text-white transition text-left"
            >
              <BellOff size={13} />
              <span>Mute Notifications</span>
            </button>
            <button
              onClick={() => {
                alert("Search triggered.");
                setShowMenu(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-slate-300 hover:bg-[#1f2937] hover:text-white transition text-left"
            >
              <Search size={13} />
              <span>Search in chat</span>
            </button>
            <button
              onClick={() => {
                closeChat(box.id);
                setShowMenu(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-slate-300 hover:bg-[#1f2937] hover:text-white transition text-left"
            >
              <Trash2 size={13} />
              <span>Delete conversation</span>
            </button>
            <div className="my-1 border-t border-[#1f2937]" />
            <button
              onClick={() => {
                alert("Blocked user.");
                setShowMenu(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-red-400 hover:bg-red-500/10 transition text-left"
            >
              <Ban size={13} />
              <span>Block user</span>
            </button>
          </div>
        </>
      )}

      {/* Header */}
      <div
        onClick={() => toggleCollapse(box.id)}
        className="h-12 px-3 border-b border-[#1f2937]/50 flex items-center justify-between cursor-pointer hover:bg-[#1f2937]/30 select-none bg-[#111827]/80 rounded-t-2xl"
      >
        <div
          onClick={handleProfileClick}
          className="flex items-center gap-2 hover:opacity-80 transition active:scale-95"
          title="View profile"
        >
          <div className="relative h-7 w-7 rounded-full overflow-hidden shrink-0 border border-[#1f2937]">
            <Image src={box.avatar} fill className="object-cover" alt={box.name} />
          </div>
          <span className="text-xs font-bold text-white truncate max-w-[80px]">{box.name}</span>
          <div className="h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
        </div>

        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {!box.isCollapsed && (
            <>
              <button
                onClick={() => alert(`Starting audio call with ${box.name}...`)}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-[#1f2937] transition"
                title="Audio call"
              >
                <Phone size={12} />
              </button>
              <button
                onClick={() => alert(`Starting video call with ${box.name}...`)}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-[#1f2937] transition"
                title="Video call"
              >
                <Video size={12} />
              </button>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className={`p-1 rounded-md transition ${showMenu ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white hover:bg-[#1f2937]"}`}
                title="Options"
              >
                <MoreVertical size={12} />
              </button>
            </>
          )}
          <button
            onClick={() => toggleCollapse(box.id)}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-[#1f2937] transition"
            title={box.isCollapsed ? "Expand" : "Minimize"}
          >
            {box.isCollapsed ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
          </button>
          <button
            onClick={() => closeChat(box.id)}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-[#1f2937] transition"
            title="Close"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Expandable Chat Area */}
      {!box.isCollapsed && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3.5 custom-scrollbar bg-[#111827]/20">
            {box.messages.map((msg, index) => {
              const isMe = msg.sender === "me";
              return (
                <div
                  key={index}
                  className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-1.5`}
                >
                  {!isMe && (
                    <div className="relative h-5 w-5 rounded-full overflow-hidden border border-[#1f2937] shrink-0">
                      <Image src={box.avatar} fill className="object-cover" alt={box.name} />
                    </div>
                  )}

                  <div
                    className={`
                      max-w-[75%] rounded-2xl px-3 py-2 text-[11px] leading-relaxed shadow-xs
                      ${
                        isMe
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-[#1f2937] text-slate-200 rounded-bl-none border border-[#1f2937]"
                      }
                    `}
                  >
                    <p>{msg.text}</p>
                    <span className="text-[8px] text-slate-400/80 block mt-1 text-right">{msg.time}</span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-2.5 border-t border-[#1f2937]/50 flex gap-1.5 bg-[#111827]">
            <input
              type="text"
              placeholder="Aa"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 rounded-full border border-[#1f2937] bg-[#0f172a] px-3.5 py-1.5 text-xs text-white outline-none focus:border-blue-500 transition placeholder:text-slate-500"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full flex items-center justify-center transition shrink-0 shadow-md shadow-blue-600/10"
            >
              <Send size={12} />
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default function ChatTabsContainer() {
  const { openChatBoxes } = useChatStore();

  if (openChatBoxes.length === 0) return null;

  return (
    <div className="fixed bottom-0 right-4 z-50 flex items-end gap-3 pointer-events-none">
      {openChatBoxes.map((box) => (
        <ChatTab key={box.id} box={box} />
      ))}
    </div>
  );
}
