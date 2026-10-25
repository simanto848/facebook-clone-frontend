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
    const response = await axios.get(`/friendships/friends?page=${page}&pageSize=${pageSize}`);
    return response.data;
  },

  getPendingRequests: async (page = 1, pageSize = 20) => {
    const axios = await useAxios();
    const response = await axios.get(`/friendships/requests/pending?page=${page}&pageSize=${pageSize}`);
    return response.data;
  },

  getSentRequests: async (page = 1, pageSize = 20) => {
    const axios = await useAxios();
    const response = await axios.get(`/friendships/requests/sent?page=${page}&pageSize=${pageSize}`);
    return response.data;
  },

  cancelFriendRequest: async (userId: string) => {
    const axios = await useAxios();
    const response = await axios.post(`/friendships/cancel/${userId}`);
    return response.data;
  },

  getSuggestions: async () => {
    const axios = await useAxios();
    const response = await axios.get("/users/suggestions");
    return response.data;
  },

  sendFriendRequest: async (userId: string) => {
    const axios = await useAxios();
    const response = await axios.post(`/friendships/request/${userId}`);
    return response.data;
  },

  acceptFriendRequest: async (userId: string) => {
    const axios = await useAxios();
    const response = await axios.post(`/friendships/accept/${userId}`);
    return response.data;
  },

  declineFriendRequest: async (userId: string) => {
    const axios = await useAxios();
    const response = await axios.post(`/friendships/decline/${userId}`);
    return response.data;
  },

  unfriend: async (userId: string) => {
    const axios = await useAxios();
    const response = await axios.delete(`/friendships/${userId}`);
    return response.data;
  },

  getMutualFriends: async (userId: string) => {
    try {
      const axios = await useAxios();
      const response = await axios.get(`/friendships/mutual/${userId}`);
      return response.data;
    } catch {
      // Server does not expose a dedicated mutual endpoint; provide graceful fallback
      return { success: true, data: [] };
    }
  },

  followUser: async (userId: string) => {
    const axios = await useAxios();
    const response = await axios.post(`/follows/${userId}`);
    return response.data;
  },

  unfollowUser: async (userId: string) => {
    const axios = await useAxios();
    const response = await axios.delete(`/follows/${userId}`);
    return response.data;
  },
};
