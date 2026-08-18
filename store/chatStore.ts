import { create } from "zustand";
import { messageService } from "@/services/messageService";
import { friendshipService } from "@/services/friendshipService";

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
  activeConversationId: null,
  conversations: [],

  fetchConversations: async () => {
    try {
      const res = await messageService.getConversations();
      const items = res.data || res || [];
      if (Array.isArray(items) && items.length > 0) {
        const parsedConvs: Conversation[] = items.map((item: any) => ({
          id: item.otherUser?.id || item.user?.id || item.id,
          name: `${item.otherUser?.firstName || ""} ${item.otherUser?.lastName || ""}`.trim() || item.otherUser?.displayName || item.otherUser?.username || item.user?.username || "User",
          avatar: item.otherUser?.avatarUrl || item.otherUser?.profilePicture || item.user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
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
        return;
      }

      // Fallback: If 0 existing message threads, fetch real friends to populate connections!
      const friendsRes = await friendshipService.getFriends();
      const friendItems = friendsRes.data || friendsRes || [];
      if (Array.isArray(friendItems) && friendItems.length > 0) {
        const parsedFriends: Conversation[] = friendItems.map((f: any) => {
          const u = f.user || f;
          return {
            id: u.id,
            name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.displayName || u.username || "Friend",
            avatar: u.avatarUrl || u.profilePicture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
            online: Boolean(u.isOnline),
            messages: [],
          };
        });

        set({ conversations: parsedFriends });
        if (parsedFriends.length > 0 && !get().activeConversationId) {
          set({ activeConversationId: parsedFriends[0].id });
        }
        return;
      }

      // Secondary Fallback: If 0 friends, fetch user suggestions!
      const sugRes = await friendshipService.getSuggestions();
      const sugItems = sugRes.data || sugRes || [];
      if (Array.isArray(sugItems) && sugItems.length > 0) {
        const parsedSugs: Conversation[] = sugItems.map((u: any) => ({
          id: u.id,
          name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.displayName || u.username || "Suggested User",
          avatar: u.avatarUrl || u.profilePicture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
          online: Boolean(u.isOnline),
          messages: [],
        }));

        set({ conversations: parsedSugs });
        if (parsedSugs.length > 0 && !get().activeConversationId) {
          set({ activeConversationId: parsedSugs[0].id });
        }
      } else {
        set({ conversations: [], activeConversationId: null });
      }
    } catch (err) {
      console.error("Failed to load real conversations:", err);
      set({ conversations: [], activeConversationId: null });
    }
  },

  fetchMessagesForUser: async (userId: string) => {
    try {
      const res = await messageService.getMessages(userId);
      const items = res.data || res || [];
      if (Array.isArray(items)) {
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
        messages: [],
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
