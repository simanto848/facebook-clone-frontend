import { useAxios } from "@/lib/useAxios";

export const mentionService = {
  getSuggestions: async (query: string, limit = 5) => {
    const axios = await useAxios();
    const response = await axios.get(`/mentions/suggestions?q=${encodeURIComponent(query)}&limit=${limit}`);
    return response.data;
  },

  getUserMentions: async (page = 1, limit = 20) => {
    const axios = await useAxios();
    const response = await axios.get(`/mentions/me?page=${page}&limit=${limit}`);
    return response.data;
  },
};
