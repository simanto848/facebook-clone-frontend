import { useAxios } from "@/lib/useAxios";

export interface CreatePostInput {
  content: string;
  mediaUrls?: string[];
  privacy?: "PUBLIC" | "FRIENDS" | "ONLY_ME";
  visibility?: "PUBLIC" | "FRIENDS" | "ONLY_ME";
  mediaIds?: string[];
  groupId?: string;
  pageId?: string;
}

export const postService = {
  getFeed: async (page = 1, pageSize = 20, hashtag?: string) => {
    const axios = await useAxios();
    const validPage = Math.max(1, page);
    const validPageSize = Math.max(1, Math.min(pageSize, 50));
    const query = new URLSearchParams({
      page: String(validPage),
      pageSize: String(validPageSize),
    });
    if (hashtag) {
      const cleanTag = hashtag.replace(/^#+/, "").trim();
      if (cleanTag) {
        query.set("hashtag", cleanTag);
      }
    }
    const response = await axios.get(`/posts/feed?${query.toString()}`);
    return response.data;
  },

  createPost: async (payload: CreatePostInput) => {
    const axios = await useAxios();
    if (payload.groupId) {
      const response = await axios.post(`/groups/${payload.groupId}/posts`, {
        content: payload.content,
        ...(payload.mediaIds && payload.mediaIds.length > 0 ? { mediaIds: payload.mediaIds } : {}),
      });
      return response.data;
    }
    if (payload.pageId) {
      const response = await axios.post(`/pages/${payload.pageId}/posts`, {
        content: payload.content,
        ...(payload.mediaIds && payload.mediaIds.length > 0 ? { mediaIds: payload.mediaIds } : {}),
      });
      return response.data;
    }
    const visibility = payload.visibility || payload.privacy || "PUBLIC";
    const body: Record<string, any> = {
      content: payload.content,
      visibility,
      ...(payload.mediaIds && payload.mediaIds.length > 0 ? { mediaIds: payload.mediaIds } : {}),
    };
    const response = await axios.post("/posts", body);
    return response.data;
  },

  getPost: async (id: string) => {
    const axios = await useAxios();
    const response = await axios.get(`/posts/${id}`);
    return response.data;
  },

  updatePost: async (id: string, payload: Partial<CreatePostInput>) => {
    const axios = await useAxios();
    const body: Record<string, any> = {};
    if (payload.content !== undefined) {
      body.content = payload.content.trim().slice(0, 5000);
    }
    const visibility = payload.visibility || payload.privacy;
    if (visibility) {
      body.visibility = visibility;
    }
    if (payload.mediaIds && payload.mediaIds.length > 0) {
      body.mediaIds = payload.mediaIds;
    }
    const response = await axios.patch(`/posts/${id}`, body);
    return response.data;
  },

  deletePost: async (id: string) => {
    const axios = await useAxios();
    const response = await axios.delete(`/posts/${id}`);
    return response.data;
  },

  sharePost: async (id: string, content?: string, visibility?: "PUBLIC" | "FRIENDS" | "ONLY_ME") => {
    const cleanId = (id || "").trim();
    const cleanContent = typeof content === "string" ? content.trim().slice(0, 2000) : undefined;
    const axios = await useAxios();
    const payload: { content?: string; visibility?: "PUBLIC" | "FRIENDS" | "ONLY_ME" } = {};
    if (cleanContent !== undefined) payload.content = cleanContent;
    if (visibility) payload.visibility = visibility;
    const response = await axios.post(`/posts/${cleanId}/share`, payload);
    return response.data;
  },
};
