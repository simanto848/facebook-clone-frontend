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
    const cleanContent = (payload.content || "").trim().slice(0, 5000);
    if (!cleanContent) {
      throw new Error("Post content cannot be empty");
    }
    const cleanMediaIds = Array.isArray(payload.mediaIds)
      ? payload.mediaIds.filter((mid) => typeof mid === "string" && mid.trim().length > 0)
      : undefined;

    const axios = await useAxios();
    if (payload.groupId) {
      const cleanGroupId = payload.groupId.trim();
      const response = await axios.post(`/groups/${cleanGroupId}/posts`, {
        content: cleanContent,
        ...(cleanMediaIds && cleanMediaIds.length > 0 ? { mediaIds: cleanMediaIds } : {}),
      });
      return response.data;
    }
    if (payload.pageId) {
      const cleanPageId = payload.pageId.trim();
      const response = await axios.post(`/pages/${cleanPageId}/posts`, {
        content: cleanContent,
        ...(cleanMediaIds && cleanMediaIds.length > 0 ? { mediaIds: cleanMediaIds } : {}),
      });
      return response.data;
    }
    const rawVisibility = (payload.visibility || payload.privacy || "FRIENDS").toUpperCase();
    const visibility = rawVisibility === "PUBLIC" || rawVisibility === "ONLY_ME" ? rawVisibility : "FRIENDS";
    const body: Record<string, any> = {
      content: cleanContent,
      visibility,
      ...(cleanMediaIds && cleanMediaIds.length > 0 ? { mediaIds: cleanMediaIds } : {}),
    };
    const response = await axios.post("/posts", body);
    return response.data;
  },

  getPost: async (id: string) => {
    const cleanId = (id || "").trim();
    const axios = await useAxios();
    const response = await axios.get(`/posts/${cleanId}`);
    return response.data;
  },

  updatePost: async (id: string, payload: Partial<CreatePostInput>) => {
    const cleanId = (id || "").trim();
    const axios = await useAxios();
    const body: Record<string, any> = {};
    if (payload.content !== undefined) {
      body.content = payload.content.trim().slice(0, 5000);
    }
    const rawVisibility = payload.visibility || payload.privacy;
    if (rawVisibility) {
      const upper = rawVisibility.toUpperCase();
      body.visibility = upper === "PUBLIC" || upper === "ONLY_ME" ? upper : "FRIENDS";
    }
    if (Array.isArray(payload.mediaIds) && payload.mediaIds.length > 0) {
      const cleanMediaIds = payload.mediaIds.filter((mid) => typeof mid === "string" && mid.trim().length > 0);
      if (cleanMediaIds.length > 0) {
        body.mediaIds = cleanMediaIds;
      }
    }
    const response = await axios.patch(`/posts/${cleanId}`, body);
    return response.data;
  },

  deletePost: async (id: string) => {
    const cleanId = (id || "").trim();
    const axios = await useAxios();
    const response = await axios.delete(`/posts/${cleanId}`);
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
