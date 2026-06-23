import { Search } from "lucide-react";
import Image from "next/image";
import { useChatStore } from "@/store/chatStore";

export default function ConversationList() {
  const { conversations, activeConversationId, setActiveConversationId } = useChatStore();

  return (
    <div className="h-full">
      <div className="p-5">
        <h1 className="text-2xl font-bold text-white">Messages</h1>

        <div className="mt-4 flex items-center rounded-xl bg-[#1f2937] px-4">
          <Search size={18} className="text-slate-400" />

          <input
            placeholder="Search..."
            className="h-11 flex-1 bg-transparent px-3 text-white outline-none"
          />
        </div>
      </div>

      <div className="space-y-1 px-3">
        {conversations.map((user) => {
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

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-white">{user.name}</h3>
                  {lastMsg && <span className="text-[10px] text-slate-500">{lastMsg.time}</span>}
                </div>

                <p className={`truncate text-sm ${isActive ? "text-slate-200" : "text-slate-400"}`}>
                  {lastMsg ? `${lastMsg.sender === "me" ? "You: " : ""}${lastMsg.text}` : "No messages yet"}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
