import { useAxios } from "@/lib/useAxios";

export const hashtagService = {
  getTrending: async (limit = 10) => {
    const axios = await useAxios();
    const response = await axios.get(`/hashtags/trending?limit=${limit}`);
    return response.data;
  },

  searchHashtags: async (q: string) => {
    const axios = await useAxios();
    const response = await axios.get(`/hashtags?q=${encodeURIComponent(q)}`);
    return response.data;
  },

  getHashtagPosts: async (tag: string, page = 1, limit = 10) => {
    const axios = await useAxios();
    const response = await axios.get(`/hashtags/${encodeURIComponent(tag)}/posts?page=${page}&limit=${limit}`);
    return response.data;
  },
};
