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
    const data: { postId: string; content: string; parentId?: string } = {
      postId: payload.postId,
      content: payload.content.trim().slice(0, 2000),
    };
    if (payload.parentId) {
      data.parentId = payload.parentId;
    }
    const response = await axios.post("/comments", data);
    return response.data;
  },

  getPostComments: async (postId: string, page = 1, pageSize = 20) => {
    const axios = await useAxios();
    const response = await axios.get(`/comments/post/${postId}?page=${page}&pageSize=${pageSize}`);
    return response.data;
  },

  getCommentReplies: async (commentId: string, page = 1, pageSize = 10) => {
    const axios = await useAxios();
    const response = await axios.get(`/comments/${commentId}/replies?page=${page}&pageSize=${pageSize}`);
    return response.data;
  },

  updateComment: async (commentId: string, content: string) => {
    const axios = await useAxios();
    const cleanContent = content.trim().slice(0, 2000);
    const response = await axios.patch(`/comments/${commentId}`, { content: cleanContent });
    return response.data;
  },

  deleteComment: async (commentId: string) => {
    const axios = await useAxios();
    const response = await axios.delete(`/comments/${commentId}`);
    return response.data;
  },
};
