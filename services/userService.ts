import { useAxios } from "@/lib/useAxios";

export interface UpdateProfilePayload {
  name?: string;
  displayName?: string;
  bio?: string;
  dateOfBirth?: string | Date;
  gender?: string;
  avatar?: string;
  avatarUrl?: string;
  coverPhoto?: string;
  coverUrl?: string;
  location?: string;
  website?: string;
  isPrivate?: boolean;
  showOnlineStatus?: boolean;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const userService = {
  getMe: async () => {
    const axios = await useAxios();
    const response = await axios.get("/users/me");
    return response.data;
  },

  updateProfile: async (payload: UpdateProfilePayload) => {
    const axios = await useAxios();
    // Server updateProfileSchema is strict: only accepts displayName, bio, dateOfBirth, gender, avatarUrl, coverUrl
    const body: Record<string, any> = {};
    const rawDisplayName = payload.displayName || payload.name;
    if (typeof rawDisplayName === "string" && rawDisplayName.trim()) {
      body.displayName = rawDisplayName.trim().slice(0, 100);
    }
    if (payload.bio !== undefined) {
      body.bio = typeof payload.bio === "string" ? payload.bio.trim().slice(0, 500) : payload.bio;
    }
    if (payload.dateOfBirth !== undefined && payload.dateOfBirth !== null) {
      body.dateOfBirth = payload.dateOfBirth;
    }
    if (payload.gender !== undefined) {
      body.gender = typeof payload.gender === "string" ? payload.gender.trim().slice(0, 20) : payload.gender;
    }
    const avatar = payload.avatarUrl || payload.avatar;
    if (avatar !== undefined) {
      const trimmed = typeof avatar === "string" ? avatar.trim() : "";
      if (!trimmed || /^https?:\/\/.+/.test(trimmed)) {
        body.avatarUrl = trimmed;
      }
    }
    const cover = payload.coverUrl || payload.coverPhoto;
    if (cover !== undefined) {
      const trimmed = typeof cover === "string" ? cover.trim() : "";
      if (!trimmed || /^https?:\/\/.+/.test(trimmed)) {
        body.coverUrl = trimmed;
      }
    }

    const response = await axios.patch("/users/me", body);
    return response.data;
  },

  updateAvatar: async (url: string) => {
    const trimmed = typeof url === "string" ? url.trim() : "";
    if (!trimmed || !/^https?:\/\/.+/.test(trimmed)) {
      throw new Error("A valid HTTP or HTTPS media URL is required.");
    }
    const axios = await useAxios();
    const response = await axios.put("/users/me/avatar", { url: trimmed });
    return response.data;
  },

  updateCover: async (url: string) => {
    const trimmed = typeof url === "string" ? url.trim() : "";
    if (!trimmed || !/^https?:\/\/.+/.test(trimmed)) {
      throw new Error("A valid HTTP or HTTPS media URL is required.");
    }
    const axios = await useAxios();
    const response = await axios.put("/users/me/cover", { url: trimmed });
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

  getUserPosts: async (id: string, page = 1, pageSize = 20) => {
    const axios = await useAxios();
    const validPage = Math.max(1, page);
    const validPageSize = Math.max(1, Math.min(pageSize, 50));
    const response = await axios.get(`/users/${id}/posts?page=${validPage}&pageSize=${validPageSize}`);
    return response.data;
  },

  searchUsers: async (q: string, pageSize = 10, page = 1) => {
    const axios = await useAxios();
    const cleanQ = (q || "").trim();
    const validPage = Math.max(1, page);
    const validPageSize = Math.max(1, Math.min(pageSize, 50));
    const response = await axios.get(`/users/search?q=${encodeURIComponent(cleanQ)}&pageSize=${validPageSize}&page=${validPage}`);
    return response.data;
  },

  getSuggestions: async (pageSize = 5, page = 1) => {
    const axios = await useAxios();
    const validPage = Math.max(1, page);
    const validPageSize = Math.max(1, Math.min(pageSize, 50));
    const response = await axios.get(`/users/suggestions?pageSize=${validPageSize}&page=${validPage}`);
    return response.data;
  },

  getFollowers: async (id: string, page = 1, pageSize = 20) => {
    const axios = await useAxios();
    const validPage = Math.max(1, page);
    const validPageSize = Math.max(1, Math.min(pageSize, 50));
    const response = await axios.get(`/users/${id}/followers?page=${validPage}&pageSize=${validPageSize}`);
    return response.data;
  },

  getFollowing: async (id: string, page = 1, pageSize = 20) => {
    const axios = await useAxios();
    const validPage = Math.max(1, page);
    const validPageSize = Math.max(1, Math.min(pageSize, 50));
    const response = await axios.get(`/users/${id}/following?page=${validPage}&pageSize=${validPageSize}`);
    return response.data;
  },

  followUser: async (id: string) => {
    const axios = await useAxios();
    const response = await axios.post(`/users/${id}/follow`);
    return response.data;
  },

  unfollowUser: async (id: string) => {
    const axios = await useAxios();
    const response = await axios.post(`/users/${id}/unfollow`);
    return response.data;
  },

  changePassword: async (payload: ChangePasswordPayload) => {
    const axios = await useAxios();
    const response = await axios.post("/users/me/change-password", payload);
    return response.data;
  },

  blockUser: async (id: string) => {
    const axios = await useAxios();
    const response = await axios.post(`/users/${id}/block`);
    return response.data;
  },

  unblockUser: async (id: string) => {
    const axios = await useAxios();
    const response = await axios.post(`/users/${id}/unblock`);
    return response.data;
  },

  deleteAccount: async () => {
    const axios = await useAxios();
    const response = await axios.delete("/users/me");
    return response.data;
  },
};
