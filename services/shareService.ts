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
    const cleanId = (payload.postId || "").trim();
    const rawContent = payload.content || payload.caption || "";
    const cleanContent = rawContent.trim().slice(0, 2000);
    const rawVisibility = (payload.visibility || "FRIENDS").toUpperCase();
    const visibility = rawVisibility === "PUBLIC" || rawVisibility === "ONLY_ME" ? rawVisibility : "FRIENDS";
    const axios = await useAxios();
    const response = await axios.post(`/posts/${cleanId}/share`, {
      content: cleanContent,
      visibility,
    });
    return response.data;
  },

  getPostShares: async (postId: string, page = 1, pageSize = 20) => {
    const cleanId = (postId || "").trim();
    const axios = await useAxios();
    const validPage = Math.max(1, page);
    const validPageSize = Math.max(1, Math.min(pageSize, 50));
    const response = await axios.get(`/shares/post/${cleanId}?page=${validPage}&pageSize=${validPageSize}`);
    return response.data;
  },

  getPostShareCount: async (postId: string) => {
    const cleanId = (postId || "").trim();
    const axios = await useAxios();
    const response = await axios.get(`/shares/post/${cleanId}/count`);
    return response.data;
  },

  getUserShares: async (userId: string, page = 1, pageSize = 20) => {
    const cleanId = (userId || "").trim();
    const axios = await useAxios();
    const validPage = Math.max(1, page);
    const validPageSize = Math.max(1, Math.min(pageSize, 50));
    const response = await axios.get(`/shares/user/${cleanId}?page=${validPage}&pageSize=${validPageSize}`);
    return response.data;
  },
};

