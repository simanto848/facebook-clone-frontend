import { useAxios } from "@/lib/useAxios";

export interface CreateBookmarkInput {
  postId?: string;
  pageId?: string;
  groupId?: string;
}

export const bookmarkService = {
  createBookmark: async (payload: CreateBookmarkInput | string, category?: string) => {
    const axios = await useAxios();
    const data: Record<string, any> = typeof payload === "string" ? { postId: payload } : { ...payload };
    const response = await axios.post("/bookmarks", data);
    return response.data;
  },

  getUserBookmarks: async (page = 1, pageSize = 20) => {
    const axios = await useAxios();
    const response = await axios.get(`/bookmarks?page=${page}&pageSize=${pageSize}`);
    return response.data;
  },

  deleteBookmark: async (bookmarkId: string) => {
    const axios = await useAxios();
    const response = await axios.delete(`/bookmarks/${bookmarkId}`);
    return response.data;
  },
};
