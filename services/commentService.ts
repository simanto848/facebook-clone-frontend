import { useAxios } from "@/lib/useAxios";

export interface CreateCommentInput {
  postId: string;
  content: string;
  parentId?: string;
  mediaUrl?: string;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const commentService = {
  createComment: async (payload: CreateCommentInput) => {
    const axios = await useAxios();
    const data: { postId: string; content: string; parentId?: string } = {
      postId: (payload.postId || "").trim(),
      content: payload.content.trim().slice(0, 2000),
    };
    if (payload.parentId && UUID_REGEX.test(payload.parentId.trim())) {
      data.parentId = payload.parentId.trim();
    }
    const response = await axios.post("/comments", data);
    return response.data;
  },

  getPostComments: async (postId: string, page = 1, pageSize = 20) => {
    const axios = await useAxios();
    const validPage = Math.max(1, page);
    const validPageSize = Math.max(1, Math.min(pageSize, 50));
    const response = await axios.get(`/comments/post/${(postId || "").trim()}?page=${validPage}&pageSize=${validPageSize}`);
    return response.data;
  },

  getCommentReplies: async (commentId: string, page = 1, pageSize = 10) => {
    const axios = await useAxios();
    const validPage = Math.max(1, page);
    const validPageSize = Math.max(1, Math.min(pageSize, 50));
    const response = await axios.get(`/comments/${(commentId || "").trim()}/replies?page=${validPage}&pageSize=${validPageSize}`);
    return response.data;
  },

  updateComment: async (commentId: string, content: string) => {
    const cleanId = (commentId || "").trim();
    const axios = await useAxios();
    const cleanContent = content.trim().slice(0, 2000);
    const response = await axios.patch(`/comments/${cleanId}`, { content: cleanContent });
    return response.data;
  },

  deleteComment: async (commentId: string) => {
    const cleanId = (commentId || "").trim();
    const axios = await useAxios();
    const response = await axios.delete(`/comments/${cleanId}`);
    return response.data;
  },
};
