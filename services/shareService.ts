import { useAxios } from "@/lib/useAxios";

export interface SharePostInput {
  postId: string;
  caption?: string;
  target?: "TIMELINE" | "MESSAGE";
  recipientId?: string;
}

export const shareService = {
  sharePost: async (payload: SharePostInput) => {
    const axios = await useAxios();
    const response = await axios.post(`/posts/${payload.postId}/share`, payload);
    return response.data;
  },

  getPostShares: async (postId: string) => {
    const axios = await useAxios();
    const response = await axios.get(`/shares/post/${postId}`);
    return response.data;
  },
};
