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
  hasUnread?: boolean;
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
  markConversationAsRead: (id: string) => void;
}

let activeFetchPromise: Promise<void> | null = null;
let lastFetchTimestamp = 0;

export const useChatStore = create<ChatState>((set, get) => ({
  openChatBoxes: [],
  activeConversationId: null,
  conversations: [],

  fetchConversations: async () => {
    const now = Date.now();
    if (activeFetchPromise) return activeFetchPromise;
    if (now - lastFetchTimestamp < 3000 && get().conversations.length > 0) return;

    lastFetchTimestamp = now;

    activeFetchPromise = (async () => {
      try {
        const res = await messageService.getConversations();
        const items = res.data || res || [];
        if (Array.isArray(items) && items.length > 0) {
          const parsedConvs: Conversation[] = items.map((item: any) => ({
            id: item.otherUser?.id || item.user?.id || item.id,
            name: `${item.otherUser?.firstName || ""} ${item.otherUser?.lastName || ""}`.trim() || item.otherUser?.displayName || item.otherUser?.username || item.user?.username || "User",
            avatar: item.otherUser?.avatarUrl || item.otherUser?.profilePicture || item.user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
            online: Boolean(item.otherUser?.isOnline),
            hasUnread: Boolean(item.hasUnread),
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
      } finally {
        activeFetchPromise = null;
      }
    })();

    return activeFetchPromise;
  },

  fetchMessagesForUser: async (userId: string) => {
    try {
      const res = await messageService.getMessages(userId);
      const dataObj = res?.data || res || {};
      const rawList = Array.isArray(dataObj)
        ? dataObj
        : Array.isArray(dataObj.messages)
        ? dataObj.messages
        : Array.isArray(res?.messages)
        ? res.messages
        : [];

      const parsedMsgs: Message[] = rawList.map((m: any) => ({
        sender: m.senderId === userId ? "them" : "me",
        text: m.content || m.text || "",
        time: new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }));

      // Sort messages chronologically (oldest first, newest at bottom)
      parsedMsgs.reverse();

      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === userId ? { ...c, messages: parsedMsgs } : c
        ),
        openChatBoxes: state.openChatBoxes.map((b) =>
          b.id === userId ? { ...b, messages: parsedMsgs } : b
        ),
      }));
    } catch {
      // Keep optimistic state
    }
  },

  openChat: (person) => {
    const conv = get().conversations.find((c) => c.id === person.id);
    const initialMsgs = conv ? conv.messages : [];

    set((state) => {
      const existing = state.openChatBoxes.find((box) => box.id === person.id);
      if (existing) {
        return {
          openChatBoxes: state.openChatBoxes.map((box) =>
            box.id === person.id ? { ...box, isCollapsed: false, messages: conv ? conv.messages : box.messages } : box
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
        messages: initialMsgs,
      };

      return { openChatBoxes: [...currentBoxes, newBox] };
    });

    get().fetchMessagesForUser(person.id);
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
    const timeString = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    set((state) => ({
      openChatBoxes: state.openChatBoxes.map((box) => {
        if (box.id !== id) return box;
        return {
          ...box,
          messages: [...box.messages, { sender: "me", text, time: timeString }],
        };
      }),
      conversations: state.conversations.map((conv) => {
        if (conv.id !== id) return conv;
        return {
          ...conv,
          messages: [...conv.messages, { sender: "me", text, time: timeString }],
        };
      }),
    }));

    messageService.sendMessage(id, { content: text }).catch(() => {});
  },

  setActiveConversationId: (id) => {
    set((state) => ({
      activeConversationId: id,
      conversations: state.conversations.map((c) =>
        c.id === id ? { ...c, hasUnread: false } : c
      ),
    }));
    if (id) {
      get().fetchMessagesForUser(id);
      messageService.markRead(id).catch(() => {});
    }
  },

  markConversationAsRead: (id) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === id ? { ...c, hasUnread: false } : c
      ),
    }));
    messageService.markRead(id).catch(() => {});
  },

  sendDirectMessage: (id, text) => {
    if (!text.trim()) return;
    const timeString = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    messageService.sendMessage(id, { content: text }).catch(() => {});

    set((state) => ({
      conversations: state.conversations.map((conv) => {
        if (conv.id !== id) return conv;
        return {
          ...conv,
          hasUnread: false,
          messages: [...conv.messages, { sender: "me", text, time: timeString }],
        };
      }),
      openChatBoxes: state.openChatBoxes.map((box) => {
        if (box.id !== id) return box;
        return {
          ...box,
          messages: [...box.messages, { sender: "me", text, time: timeString }],
        };
      }),
    }));
  },
}));
