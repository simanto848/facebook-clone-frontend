import { create } from "zustand";

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
  openChat: (person: { id: string; name: string; avatar: string }) => void;
  closeChat: (id: string) => void;
  toggleCollapse: (id: string) => void;
  sendMessage: (id: string, text: string) => void;
  setActiveConversationId: (id: string | null) => void;
  sendDirectMessage: (id: string, text: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  openChatBoxes: [],
  activeConversationId: "1", // Default to Sarah Wilson
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
  openChat: (person) => {
    set((state) => {
      const existing = state.openChatBoxes.find((box) => box.id === person.id);
      if (existing) {
        // Bring it to focus, and make sure it is expanded
        return {
          openChatBoxes: state.openChatBoxes.map((box) =>
            box.id === person.id ? { ...box, isCollapsed: false } : box
          ),
        };
      }

      // Limit to 3 open chat boxes maximum, remove the oldest one if exceeded
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
    // Add user's message
    set((state) => ({
      openChatBoxes: state.openChatBoxes.map((box) => {
        if (box.id !== id) return box;
        return {
          ...box,
          messages: [...box.messages, { sender: "me", text, time: "Just now" }],
        };
      }),
    }));

    // Trigger mock automated reply after 1.2 seconds
    setTimeout(() => {
      const answers = [
        "That's awesome! Let's talk more about it later.",
        "Interesting. Can you send me the link?",
        "Sounds good to me!",
        "Awesome! I am working on the spatial layouts right now.",
        "Haha nice! Talk to you soon.",
      ];
      const randomAnswer = answers[Math.floor(Math.random() * answers.length)];

      set((state) => ({
        openChatBoxes: state.openChatBoxes.map((box) => {
          if (box.id !== id) return box;
          return {
            ...box,
            messages: [...box.messages, { sender: "them", text: randomAnswer, time: "Just now" }],
          };
        }),
      }));
    }, 1200);
  },
  setActiveConversationId: (id) => set({ activeConversationId: id }),
  sendDirectMessage: (id, text) => {
    if (!text.trim()) return;
    const timeString = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Add user's message
    set((state) => ({
      conversations: state.conversations.map((conv) => {
        if (conv.id !== id) return conv;
        return {
          ...conv,
          messages: [...conv.messages, { sender: "me", text, time: timeString }],
        };
      }),
    }));

    // Trigger mock automated reply after 1.2 seconds
    setTimeout(() => {
      const answers = [
        "That's awesome! Let's talk more about it later.",
        "Interesting. Can you send me the link?",
        "Sounds good to me!",
        "Awesome! I am working on the messaging features right now.",
        "Haha nice! Talk to you soon.",
      ];
      const randomAnswer = answers[Math.floor(Math.random() * answers.length)];
      const responseTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      set((state) => ({
        conversations: state.conversations.map((conv) => {
          if (conv.id !== id) return conv;
          return {
            ...conv,
            messages: [...conv.messages, { sender: "them", text: randomAnswer, time: responseTime }],
          };
        }),
      }));
    }, 1200);
  },
}));
