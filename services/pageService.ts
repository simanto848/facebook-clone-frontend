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
    const cleanId = (id || "").trim();
    const axios = await useAxios();
    const response = await axios.get(`/pages/${cleanId}`);
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
    const rawAvatar = (data.avatarUrl || data.avatar || "").trim();
    if (rawAvatar) {
      payload.avatarUrl = /^https?:\/\/.+/.test(rawAvatar) ? rawAvatar : "";
    }
    const rawCover = (data.coverUrl || data.cover || "").trim();
    if (rawCover) {
      payload.coverUrl = /^https?:\/\/.+/.test(rawCover) ? rawCover : "";
    }

    const response = await axios.post("/pages", payload);
    return response.data;
  },

  toggleLike: async (id: string) => {
    const cleanId = (id || "").trim();
    const axios = await useAxios();
    const response = await axios.post(`/pages/${cleanId}/like`);
    return response.data;
  },

  getPagePosts: async (id: string, page = 1, pageSize = 10) => {
    const cleanId = (id || "").trim();
    const axios = await useAxios();
    const validPage = Math.max(1, page);
    const validPageSize = Math.max(1, Math.min(pageSize, 50));
    const response = await axios.get(`/pages/${cleanId}/posts?page=${validPage}&pageSize=${validPageSize}`);
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
    const cleanId = (id || "").trim();
    const axios = await useAxios();
    const payload: Record<string, any> = {};
    if (data.name !== undefined) payload.name = data.name.trim().slice(0, 100);
    if (data.category !== undefined) payload.category = data.category.trim().slice(0, 50);
    if (data.description !== undefined) payload.description = data.description.trim().slice(0, 1000);
    if (data.avatarUrl !== undefined || data.avatar !== undefined) {
      const rawAvatar = (data.avatarUrl || data.avatar || "").trim();
      payload.avatarUrl = /^https?:\/\/.+/.test(rawAvatar) ? rawAvatar : "";
    }
    if (data.coverUrl !== undefined || data.cover !== undefined) {
      const rawCover = (data.coverUrl || data.cover || "").trim();
      payload.coverUrl = /^https?:\/\/.+/.test(rawCover) ? rawCover : "";
    }
    const response = await axios.patch(`/pages/${cleanId}`, payload);
    return response.data;
  },

  deletePage: async (id: string) => {
    const cleanId = (id || "").trim();
    const axios = await useAxios();
    const response = await axios.delete(`/pages/${cleanId}`);
    return response.data;
  },
};
