import { useAxios } from "@/lib/useAxios";

export interface CreateCommentInput {
  postId: string;
  content: string;
  parentId?: string;
  mediaUrl?: string;
}

export const commentService = {
  createComment: async (payload: CreateCommentInput) => {
    const axios = await useAxios();
    const response = await axios.post("/comments", payload);
    return response.data;
  },

  getPostComments: async (postId: string, page = 1, limit = 20) => {
    const axios = await useAxios();
    const response = await axios.get(`/comments/post/${postId}?page=${page}&limit=${limit}`);
    return response.data;
  },

  getCommentReplies: async (commentId: string, page = 1, limit = 10) => {
    const axios = await useAxios();
    const response = await axios.get(`/comments/${commentId}/replies?page=${page}&limit=${limit}`);
    return response.data;
  },

  updateComment: async (commentId: string, content: string) => {
    const axios = await useAxios();
    const response = await axios.patch(`/comments/${commentId}`, { content });
    return response.data;
  },

  deleteComment: async (commentId: string) => {
    const axios = await useAxios();
    const response = await axios.delete(`/comments/${commentId}`);
    return response.data;
  },
};
