import { useAxios } from "@/lib/useAxios";

export interface SharePostInput {
  postId: string;
  content?: string;
  caption?: string;
  visibility?: "PUBLIC" | "FRIENDS" | "ONLY_ME";
  target?: "TIMELINE" | "MESSAGE";
  recipientId?: string;
}

export const shareService = {
  sharePost: async (payload: SharePostInput) => {
    const axios = await useAxios();
    const response = await axios.post(`/posts/${payload.postId}/share`, {
      content: payload.content || payload.caption || "",
      visibility: payload.visibility || "FRIENDS",
    });
    return response.data;
  },

  getPostShares: async (postId: string, page = 1, pageSize = 20) => {
    const axios = await useAxios();
    const response = await axios.get(`/shares/post/${postId}?page=${page}&pageSize=${pageSize}`);
    return response.data;
  },

  getPostShareCount: async (postId: string) => {
    const axios = await useAxios();
    const response = await axios.get(`/shares/post/${postId}/count`);
    return response.data;
  },

  getUserShares: async (userId: string, page = 1, pageSize = 20) => {
    const axios = await useAxios();
    const response = await axios.get(`/shares/user/${userId}?page=${page}&pageSize=${pageSize}`);
    return response.data;
  },
};

