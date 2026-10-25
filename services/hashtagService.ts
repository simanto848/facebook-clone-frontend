import { useAxios } from "@/lib/useAxios";

export const hashtagService = {
  getTrending: async (limit = 10) => {
    const axios = await useAxios();
    const response = await axios.get(`/hashtags/trending?limit=${limit}`);
    return response.data;
  },

  searchHashtags: async (q: string, limit = 10) => {
    const axios = await useAxios();
    const cleanQ = q.trim();
    const response = await axios.get(`/hashtags?q=${encodeURIComponent(cleanQ)}&limit=${limit}`);
    return response.data;
  },

  getHashtagPosts: async (tag: string, page = 1, pageSize = 20) => {
    const axios = await useAxios();
    const cleanTag = tag.replace(/^#/, "");
    const response = await axios.get(`/feed?hashtag=${encodeURIComponent(cleanTag)}&page=${page}&pageSize=${pageSize}`);
    return response.data;
  },
};
