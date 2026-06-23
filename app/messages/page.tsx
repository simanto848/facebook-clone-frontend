"use client";

import ConversationList from "@/components/features/messages/ConversationList";
import ChatWindow from "@/components/features/messages/ChatWindow";
import { useChatStore } from "@/store/chatStore";

export default function MessagesPage() {
  const { activeConversationId } = useChatStore();

  return (
    <div className="h-[calc(100vh-64px)] bg-[#0f172a] p-4 md:p-6">
      <div className="h-full overflow-hidden rounded-2xl md:rounded-3xl border border-[#1f2937] bg-[#111827]">
        <div className="grid h-full grid-cols-12 overflow-hidden">
          <div
            className={`col-span-12 md:col-span-4 border-r border-[#1f2937] h-full overflow-y-auto ${
              activeConversationId ? "hidden md:block" : "block"
            }`}
          >
            <ConversationList />
          </div>

          <div
            className={`col-span-12 md:col-span-8 h-full ${
              activeConversationId ? "block" : "hidden md:block"
            }`}
          >
            <ChatWindow />
          </div>
        </div>
      </div>
    </div>
  );
}
