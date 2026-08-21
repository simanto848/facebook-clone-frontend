import { useAxios } from "@/lib/useAxios";

export interface SendMessagePayload {
  content: string;
  mediaUrl?: string;
}

export const messageService = {
  getConversations: async () => {
    const axios = await useAxios();
    const response = await axios.get("/messages/conversations");
    return response.data;
  },

  createConversation: async (recipientId: string) => {
    const axios = await useAxios();
    const response = await axios.post("/messages/conversations", { recipientId });
    return response.data;
  },

  createGroupConversation: async (payload: { title: string; recipientIds: string[] }) => {
    const axios = await useAxios();
    const response = await axios.post("/messages/conversations", {
      isGroup: true,
      title: payload.title,
      recipientIds: payload.recipientIds,
    });
    return response.data;
  },

  getMessages: async (conversationId: string, page = 1, limit = 50) => {
    const axios = await useAxios();
    const response = await axios.get(`/messages/${conversationId}?page=${page}&limit=${limit}`);
    return response.data;
  },

  sendMessage: async (conversationId: string, payload: SendMessagePayload) => {
    const axios = await useAxios();
    const response = await axios.post(`/messages/${conversationId}`, payload);
    return response.data;
  },

  markRead: async (conversationId: string) => {
    const axios = await useAxios();
    const response = await axios.post(`/messages/${conversationId}/read`);
    return response.data;
  },
};
