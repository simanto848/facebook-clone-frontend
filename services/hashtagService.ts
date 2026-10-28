import { useAxios } from "@/lib/useAxios";

export const hashtagService = {
  getTrending: async (limit = 10) => {
    const axios = await useAxios();
    const validLimit = Math.max(1, Math.min(limit, 100));
    const response = await axios.get(`/hashtags/trending?limit=${validLimit}`);
    return response.data;
  },

  searchHashtags: async (q: string, limit = 10) => {
    const axios = await useAxios();
    const cleanQ = (q || "").trim().slice(0, 50);
    const validLimit = Math.max(1, Math.min(limit, 100));
    const response = await axios.get(`/hashtags?q=${encodeURIComponent(cleanQ)}&limit=${validLimit}`);
    return response.data;
  },

  getHashtagPosts: async (tag: string, page = 1, pageSize = 20) => {
    const axios = await useAxios();
    const cleanTag = (tag || "").replace(/^#+/, "").trim();
    const validPage = Math.max(1, page);
    const validPageSize = Math.max(1, Math.min(pageSize, 50));
    const response = await axios.get(
      `/feed?hashtag=${encodeURIComponent(cleanTag)}&page=${validPage}&pageSize=${validPageSize}`
    );
    return response.data;
  },
};
