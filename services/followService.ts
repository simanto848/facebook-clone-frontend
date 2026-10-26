import { useAxios } from "@/lib/useAxios";

export const followService = {
  followUser: async (targetUserId: string) => {
    const axios = await useAxios();
    const cleanId = (targetUserId || "").trim();
    const response = await axios.post(`/follows/${cleanId}`);
    return response.data;
  },

  unfollowUser: async (targetUserId: string) => {
    const axios = await useAxios();
    const cleanId = (targetUserId || "").trim();
    const response = await axios.delete(`/follows/${cleanId}`);
    return response.data;
  },

  getFollowers: async (userId: string, page = 1, pageSize = 20) => {
    const axios = await useAxios();
    const cleanId = (userId || "").trim();
    const validPage = Math.max(1, page);
    const validPageSize = Math.max(1, Math.min(pageSize, 50));
    const response = await axios.get(`/follows/${cleanId}/followers?page=${validPage}&pageSize=${validPageSize}`);
    return response.data;
  },

  getFollowing: async (userId: string, page = 1, pageSize = 20) => {
    const axios = await useAxios();
    const cleanId = (userId || "").trim();
    const validPage = Math.max(1, page);
    const validPageSize = Math.max(1, Math.min(pageSize, 50));
    const response = await axios.get(`/follows/${cleanId}/following?page=${validPage}&pageSize=${validPageSize}`);
    return response.data;
  },
};
