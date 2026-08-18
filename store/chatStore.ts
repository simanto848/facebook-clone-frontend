import { create } from "zustand";
import { messageService } from "@/services/messageService";

export interface Message {
  sender: "me" | "them";
  text: string;
  time: string;
}

export interface ChatBox {
  id: string;
  name: string;
  avatar: string;
  isCollapsed: boolean;
  messages: Message[];
}

export interface Conversation {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
  messages: Message[];
}

interface ChatState {
  openChatBoxes: ChatBox[];
  conversations: Conversation[];
  activeConversationId: string | null;
  fetchConversations: () => Promise<void>;
  fetchMessagesForUser: (userId: string) => Promise<void>;
  openChat: (person: { id: string; name: string; avatar: string }) => void;
  closeChat: (id: string) => void;
  toggleCollapse: (id: string) => void;
  sendMessage: (id: string, text: string) => void;
  setActiveConversationId: (id: string | null) => void;
  sendDirectMessage: (id: string, text: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  openChatBoxes: [],
  activeConversationId: "1",
  conversations: [
    {
      id: "1",
      name: "Sarah Wilson",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300",
      online: true,
      messages: [
        { sender: "them", text: "Hi Alex! How's the social media app going?", time: "10:30 AM" },
        { sender: "me", text: "Going great 🚀. Just finished the profile page.", time: "10:31 AM" },
        { sender: "them", text: "Nice! Did you implement the messaging page yet?", time: "10:32 AM" },
        { sender: "me", text: "Working on it now 😄", time: "10:32 AM" },
        { sender: "them", text: "Can't wait to see it 🔥", time: "10:33 AM" },
      ],
    },
    {
      id: "2",
      name: "Alex Johnson",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300",
      online: false,
      messages: [
        { sender: "them", text: "Hey! Are you working today?", time: "Yesterday" },
        { sender: "me", text: "Yeah, mostly frontend updates.", time: "Yesterday" },
        { sender: "them", text: "Working on it.", time: "Yesterday" },
      ],
    },
    {
      id: "3",
      name: "Emma Brown",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300",
      online: true,
      messages: [
        { sender: "them", text: "That's awesome 🔥", time: "2 hours ago" },
      ],
    },
  ],

  fetchConversations: async () => {
    try {
      const res = await messageService.getConversations();
      const items = res.data || res || [];
      if (Array.isArray(items) && items.length > 0) {
        const parsedConvs: Conversation[] = items.map((item: any) => ({
          id: item.otherUser?.id || item.user?.id || item.id,
          name: item.otherUser?.displayName || item.otherUser?.username || item.user?.username || "Chat Partner",
          avatar: item.otherUser?.avatarUrl || item.otherUser?.profilePicture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
          online: Boolean(item.otherUser?.isOnline),
          messages: item.messages
            ? item.messages.map((m: any) => ({
                sender: m.isMe ? "me" : "them",
                text: m.content || m.text || "",
                time: new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              }))
            : item.lastMessage
            ? [
                {
                  sender: item.lastMessage.isMe ? "me" : "them",
                  text: item.lastMessage.content || "",
                  time: new Date(item.lastMessage.createdAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                },
              ]
            : [],
        }));

        set({ conversations: parsedConvs });
        if (parsedConvs.length > 0 && !get().activeConversationId) {
          set({ activeConversationId: parsedConvs[0].id });
        }
      }
    } catch {
      // Retain active conversation list
    }
  },

  fetchMessagesForUser: async (userId: string) => {
    try {
      const res = await messageService.getMessages(userId);
      const items = res.data || res || [];
      if (Array.isArray(items) && items.length > 0) {
        const parsedMsgs: Message[] = items.map((m: any) => ({
          sender: m.senderId === userId ? "them" : "me",
          text: m.content || m.text || "",
          time: new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }));

        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === userId ? { ...c, messages: parsedMsgs } : c
          ),
        }));
      }
    } catch {
      // Keep optimistic state
    }
  },

  openChat: (person) => {
    set((state) => {
      const existing = state.openChatBoxes.find((box) => box.id === person.id);
      if (existing) {
        return {
          openChatBoxes: state.openChatBoxes.map((box) =>
            box.id === person.id ? { ...box, isCollapsed: false } : box
          ),
        };
      }

      const currentBoxes = [...state.openChatBoxes];
      if (currentBoxes.length >= 3) {
        currentBoxes.shift();
      }

      const newBox: ChatBox = {
        id: person.id,
        name: person.name,
        avatar: person.avatar,
        isCollapsed: false,
        messages: [
          { sender: "them", text: `Hey there! How's it going?`, time: "Just now" },
        ],
      };

      return { openChatBoxes: [...currentBoxes, newBox] };
    });
  },

  closeChat: (id) =>
    set((state) => ({
      openChatBoxes: state.openChatBoxes.filter((box) => box.id !== id),
    })),

  toggleCollapse: (id) =>
    set((state) => ({
      openChatBoxes: state.openChatBoxes.map((box) =>
        box.id === id ? { ...box, isCollapsed: !box.isCollapsed } : box
      ),
    })),

  sendMessage: (id, text) => {
    set((state) => ({
      openChatBoxes: state.openChatBoxes.map((box) => {
        if (box.id !== id) return box;
        return {
          ...box,
          messages: [...box.messages, { sender: "me", text, time: "Just now" }],
        };
      }),
    }));

    messageService.sendMessage(id, { content: text }).catch(() => {});
  },

  setActiveConversationId: (id) => set({ activeConversationId: id }),

  sendDirectMessage: (id, text) => {
    if (!text.trim()) return;
    const timeString = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    messageService.sendMessage(id, { content: text }).catch(() => {});

    set((state) => ({
      conversations: state.conversations.map((conv) => {
        if (conv.id !== id) return conv;
        return {
          ...conv,
          messages: [...conv.messages, { sender: "me", text, time: timeString }],
        };
      }),
    }));
  },
}));
