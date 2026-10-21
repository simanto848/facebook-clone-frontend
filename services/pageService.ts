import { useAxios } from "@/lib/useAxios";

export interface CreatePageInput {
  name: string;
  category: string;
  description?: string;
  avatar?: string;
  cover?: string;
  website?: string;
}

export const pageService = {
  getOwnedPages: async () => {
    const axios = await useAxios();
    const response = await axios.get("/pages/user/owned");
    return response.data;
  },

  getLikedPages: async () => {
    const axios = await useAxios();
    const response = await axios.get("/pages/user/liked");
    return response.data;
  },

  getPageById: async (id: string) => {
    const axios = await useAxios();
    const response = await axios.get(`/pages/${id}`);
    return response.data;
  },

  createPage: async (data: CreatePageInput) => {
    const axios = await useAxios();
    const response = await axios.post("/pages", data);
    return response.data;
  },

  toggleLike: async (id: string) => {
    const axios = await useAxios();
    const response = await axios.post(`/pages/${id}/like`);
    return response.data;
  },

  getPagePosts: async (id: string) => {
    const axios = await useAxios();
    const response = await axios.get(`/pages/${id}/posts`);
    return response.data;
  },

  createPagePost: async (id: string, content: string) => {
    const axios = await useAxios();
    const response = await axios.post(`/pages/${id}/posts`, { content });
    return response.data;
  },

  updatePage: async (id: string, data: Partial<CreatePageInput> & { avatarUrl?: string; coverUrl?: string }) => {
    const axios = await useAxios();
    const payload: Record<string, any> = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.category !== undefined) payload.category = data.category;
    if (data.description !== undefined) payload.description = data.description;
    if (data.avatarUrl !== undefined || data.avatar !== undefined) {
      payload.avatarUrl = data.avatarUrl || data.avatar || "";
    }
    if (data.coverUrl !== undefined || data.cover !== undefined) {
      payload.coverUrl = data.coverUrl || data.cover || "";
    }
    const response = await axios.patch(`/pages/${id}`, payload);
    return response.data;
  },

  deletePage: async (id: string) => {
    const axios = await useAxios();
    const response = await axios.delete(`/pages/${id}`);
    return response.data;
  },
};
