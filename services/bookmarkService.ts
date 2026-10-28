import { useAxios } from "@/lib/useAxios";

export interface CreateBookmarkInput {
  postId?: string;
  pageId?: string;
  groupId?: string;
}

export const bookmarkService = {
  createBookmark: async (payload: CreateBookmarkInput | string) => {
    const axios = await useAxios();
    const data: { postId?: string; pageId?: string; groupId?: string } = {};
    if (typeof payload === "string") {
      const cleanPostId = payload.trim();
      if (cleanPostId) data.postId = cleanPostId;
    } else {
      if (payload.postId && typeof payload.postId === "string" && payload.postId.trim()) {
        data.postId = payload.postId.trim();
      }
      if (payload.pageId && typeof payload.pageId === "string" && payload.pageId.trim()) {
        data.pageId = payload.pageId.trim();
      }
      if (payload.groupId && typeof payload.groupId === "string" && payload.groupId.trim()) {
        data.groupId = payload.groupId.trim();
      }
    }
    const response = await axios.post("/bookmarks", data);
    return response.data;
  },

  getUserBookmarks: async (page = 1, pageSize = 20) => {
    const axios = await useAxios();
    const validPage = Math.max(1, page);
    const validPageSize = Math.max(1, Math.min(pageSize, 50));
    const response = await axios.get(`/bookmarks?page=${validPage}&pageSize=${validPageSize}`);
    return response.data;
  },

  deleteBookmark: async (bookmarkId: string) => {
    const cleanId = (bookmarkId || "").trim();
    const axios = await useAxios();
    const response = await axios.delete(`/bookmarks/${cleanId}`);
    return response.data;
  },
};
