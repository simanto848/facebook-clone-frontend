import { useAxios } from "@/lib/useAxios";

export interface UpdateProfilePayload {
  name?: string;
  displayName?: string;
  bio?: string;
  avatar?: string;
  coverPhoto?: string;
  location?: string;
  website?: string;
}

export const userService = {
  getMe: async () => {
    const axios = await useAxios();
    const response = await axios.get("/users/me");
    return response.data;
  },

  updateProfile: async (payload: UpdateProfilePayload) => {
    const axios = await useAxios();
    const response = await axios.patch("/users/me", payload);
    return response.data;
  },

  updateAvatar: async (url: string) => {
    const axios = await useAxios();
    const response = await axios.put("/users/me/avatar", { url });
    return response.data;
  },

  updateCover: async (url: string) => {
    const axios = await useAxios();
    const response = await axios.put("/users/me/cover", { url });
    return response.data;
  },

  getUserByUsername: async (username: string) => {
    const axios = await useAxios();
    const response = await axios.get(`/users/username/${username}`);
    return response.data;
  },

  getUserById: async (id: string) => {
    const axios = await useAxios();
    const response = await axios.get(`/users/${id}`);
    return response.data;
  },

  getUserPosts: async (id: string, page = 1, limit = 10) => {
    const axios = await useAxios();
    const response = await axios.get(`/users/${id}/posts?page=${page}&limit=${limit}`);
    return response.data;
  },

  searchUsers: async (q: string, limit = 10) => {
    const axios = await useAxios();
    const response = await axios.get(`/users/search?q=${encodeURIComponent(q)}&limit=${limit}`);
    return response.data;
  },

  getSuggestions: async (limit = 5) => {
    const axios = await useAxios();
    const response = await axios.get(`/users/suggestions?limit=${limit}`);
    return response.data;
  },

  getFollowers: async (id: string) => {
    const axios = await useAxios();
    const response = await axios.get(`/users/${id}/followers`);
    return response.data;
  },

  getFollowing: async (id: string) => {
    const axios = await useAxios();
    const response = await axios.get(`/users/${id}/following`);
    return response.data;
  },
};
