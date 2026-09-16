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
  getJoinedGroups: async () => {
    const axios = await useAxios();
    const response = await axios.get("/groups/user/joined");
    return response.data;
  },

  getOwnedGroups: async () => {
    const axios = await useAxios();
    const response = await axios.get("/groups/user/owned");
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
      name: data.name,
      description: data.description,
      privacy: data.privacy || "PUBLIC",
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

  getGroupPosts: async (id: string) => {
    const axios = await useAxios();
    const response = await axios.get(`/groups/${id}/posts`);
    return response.data;
  },

  getGroupMembers: async (id: string, page = 1, limit = 20) => {
    const axios = await useAxios();
    const response = await axios.get(`/groups/${id}/members?page=${page}&limit=${limit}`);
    return response.data;
  },

  createGroupPost: async (id: string, content: string) => {
    const axios = await useAxios();
    const response = await axios.post(`/groups/${id}/posts`, { content });
    return response.data;
  },
};
