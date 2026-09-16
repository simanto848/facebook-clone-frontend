import { useAxios } from "@/lib/useAxios";

export type FeedFilter = "LATEST" | "POPULAR" | "TRENDING" | "FOLLOWING" | "MEDIA";

export interface FeedQueryParams {
  page?: number;
  pageSize?: number;
  hashtag?: string;
}

export const feedService = {
  getChronologicalFeed: async (params: FeedQueryParams = {}) => {
    const axios = await useAxios();
    const query = new URLSearchParams();
    if (params.page) query.append("page", params.page.toString());
    if (params.pageSize) query.append("pageSize", params.pageSize.toString());
    if (params.hashtag) query.append("hashtag", params.hashtag);
    const queryString = query.toString();
    const response = await axios.get(`/feed${queryString ? `?${queryString}` : ""}`);
    return response.data;
  },

  getTrendingFeed: async (params: FeedQueryParams = {}) => {
    const axios = await useAxios();
    const query = new URLSearchParams();
    if (params.page) query.append("page", params.page.toString());
    if (params.pageSize) query.append("pageSize", params.pageSize.toString());
    if (params.hashtag) query.append("hashtag", params.hashtag);
    const queryString = query.toString();
    const response = await axios.get(`/feed/trending${queryString ? `?${queryString}` : ""}`);
    return response.data;
  },

  getMediaFeed: async (params: FeedQueryParams = {}) => {
    const axios = await useAxios();
    const query = new URLSearchParams();
    if (params.page) query.append("page", params.page.toString());
    if (params.pageSize) query.append("pageSize", params.pageSize.toString());
    if (params.hashtag) query.append("hashtag", params.hashtag);
    const queryString = query.toString();
    const response = await axios.get(`/feed/media${queryString ? `?${queryString}` : ""}`);
    return response.data;
  },

  getPersonalizedFeed: async (filter: FeedFilter = "LATEST", page = 1, limit = 10) => {
    const axios = await useAxios();
    if (filter === "TRENDING") {
      const response = await axios.get(`/feed/trending?page=${page}&pageSize=${limit}`);
      return response.data;
    }
    if (filter === "MEDIA") {
      const response = await axios.get(`/feed/media?page=${page}&pageSize=${limit}`);
      return response.data;
    }
    const response = await axios.get(`/feed?page=${page}&pageSize=${limit}`);
    return response.data;
  },

  getExploreFeed: async (page = 1, limit = 10) => {
    const axios = await useAxios();
    const response = await axios.get(`/feed/trending?page=${page}&pageSize=${limit}`);
    return response.data;
  },
};
