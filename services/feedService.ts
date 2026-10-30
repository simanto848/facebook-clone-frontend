import { useAxios } from "@/lib/useAxios";

export type FeedFilter = "LATEST" | "POPULAR" | "TRENDING" | "FOLLOWING" | "MEDIA";

export interface FeedQueryParams {
  page?: number;
  pageSize?: number;
  hashtag?: string;
}

const buildFeedQuery = (params: FeedQueryParams = {}) => {
  const query = new URLSearchParams();
  const validPage = Math.max(1, params.page ?? 1);
  const validPageSize = Math.max(1, Math.min(params.pageSize ?? 20, 50));
  query.append("page", validPage.toString());
  query.append("pageSize", validPageSize.toString());
  if (params.hashtag) {
    const cleanTag = params.hashtag.replace(/^#+/, "").trim();
    if (cleanTag) {
      query.append("hashtag", cleanTag);
    }
  }
  return query.toString();
};

export const feedService = {
  getChronologicalFeed: async (params: FeedQueryParams = {}) => {
    const axios = await useAxios();
    const queryString = buildFeedQuery(params);
    const response = await axios.get(`/feed${queryString ? `?${queryString}` : ""}`);
    return response.data;
  },

  getTrendingFeed: async (params: FeedQueryParams = {}) => {
    const axios = await useAxios();
    const queryString = buildFeedQuery(params);
    const response = await axios.get(`/feed/trending${queryString ? `?${queryString}` : ""}`);
    return response.data;
  },

  getMediaFeed: async (params: FeedQueryParams = {}) => {
    const axios = await useAxios();
    const queryString = buildFeedQuery(params);
    const response = await axios.get(`/feed/media${queryString ? `?${queryString}` : ""}`);
    return response.data;
  },

  getPersonalizedFeed: async (filter: FeedFilter = "LATEST", page = 1, limit = 10) => {
    const axios = await useAxios();
    const validLimit = Math.max(1, Math.min(limit, 50));
    const validPage = Math.max(1, page);
    if (filter === "TRENDING" || filter === "POPULAR") {
      const response = await axios.get(`/feed/trending?page=${validPage}&pageSize=${validLimit}`);
      return response.data;
    }
    if (filter === "MEDIA") {
      const response = await axios.get(`/feed/media?page=${validPage}&pageSize=${validLimit}`);
      return response.data;
    }
    const response = await axios.get(`/feed?page=${validPage}&pageSize=${validLimit}`);
    return response.data;
  },

  getExploreFeed: async (page = 1, limit = 10) => {
    const axios = await useAxios();
    const validLimit = Math.max(1, Math.min(limit, 50));
    const validPage = Math.max(1, page);
    const response = await axios.get(`/feed/trending?page=${validPage}&pageSize=${validLimit}`);
    return response.data;
  },
};
