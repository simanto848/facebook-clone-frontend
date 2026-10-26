import { useAxios } from "@/lib/useAxios";

export interface SendMessagePayload {
  content?: string;
  mediaUrl?: string;
  mediaId?: string;
}

export const messageService = {
  getConversations: async () => {
    const axios = await useAxios();
    const response = await axios.get("/messages/conversations");
    return response.data;
  },

  createConversation: async (recipientId: string | string[]) => {
    const axios = await useAxios();
    const recipientIds = Array.isArray(recipientId) ? recipientId : [recipientId];
    const response = await axios.post("/messages/conversations", {
      isGroup: recipientIds.length > 1,
      recipientIds,
    });
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

  getMessages: async (conversationId: string, page = 1, pageSize = 50) => {
    const axios = await useAxios();
    const response = await axios.get(`/messages/${conversationId}?page=${page}&pageSize=${pageSize}`);
    return response.data;
  },

  sendMessage: async (conversationId: string, payload: SendMessagePayload) => {
    const axios = await useAxios();
    const body: { content?: string; mediaId?: string } = {};
    if (payload.content) {
      body.content = payload.content.trim().slice(0, 5000);
    }
    if (payload.mediaId) {
      body.mediaId = payload.mediaId;
    }
    const response = await axios.post(`/messages/${conversationId}`, body);
    return response.data;
  },

  markRead: async (conversationId: string) => {
    const axios = await useAxios();
    const response = await axios.post(`/messages/${conversationId}/read`);
    return response.data;
  },
};
