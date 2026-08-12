import useAxios from "@/lib/useAxios";

export const bookmarkService = {
  createBookmark: async (postId: string, category?: string) => {
    const axios = useAxios();
    const response = await axios.post("/bookmarks", { postId, category });
    return response.data;
  },

  getUserBookmarks: async (page = 1, limit = 20) => {
    const axios = useAxios();
    const response = await axios.get(`/bookmarks?page=${page}&limit=${limit}`);
    return response.data;
  },

  deleteBookmark: async (bookmarkId: string) => {
    const axios = useAxios();
    const response = await axios.delete(`/bookmarks/${bookmarkId}`);
    return response.data;
  },
};
