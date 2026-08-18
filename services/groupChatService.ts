import { useAxios } from "@/lib/useAxios";

export interface CreateGroupChatInput {
  name: string;
  memberIds: string[];
}

export const groupChatService = {
  createGroupChat: async (data: CreateGroupChatInput) => {
    const axios = await useAxios();
    const response = await axios.post("/group-chats", data);
    return response.data;
  },

  getGroupChats: async () => {
    const axios = await useAxios();
    const response = await axios.get("/group-chats");
    return response.data;
  },

  getGroupMessages: async (groupChatId: string, page = 1, limit = 50) => {
    const axios = await useAxios();
    const response = await axios.get(`/group-chats/${groupChatId}/messages?page=${page}&limit=${limit}`);
    return response.data;
  },

  sendGroupMessage: async (groupChatId: string, content: string, mediaUrl?: string) => {
    const axios = await useAxios();
    const response = await axios.post(`/group-chats/${groupChatId}/messages`, { content, mediaUrl });
    return response.data;
  },

  addMember: async (groupChatId: string, userId: string) => {
    const axios = await useAxios();
    const response = await axios.post(`/group-chats/${groupChatId}/members`, { userId });
    return response.data;
  },

  leaveGroupChat: async (groupChatId: string) => {
    const axios = await useAxios();
    const response = await axios.post(`/group-chats/${groupChatId}/leave`);
    return response.data;
  },
};
