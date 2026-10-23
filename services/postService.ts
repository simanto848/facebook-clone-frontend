import { useAxios } from "@/lib/useAxios";

export interface CreatePostInput {
  content: string;
  mediaUrls?: string[];
  privacy?: "PUBLIC" | "FRIENDS" | "ONLY_ME";
  groupId?: string;
  pageId?: string;
}

export const postService = {
  getFeed: async (page = 1, pageSize = 20, hashtag?: string) => {
    const axios = await useAxios();
    const query = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });
    if (hashtag) {
      query.set("hashtag", hashtag);
    }
    const response = await axios.get(`/posts/feed?${query.toString()}`);
    return response.data;
  },

  createPost: async (payload: CreatePostInput) => {
    const axios = await useAxios();
    const response = await axios.post("/posts", payload);
    return response.data;
  },

  getPost: async (id: string) => {
    const axios = await useAxios();
    const response = await axios.get(`/posts/${id}`);
    return response.data;
  },

  updatePost: async (id: string, payload: Partial<CreatePostInput>) => {
    const axios = await useAxios();
    const response = await axios.patch(`/posts/${id}`, payload);
    return response.data;
  },

  deletePost: async (id: string) => {
    const axios = await useAxios();
    const response = await axios.delete(`/posts/${id}`);
    return response.data;
  },

  sharePost: async (id: string, content?: string, visibility?: "PUBLIC" | "FRIENDS" | "ONLY_ME") => {
    const axios = await useAxios();
    const response = await axios.post(`/posts/${id}/share`, { content, visibility });
    return response.data;
  },
};
