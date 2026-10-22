import { useAxios } from "@/lib/useAxios";

export const mentionService = {
  getSuggestions: async (query: string, limit = 5) => {
    const axios = await useAxios();
    const endpoint = query.trim()
      ? `/users/search?q=${encodeURIComponent(query)}&limit=${limit}`
      : `/users/suggestions?limit=${limit}`;
    const response = await axios.get(endpoint);
    return response.data;
  },

  getUserMentions: async (page = 1, pageSize = 20) => {
    const axios = await useAxios();
    const response = await axios.get(`/mentions/me?page=${page}&pageSize=${pageSize}`);
    return response.data;
  },
};
