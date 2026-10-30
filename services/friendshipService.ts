import { useAxios } from "@/lib/useAxios";

export interface FriendUser {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  avatarUrl?: string;
  profilePicture?: string;
  avatar?: string;
  headline?: string;
  bio?: string;
  mutualFriendsCount?: number;
}

export const friendshipService = {
  getFriends: async (page = 1, pageSize = 20) => {
    const axios = await useAxios();
    const validPage = Math.max(1, page);
    const validPageSize = Math.max(1, Math.min(pageSize, 50));
    const response = await axios.get(`/friendships/friends?page=${validPage}&pageSize=${validPageSize}`);
    return response.data;
  },

  getPendingRequests: async (page = 1, pageSize = 20) => {
    const axios = await useAxios();
    const validPage = Math.max(1, page);
    const validPageSize = Math.max(1, Math.min(pageSize, 50));
    const response = await axios.get(`/friendships/requests/pending?page=${validPage}&pageSize=${validPageSize}`);
    return response.data;
  },

  getSentRequests: async (page = 1, pageSize = 20) => {
    const axios = await useAxios();
    const validPage = Math.max(1, page);
    const validPageSize = Math.max(1, Math.min(pageSize, 50));
    const response = await axios.get(`/friendships/requests/sent?page=${validPage}&pageSize=${validPageSize}`);
    return response.data;
  },

  cancelFriendRequest: async (userId: string) => {
    const axios = await useAxios();
    const cleanId = (userId || "").trim();
    const response = await axios.post(`/friendships/cancel/${cleanId}`);
    return response.data;
  },

  getSuggestions: async (page = 1, pageSize = 20) => {
    const axios = await useAxios();
    const validPage = Math.max(1, page);
    const validPageSize = Math.max(1, Math.min(pageSize, 50));
    const response = await axios.get(`/users/suggestions?page=${validPage}&pageSize=${validPageSize}`);
    return response.data;
  },

  sendFriendRequest: async (userId: string) => {
    const cleanId = (userId || "").trim();
    const axios = await useAxios();
    const response = await axios.post(`/friendships/request/${cleanId}`);
    return response.data;
  },

  acceptFriendRequest: async (userId: string) => {
    const cleanId = (userId || "").trim();
    const axios = await useAxios();
    const response = await axios.post(`/friendships/accept/${cleanId}`);
    return response.data;
  },

  declineFriendRequest: async (userId: string) => {
    const cleanId = (userId || "").trim();
    const axios = await useAxios();
    const response = await axios.post(`/friendships/decline/${cleanId}`);
    return response.data;
  },

  unfriend: async (userId: string) => {
    const cleanId = (userId || "").trim();
    const axios = await useAxios();
    const response = await axios.delete(`/friendships/${cleanId}`);
    return response.data;
  },

  getMutualFriends: async (userId: string) => {
    try {
      const cleanId = (userId || "").trim();
      const axios = await useAxios();
      const response = await axios.get(`/friendships/mutual/${cleanId}`);
      return response.data;
    } catch {
      // Server does not expose a dedicated mutual endpoint; provide graceful fallback
      return { success: true, data: [] };
    }
  },

  followUser: async (userId: string) => {
    const cleanId = (userId || "").trim();
    const axios = await useAxios();
    const response = await axios.post(`/follows/${cleanId}`);
    return response.data;
  },

  unfollowUser: async (userId: string) => {
    const cleanId = (userId || "").trim();
    const axios = await useAxios();
    const response = await axios.delete(`/follows/${cleanId}`);
    return response.data;
  },
};
