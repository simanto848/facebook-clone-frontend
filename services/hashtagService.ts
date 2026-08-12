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
};
