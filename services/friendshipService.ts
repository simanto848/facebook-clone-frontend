import useAxios from "@/lib/useAxios";

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
  getFriends: async (limit = 20, page = 1) => {
    const axios = useAxios();
    const response = await axios.get(`/friendships/friends?limit=${limit}&page=${page}`);
    return response.data;
  },

  getPendingRequests: async () => {
    const axios = useAxios();
    const response = await axios.get("/friendships/requests/pending");
    return response.data;
  },

  getSuggestions: async () => {
    const axios = useAxios();
    const response = await axios.get("/users/suggestions");
    return response.data;
  },

  sendFriendRequest: async (userId: string) => {
    const axios = useAxios();
    const response = await axios.post(`/friendships/request/${userId}`);
    return response.data;
  },

  acceptFriendRequest: async (userId: string) => {
    const axios = useAxios();
    const response = await axios.post(`/friendships/accept/${userId}`);
    return response.data;
  },

  declineFriendRequest: async (userId: string) => {
    const axios = useAxios();
    const response = await axios.post(`/friendships/decline/${userId}`);
    return response.data;
  },

  unfriend: async (userId: string) => {
    const axios = useAxios();
    const response = await axios.delete(`/friendships/${userId}`);
    return response.data;
  },

  followUser: async (userId: string) => {
    const axios = useAxios();
    const response = await axios.post(`/follows/${userId}`);
    return response.data;
  },

  unfollowUser: async (userId: string) => {
    const axios = useAxios();
    const response = await axios.delete(`/follows/${userId}`);
    return response.data;
  },
};
