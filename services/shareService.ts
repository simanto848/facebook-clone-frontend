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
    const rawContent = payload.content || payload.caption || "";
    const cleanContent = rawContent.trim().slice(0, 2000);
    const response = await axios.post(`/posts/${payload.postId}/share`, {
      content: cleanContent,
      visibility: payload.visibility || "FRIENDS",
    });
    return response.data;
  },

  getPostShares: async (postId: string, page = 1, pageSize = 20) => {
    const axios = await useAxios();
    const validPage = Math.max(1, page);
    const validPageSize = Math.max(1, Math.min(pageSize, 50));
    const response = await axios.get(`/shares/post/${postId}?page=${validPage}&pageSize=${validPageSize}`);
    return response.data;
  },

  getPostShareCount: async (postId: string) => {
    const axios = await useAxios();
    const response = await axios.get(`/shares/post/${postId}/count`);
    return response.data;
  },

  getUserShares: async (userId: string, page = 1, pageSize = 20) => {
    const axios = await useAxios();
    const validPage = Math.max(1, page);
    const validPageSize = Math.max(1, Math.min(pageSize, 50));
    const response = await axios.get(`/shares/user/${userId}?page=${validPage}&pageSize=${validPageSize}`);
    return response.data;
  },
};

