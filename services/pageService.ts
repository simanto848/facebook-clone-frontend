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
};
