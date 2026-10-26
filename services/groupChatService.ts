import { useAxios } from "@/lib/useAxios";

export interface CreateGroupChatInput {
  name: string;
  memberIds: string[];
}

export const groupChatService = {
  createGroupChat: async (data: CreateGroupChatInput) => {
    const axios = await useAxios();
    const response = await axios.post("/messages/conversations", {
      isGroup: true,
      title: data.name,
      recipientIds: data.memberIds,
    });
    return response.data;
  },

  updateGroupChatTitle: async (conversationId: string, title: string) => {
    const axios = await useAxios();
    const cleanTitle = title.trim().slice(0, 120);
    const response = await axios.patch(`/group-chats/${conversationId}`, { title: cleanTitle });
    return response.data;
  },

  addParticipants: async (conversationId: string, userIds: string[]) => {
    const axios = await useAxios();
    const response = await axios.post(`/group-chats/${conversationId}/participants`, { userIds });
    return response.data;
  },

  removeParticipant: async (conversationId: string, userId: string) => {
    const axios = await useAxios();
    const response = await axios.delete(`/group-chats/${conversationId}/participants/${userId}`);
    return response.data;
  },

  leaveGroupChat: async (conversationId: string) => {
    const axios = await useAxios();
    const response = await axios.post(`/group-chats/${conversationId}/leave`);
    return response.data;
  },

  updateParticipantRole: async (conversationId: string, userId: string, role: string) => {
    const axios = await useAxios();
    const upperRole = role.toUpperCase().trim();
    const validRole = upperRole === "ADMIN" ? "ADMIN" : "MEMBER";
    const response = await axios.patch(`/group-chats/${conversationId}/participants/${userId}/role`, { role: validRole });
    return response.data;
  },
};
