"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, Minimize2, Maximize2, Send, Phone, Video, MoreVertical, BellOff, Trash2, User } from "lucide-react";
import { useChatStore, ChatBox } from "@/store/chatStore";
import { Avatar, Button, Input } from "@/components/ui";
import { CallModal } from "./CallModal";
import { messageService } from "@/services/messageService";

import { useSocketContext } from "@/components/providers/SocketProvider";

function ChatTab({ box }: { box: ChatBox }) {
  const router = useRouter();
  const { closeChat, toggleCollapse, sendMessage } = useChatStore();
  const { socket, typingUsers } = useSocketContext();
  const [inputText, setInputText] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [activeCall, setActiveCall] = useState<"audio" | "video" | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputText(value);

    if (socket && box.id) {
      socket.emit("typing_start", { conversationId: box.id, recipientId: box.id });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typing_stop", { conversationId: box.id, recipientId: box.id });
      }, 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const text = inputText;
    sendMessage(box.id, text);
    setInputText("");

    if (socket && box.id) {
      socket.emit("typing_stop", { conversationId: box.id, recipientId: box.id });
    }

    try {
      await messageService.sendMessage(box.id, { content: text });
    } catch (err) {
      console.error("Message API error, fallback local state:", err);
    }
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/profile/${box.id}`);
  };

  useEffect(() => {
    if (!box.isCollapsed) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [box.messages, box.isCollapsed]);

  return (
    <>
      <div
        className={`
          relative w-80 bg-[#111827] border border-[#1f2937] rounded-t-2xl shadow-2xl flex flex-col transition-all duration-200 pointer-events-auto overflow-hidden
          ${box.isCollapsed ? "h-12" : "h-[420px]"}
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
                  closeChat(box.id);
                  setShowMenu(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-red-400 hover:bg-red-500/10 transition text-left"
              >
                <Trash2 size={13} />
                <span>Close Chat</span>
              </button>
            </div>
          </>
        )}

        {/* Tab Header */}
        <div
          onClick={() => toggleCollapse(box.id)}
          className="flex h-12 items-center justify-between border-b border-[#1f2937] bg-[#1f2937]/50 px-3 cursor-pointer select-none"
        >
          <div className="flex items-center gap-2.5 min-w-0" onClick={handleProfileClick}>
            <Avatar src={box.avatar} name={box.name} size="sm" online />
            <span className="text-xs font-bold text-white truncate max-w-[100px]">{box.name}</span>
          </div>

          <div className="flex items-center gap-1 text-slate-400" onClick={(e) => e.stopPropagation()}>
            {!box.isCollapsed && (
              <>
                <button
                  onClick={() => setActiveCall("audio")}
                  className="hover:text-blue-400 p-1 rounded-md transition"
                  title="Audio call"
                >
                  <Phone size={14} />
                </button>
                <button
                  onClick={() => setActiveCall("video")}
                  className="hover:text-blue-400 p-1 rounded-md transition"
                  title="Video call"
                >
                  <Video size={14} />
                </button>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="hover:text-white p-1 rounded-md transition"
                  title="More options"
                >
                  <MoreVertical size={14} />
                </button>
              </>
            )}
            <button
              onClick={() => toggleCollapse(box.id)}
              className="hover:text-white p-1 rounded-md transition"
              title={box.isCollapsed ? "Expand" : "Minimize"}
            >
              {box.isCollapsed ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
            </button>
            <button
              onClick={() => closeChat(box.id)}
              className="hover:text-red-400 p-1 rounded-md transition"
              title="Close chat"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Messages Body */}
        {!box.isCollapsed && (
          <>
            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
              {box.messages.map((msg, idx) => {
                const isCallMsg = msg.text.startsWith("📞") || msg.text.startsWith("📹");

                if (isCallMsg) {
                  return (
                    <div key={idx} className="flex flex-col items-center justify-center my-1.5">
                      <div className="flex items-center gap-1.5 rounded-full bg-[#1f2937]/80 border border-[#374151]/50 px-3 py-1 text-[11px] text-slate-300 shadow-xs">
                        <span>{msg.text}</span>
                        <span className="text-[9px] text-slate-500">• {msg.time}</span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={idx}
                    className={`flex flex-col ${msg.sender === "me" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                        msg.sender === "me"
                          ? "bg-blue-600 text-white rounded-br-xs"
                          : "bg-[#1f2937] text-slate-200 rounded-bl-xs"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-slate-500 mt-1 px-1">{msg.time}</span>
                  </div>
                );
              })}

              {typingUsers[box.id] && (
                <div className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1f2937] text-slate-400 rounded-2xl rounded-bl-xs text-xs w-fit">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="p-2.5 border-t border-[#1f2937] bg-[#111827]">
              <div className="flex items-center gap-1.5">
                <Input
                  placeholder="Type a message..."
                  value={inputText}
                  onChange={handleInputChange}
                  className="h-9 text-xs bg-[#1f2937]"
                />
                <Button variant="primary" size="sm" type="submit" className="h-9 px-3 shrink-0">
                  <Send size={13} />
                </Button>
              </div>
            </form>
          </>
        )}
      </div>

      {/* CALL MODAL */}
      {activeCall && (
        <CallModal
          isOpen={Boolean(activeCall)}
          onClose={() => setActiveCall(null)}
          recipient={{ id: box.id, name: box.name, avatar: box.avatar }}
          callType={activeCall}
        />
      )}
    </>
  );
}

export default function ChatTabsContainer() {
  const { openChatBoxes } = useChatStore();

  if (!openChatBoxes || openChatBoxes.length === 0) return null;

  return (
    <div className="fixed bottom-0 right-6 z-50 flex items-end gap-3 pointer-events-none">
      {openChatBoxes.map((box: ChatBox) => (
        <ChatTab key={box.id} box={box} />
      ))}
    </div>
  );
}
