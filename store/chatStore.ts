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

interface ChatState {
  openChatBoxes: ChatBox[];
  openChat: (person: { id: string; name: string; avatar: string }) => void;
  closeChat: (id: string) => void;
  toggleCollapse: (id: string) => void;
  sendMessage: (id: string, text: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  openChatBoxes: [],
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

    // Trigger mock automated reply after 1.5 seconds
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
}));
