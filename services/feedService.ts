import { useAxios } from "@/lib/useAxios";

export type FeedFilter = "LATEST" | "POPULAR" | "TRENDING" | "FOLLOWING";

export const feedService = {
  getPersonalizedFeed: async (filter: FeedFilter = "LATEST", page = 1, limit = 10) => {
    const axios = await useAxios();
    const response = await axios.get(`/feed?filter=${filter}&page=${page}&limit=${limit}`);
    return response.data;
  },

  getExploreFeed: async (page = 1, limit = 10) => {
    const axios = await useAxios();
    const response = await axios.get(`/feed/explore?page=${page}&limit=${limit}`);
    return response.data;
  },
};
