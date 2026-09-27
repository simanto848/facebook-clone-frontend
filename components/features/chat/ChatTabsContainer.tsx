"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, Minimize2, Maximize2, Send, Phone, Video, MoreVertical, Bell, BellOff, Trash2, User, ThumbsUp, ExternalLink, Check } from "lucide-react";
import { useChatStore, ChatBox } from "@/store/chatStore";
import { Avatar, Button, Input } from "@/components/ui";
import { CallModal } from "./CallModal";
import { messageService } from "@/services/messageService";
import { AudioPlayer } from "@/components/ui/AudioPlayer";
import { useSocketContext } from "@/components/providers/SocketProvider";

function ChatTab({ box }: { box: ChatBox }) {
  const router = useRouter();
  const { closeChat, toggleCollapse, sendMessage, clearConversationMessages } = useChatStore();
  const { socket, typingUsers } = useSocketContext();
  const [inputText, setInputText] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [activeCall, setActiveCall] = useState<"audio" | "video" | null>(null);

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !isMuted;
    setIsMuted(next);
    setToastMsg(next ? "Notifications muted" : "Notifications unmuted");
    setShowMenu(false);
    setTimeout(() => setToastMsg(null), 2200);
  };
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const text = inputText;
    sendMessage(box.id, text);
    setInputText("");

    if (socket && box.id) {
      socket.emit("typing_stop", { conversationId: box.id, recipientId: box.id });
    }
  };

  const handleQuickLike = () => {
    sendMessage(box.id, "👍");
    if (socket && box.id) {
      socket.emit("typing_stop", { conversationId: box.id, recipientId: box.id });
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
        {/* Inline Action Toast */}
        {toastMsg && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-40 px-3 py-1 rounded-full bg-black/90 backdrop-blur-md border border-white/20 text-white text-[11px] font-medium shadow-xl pointer-events-none animate-in fade-in zoom-in-95 duration-150 flex items-center gap-1.5">
            <Check size={12} className="text-emerald-400" />
            <span>{toastMsg}</span>
          </div>
        )}

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
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-slate-300 hover:bg-[#1f2937] hover:text-white transition text-left cursor-pointer"
              >
                <User size={13} />
                <span>View Profile</span>
              </button>
              <button
                onClick={() => {
                  useChatStore.getState().setActiveConversationId(box.id);
                  router.push("/messages");
                  setShowMenu(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-slate-300 hover:bg-[#1f2937] hover:text-white transition text-left cursor-pointer"
              >
                <ExternalLink size={13} />
                <span>Open in Messenger</span>
              </button>
              <button
                onClick={handleToggleMute}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-slate-300 hover:bg-[#1f2937] hover:text-white transition text-left cursor-pointer"
              >
                {isMuted ? <Bell size={13} className="text-blue-400" /> : <BellOff size={13} />}
                <span>{isMuted ? "Unmute Notifications" : "Mute Notifications"}</span>
              </button>
              <button
                onClick={() => {
                  if (confirm("Clear all messages in this chat?")) {
                    clearConversationMessages(box.id);
                  }
                  setShowMenu(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-rose-400 hover:bg-rose-500/10 transition text-left cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Clear Chat History</span>
              </button>
              <button
                onClick={() => {
                  closeChat(box.id);
                  setShowMenu(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-slate-300 hover:bg-[#1f2937] hover:text-white transition text-left cursor-pointer"
              >
                <X size={13} />
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
                  onClick={() => useChatStore.getState().startCall({ id: box.id, name: box.name, avatar: box.avatar }, "audio")}
                  className="hover:text-blue-400 p-1 rounded-md transition cursor-pointer"
                  title="Audio call"
                >
                  <Phone size={14} />
                </button>
                <button
                  onClick={() => useChatStore.getState().startCall({ id: box.id, name: box.name, avatar: box.avatar }, "video")}
                  className="hover:text-blue-400 p-1 rounded-md transition cursor-pointer"
                  title="Video call"
                >
                  <Video size={14} />
                </button>
                <button
                  onClick={() => {
                    useChatStore.getState().setActiveConversationId(box.id);
                    router.push("/messages");
                  }}
                  className="hover:text-blue-400 p-1 rounded-md transition cursor-pointer"
                  title="Open in full Messenger"
                >
                  <ExternalLink size={13} />
                </button>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="hover:text-white p-1 rounded-md transition cursor-pointer"
                  title="More options"
                >
                  <MoreVertical size={14} />
                </button>
              </>
            )}
            <button
              onClick={() => toggleCollapse(box.id)}
              className="hover:text-white p-1 rounded-md transition cursor-pointer"
              title={box.isCollapsed ? "Expand" : "Minimize"}
            >
              {box.isCollapsed ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
            </button>
            <button
              onClick={() => closeChat(box.id)}
              className="hover:text-red-400 p-1 rounded-md transition cursor-pointer"
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
                const isCallMsg =
                  msg.text.includes("📞") ||
                  msg.text.includes("📹") ||
                  msg.text.toLowerCase().includes("call");

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

                const isMe = msg.sender === "me";

                return (
                  <div
                    key={idx}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    {msg.text.startsWith("data:audio/") || msg.text.includes(".webm") || msg.text.includes("[Voice Note]") ? (
                      <AudioPlayer src={msg.text} isMe={isMe} />
                    ) : msg.text.startsWith("data:image/") || msg.text.match(/\.(png|jpg|jpeg|webp|gif)$/i) ? (
                      <div className="relative rounded-2xl overflow-hidden max-w-[200px] border border-white/10 shadow-lg">
                        <img src={msg.text} className="w-full max-h-48 object-cover" alt="Attachment" />
                      </div>
                    ) : msg.text.startsWith("data:video/") || msg.text.match(/\.(mp4|webm|mov)$/i) ? (
                      <div className="relative rounded-2xl overflow-hidden max-w-[200px] border border-white/10 shadow-lg bg-black">
                        <video src={msg.text} controls className="w-full max-h-48 object-cover" />
                      </div>
                    ) : (
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                          isMe
                            ? "bg-blue-600 text-white rounded-br-xs"
                            : "bg-[#1f2937] text-slate-200 rounded-bl-xs"
                        }`}
                      >
                        {msg.text}
                      </div>
                    )}
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
                {inputText.trim() ? (
                  <Button variant="primary" size="sm" type="submit" className="h-9 px-3 shrink-0">
                    <Send size={13} />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={handleQuickLike}
                    className="h-9 px-3 shrink-0 text-blue-400 hover:text-blue-300 hover:bg-blue-600/10 cursor-pointer"
                    title="Send Like"
                  >
                    <ThumbsUp size={15} className="fill-blue-400" />
                  </Button>
                )}
              </div>
            </form>
          </>
        )}
      </div>
    </>
  );
}

export default function ChatTabsContainer() {
  const { openChatBoxes, closeChat, toggleCollapse } = useChatStore();

  if (!openChatBoxes || openChatBoxes.length === 0) return null;

  const handleMinimizeAll = () => {
    openChatBoxes.forEach((b: ChatBox) => {
      if (!b.isCollapsed) toggleCollapse(b.id);
    });
  };

  const handleCloseAll = () => {
    openChatBoxes.forEach((b: ChatBox) => {
      closeChat(b.id);
    });
  };

  return (
    <div className="fixed bottom-0 right-6 z-50 flex items-end gap-3 pointer-events-none">
      {openChatBoxes.length > 1 && (
        <div className="pointer-events-auto flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#111827] border border-[#1f2937] shadow-2xl mb-1 text-xs select-none">
          <button
            type="button"
            onClick={handleMinimizeAll}
            className="px-2 py-0.5 rounded-lg text-[10px] font-semibold text-slate-300 hover:text-white hover:bg-[#1f2937] transition cursor-pointer"
            title="Minimize all chat tabs"
          >
            Minimize All
          </button>
          <span className="text-slate-600">|</span>
          <button
            type="button"
            onClick={handleCloseAll}
            className="px-2 py-0.5 rounded-lg text-[10px] font-semibold text-slate-400 hover:text-rose-400 hover:bg-[#1f2937] transition cursor-pointer"
            title="Close all chat tabs"
          >
            Close All
          </button>
        </div>
      )}
      {openChatBoxes.map((box: ChatBox) => (
        <ChatTab key={box.id} box={box} />
      ))}
    </div>
  );
}
