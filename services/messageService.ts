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
    const rawIds = Array.isArray(recipientId) ? recipientId : [recipientId];
    const recipientIds = rawIds.map((id) => (id || "").trim()).filter(Boolean);
    const axios = await useAxios();
    const response = await axios.post("/messages/conversations", {
      isGroup: recipientIds.length > 1,
      recipientIds,
    });
    return response.data;
  },

  createGroupConversation: async (payload: { title: string; recipientIds: string[] }) => {
    const cleanTitle = (payload.title || "").trim().slice(0, 120);
    const recipientIds = Array.isArray(payload.recipientIds)
      ? payload.recipientIds.map((id) => (id || "").trim()).filter(Boolean)
      : [];
    const axios = await useAxios();
    const response = await axios.post("/messages/conversations", {
      isGroup: true,
      title: cleanTitle || undefined,
      recipientIds,
    });
    return response.data;
  },

  getMessages: async (conversationId: string, page = 1, pageSize = 50) => {
    const cleanId = (conversationId || "").trim();
    const validPage = Math.max(1, page);
    const validPageSize = Math.max(1, Math.min(pageSize, 50));
    const axios = await useAxios();
    const response = await axios.get(`/messages/${cleanId}?page=${validPage}&pageSize=${validPageSize}`);
    return response.data;
  },

  sendMessage: async (conversationId: string, payload: SendMessagePayload) => {
    const cleanId = (conversationId || "").trim();
    const axios = await useAxios();
    const body: { content?: string; mediaId?: string } = {};
    if (payload.content && typeof payload.content === "string") {
      const cleanContent = payload.content.trim().slice(0, 5000);
      if (cleanContent) body.content = cleanContent;
    }
    if (payload.mediaId && typeof payload.mediaId === "string") {
      const cleanMediaId = payload.mediaId.trim();
      if (cleanMediaId) body.mediaId = cleanMediaId;
    }
    const response = await axios.post(`/messages/${cleanId}`, body);
    return response.data;
  },

  markRead: async (conversationId: string) => {
    const cleanId = (conversationId || "").trim();
    const axios = await useAxios();
    const response = await axios.post(`/messages/${cleanId}/read`);
    return response.data;
  },
};
