import { useAxios } from "@/lib/useAxios";

export interface CreatePageInput {
  name: string;
  category: string;
  description?: string;
  avatar?: string;
  avatarUrl?: string;
  cover?: string;
  coverUrl?: string;
  website?: string;
}

export const pageService = {
  getOwnedPages: async (page = 1, pageSize = 10) => {
    const axios = await useAxios();
    const validPage = Math.max(1, page);
    const validPageSize = Math.max(1, Math.min(pageSize, 50));
    const response = await axios.get(`/pages/user/owned?page=${validPage}&pageSize=${validPageSize}`);
    return response.data;
  },

  getLikedPages: async (page = 1, pageSize = 10) => {
    const axios = await useAxios();
    const validPage = Math.max(1, page);
    const validPageSize = Math.max(1, Math.min(pageSize, 50));
    const response = await axios.get(`/pages/user/liked?page=${validPage}&pageSize=${validPageSize}`);
    return response.data;
  },

  getPageById: async (id: string) => {
    const axios = await useAxios();
    const response = await axios.get(`/pages/${id}`);
    return response.data;
  },

  createPage: async (data: CreatePageInput) => {
    const axios = await useAxios();
    const payload: Record<string, any> = {
      name: data.name.trim().slice(0, 100),
      category: data.category.trim().slice(0, 50),
    };
    if (data.description !== undefined) {
      payload.description = data.description.trim().slice(0, 1000);
    }
    const avatar = data.avatarUrl || data.avatar;
    if (avatar) payload.avatarUrl = avatar;
    const cover = data.coverUrl || data.cover;
    if (cover) payload.coverUrl = cover;

    const response = await axios.post("/pages", payload);
    return response.data;
  },

  toggleLike: async (id: string) => {
    const axios = await useAxios();
    const response = await axios.post(`/pages/${id}/like`);
    return response.data;
  },

  getPagePosts: async (id: string, page = 1, pageSize = 10) => {
    const axios = await useAxios();
    const validPage = Math.max(1, page);
    const validPageSize = Math.max(1, Math.min(pageSize, 50));
    const response = await axios.get(`/pages/${id}/posts?page=${validPage}&pageSize=${validPageSize}`);
    return response.data;
  },

  createPagePost: async (id: string, content: string, mediaIds?: string[]) => {
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
    const response = await axios.post(`/pages/${cleanId}/posts`, payload);
    return response.data;
  },

  updatePage: async (id: string, data: Partial<CreatePageInput> & { avatarUrl?: string; coverUrl?: string }) => {
    const axios = await useAxios();
    const payload: Record<string, any> = {};
    if (data.name !== undefined) payload.name = data.name.trim();
    if (data.category !== undefined) payload.category = data.category.trim();
    if (data.description !== undefined) payload.description = data.description.trim();
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
