import { useAxios } from "@/lib/useAxios";

export const mentionService = {
  getSuggestions: async (query: string, pageSize = 5) => {
    const axios = await useAxios();
    const cleanQuery = (query || "").trim().slice(0, 100);
    const validPageSize = Math.max(1, Math.min(pageSize, 50));
    const endpoint = cleanQuery
      ? `/users/search?q=${encodeURIComponent(cleanQuery)}&pageSize=${validPageSize}`
      : `/users/suggestions?pageSize=${validPageSize}`;
    const response = await axios.get(endpoint);
    return response.data;
  },

  getUserMentions: async (page = 1, pageSize = 20) => {
    const axios = await useAxios();
    const validPage = Math.max(1, page);
    const validPageSize = Math.max(1, Math.min(pageSize, 50));
    const response = await axios.get(`/mentions/me?page=${validPage}&pageSize=${validPageSize}`);
    return response.data;
  },
};
