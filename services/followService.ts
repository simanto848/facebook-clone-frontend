import { useAxios } from "@/lib/useAxios";

export const followService = {
  followUser: async (targetUserId: string) => {
    const axios = await useAxios();
    const response = await axios.post(`/follows/${targetUserId}`);
    return response.data;
  },

  unfollowUser: async (targetUserId: string) => {
    const axios = await useAxios();
    const response = await axios.delete(`/follows/${targetUserId}`);
    return response.data;
  },

  getFollowers: async (userId: string, page = 1, limit = 20) => {
    const axios = await useAxios();
    const response = await axios.get(`/follows/${userId}/followers?page=${page}&limit=${limit}`);
    return response.data;
  },

  getFollowing: async (userId: string, page = 1, limit = 20) => {
    const axios = await useAxios();
    const response = await axios.get(`/follows/${userId}/following?page=${page}&limit=${limit}`);
    return response.data;
  },
};
