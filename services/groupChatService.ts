import { useAxios } from "@/lib/useAxios";

export interface CreateGroupChatInput {
  name: string;
  memberIds: string[];
}

export const groupChatService = {
  createGroupChat: async (data: CreateGroupChatInput) => {
    const cleanTitle = (data.name || "").trim().slice(0, 120);
    const validMembers = Array.isArray(data.memberIds)
      ? data.memberIds.map((m) => (m || "").trim()).filter(Boolean)
      : [];
    const axios = await useAxios();
    const response = await axios.post("/messages/conversations", {
      isGroup: true,
      title: cleanTitle || undefined,
      recipientIds: validMembers,
    });
    return response.data;
  },

  updateGroupChatTitle: async (conversationId: string, title: string) => {
    const cleanId = (conversationId || "").trim();
    const cleanTitle = (title || "").trim().slice(0, 120);
    const axios = await useAxios();
    const response = await axios.patch(`/group-chats/${cleanId}`, { title: cleanTitle });
    return response.data;
  },

  addParticipants: async (conversationId: string, userIds: string[]) => {
    const cleanId = (conversationId || "").trim();
    const validUserIds = Array.isArray(userIds)
      ? userIds.map((u) => (u || "").trim()).filter(Boolean)
      : [];
    const axios = await useAxios();
    const response = await axios.post(`/group-chats/${cleanId}/participants`, { userIds: validUserIds });
    return response.data;
  },

  removeParticipant: async (conversationId: string, userId: string) => {
    const cleanId = (conversationId || "").trim();
    const cleanUserId = (userId || "").trim();
    const axios = await useAxios();
    const response = await axios.delete(`/group-chats/${cleanId}/participants/${cleanUserId}`);
    return response.data;
  },

  leaveGroupChat: async (conversationId: string) => {
    const cleanId = (conversationId || "").trim();
    const axios = await useAxios();
    const response = await axios.post(`/group-chats/${cleanId}/leave`);
    return response.data;
  },

  updateParticipantRole: async (conversationId: string, userId: string, role: string) => {
    const cleanId = (conversationId || "").trim();
    const cleanUserId = (userId || "").trim();
    const axios = await useAxios();
    const upperRole = (role || "").toUpperCase().trim();
    const validRole = upperRole === "ADMIN" ? "ADMIN" : "MEMBER";
    const response = await axios.patch(`/group-chats/${cleanId}/participants/${cleanUserId}/role`, { role: validRole });
    return response.data;
  },
};
