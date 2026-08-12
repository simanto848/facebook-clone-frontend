import { useAxios } from "@/lib/useAxios";

export const shareService = {
  sharePost: async (postId: string, caption?: string, visibility = "PUBLIC") => {
    const axios = await useAxios();
    const response = await axios.post(`/posts/${postId}/share`, { caption, visibility });
    return response.data;
  },

  getPostShares: async (postId: string) => {
    const axios = await useAxios();
    const response = await axios.get(`/shares/post/${postId}`);
    return response.data;
  },
};
