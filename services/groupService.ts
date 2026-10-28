import { useAxios } from "@/lib/useAxios";

export interface CreateGroupInput {
  name: string;
  description?: string;
  category?: string;
  avatar?: string;
  cover?: string;
  coverUrl?: string;
  privacy?: "PUBLIC" | "PRIVATE";
}

export const groupService = {
  getJoinedGroups: async (page = 1, pageSize = 10) => {
    const axios = await useAxios();
    const validPage = Math.max(1, page);
    const validPageSize = Math.max(1, Math.min(pageSize, 50));
    const response = await axios.get(`/groups/user/joined?page=${validPage}&pageSize=${validPageSize}`);
    return response.data;
  },

  getOwnedGroups: async (page = 1, pageSize = 10) => {
    const axios = await useAxios();
    const validPage = Math.max(1, page);
    const validPageSize = Math.max(1, Math.min(pageSize, 50));
    const response = await axios.get(`/groups/user/owned?page=${validPage}&pageSize=${validPageSize}`);
    return response.data;
  },

  getGroupById: async (id: string) => {
    const axios = await useAxios();
    const response = await axios.get(`/groups/${id}`);
    return response.data;
  },

  createGroup: async (data: CreateGroupInput) => {
    const axios = await useAxios();
    const payload = {
      name: data.name.trim().slice(0, 100),
      description: data.description ? data.description.trim().slice(0, 1000) : undefined,
      privacy: data.privacy ? (data.privacy.toUpperCase() as "PUBLIC" | "PRIVATE") : "PUBLIC",
      coverUrl: data.coverUrl || data.cover || "",
    };
    const response = await axios.post("/groups", payload);
    return response.data;
  },

  joinGroup: async (id: string) => {
    const axios = await useAxios();
    const response = await axios.post(`/groups/${id}/join`);
    return response.data;
  },

  leaveGroup: async (id: string) => {
    const axios = await useAxios();
    const response = await axios.post(`/groups/${id}/leave`);
    return response.data;
  },

  getGroupPosts: async (id: string, page = 1, pageSize = 10) => {
    const axios = await useAxios();
    const validPage = Math.max(1, page);
    const validPageSize = Math.max(1, Math.min(pageSize, 50));
    const response = await axios.get(`/groups/${id}/posts?page=${validPage}&pageSize=${validPageSize}`);
    return response.data;
  },

  getGroupMembers: async (id: string, page = 1, pageSize = 20) => {
    const axios = await useAxios();
    const validPage = Math.max(1, page);
    const validPageSize = Math.max(1, Math.min(pageSize, 50));
    const response = await axios.get(`/groups/${id}/members?page=${validPage}&pageSize=${validPageSize}`);
    return response.data;
  },

  createGroupPost: async (id: string, content: string, mediaIds?: string[]) => {
    const cleanId = (id || "").trim();
    const cleanContent = (content || "").trim();
    if (!cleanContent) {
      throw new Error("Post content cannot be empty");
    }
    const axios = await useAxios();
    const payload: { content: string; mediaIds?: string[] } = { content: cleanContent };
    if (Array.isArray(mediaIds) && mediaIds.length > 0) {
      const validMediaIds = mediaIds.filter((mid) => typeof mid === "string" && mid.trim().length > 0);
      if (validMediaIds.length > 0) {
        payload.mediaIds = validMediaIds;
      }
    }
    const response = await axios.post(`/groups/${cleanId}/posts`, payload);
    return response.data;
  },

  updateGroup: async (id: string, data: Partial<CreateGroupInput>) => {
    const axios = await useAxios();
    const payload: Record<string, any> = {};
    if (data.name !== undefined) payload.name = data.name.trim();
    if (data.description !== undefined) payload.description = data.description.trim();
    if (data.privacy !== undefined) {
      payload.privacy = data.privacy.toUpperCase() as "PUBLIC" | "PRIVATE";
    }
    if (data.coverUrl !== undefined || data.cover !== undefined) {
      payload.coverUrl = data.coverUrl || data.cover || "";
    }
    const response = await axios.patch(`/groups/${id}`, payload);
    return response.data;
  },

  deleteGroup: async (id: string) => {
    const axios = await useAxios();
    const response = await axios.delete(`/groups/${id}`);
    return response.data;
  },
};
