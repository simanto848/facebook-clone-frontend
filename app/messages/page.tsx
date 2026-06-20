import ConversationList from "@/components/features/messages/ConversationList";
import ChatWindow from "@/components/features/messages/ChatWindow";

export default function MessagesPage() {
  return (
    <div className="h-[calc(100vh-64px)] bg-[#0f172a] p-6">
      <div className="h-full overflow-hidden rounded-3xl border border-[#1f2937] bg-[#111827]">
        <div className="grid h-full grid-cols-12">
          <div className="col-span-4 border-r border-[#1f2937]">
            <ConversationList />
          </div>

          <div className="col-span-8">
            <ChatWindow />
          </div>
        </div>
      </div>
    </div>
  );
}
