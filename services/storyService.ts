import { useAxios } from "@/lib/useAxios";

export interface CreateStoryInput {
  mediaUrl: string;
  mediaType?: "IMAGE" | "VIDEO";
  caption?: string;
}

export const storyService = {
  getActiveStories: async () => {
    const axios = await useAxios();
    const response = await axios.get("/stories/feed");
    return response.data;
  },

  getStories: async () => {
    const axios = await useAxios();
    const response = await axios.get("/stories/feed");
    return response.data;
  },

  createStory: async (data: CreateStoryInput) => {
    const trimmedMediaUrl = (data.mediaUrl || "").trim();
    if (!trimmedMediaUrl || !/^https?:\/\/.+/.test(trimmedMediaUrl)) {
      throw new Error("Valid media URL starting with http:// or https:// is required");
    }
    const axios = await useAxios();
    const payload: { mediaUrl: string; caption?: string } = {
      mediaUrl: trimmedMediaUrl,
    };
    if (data.caption && data.caption.trim()) {
      payload.caption = data.caption.trim().slice(0, 255);
    }
    const response = await axios.post("/stories", payload);
    return response.data;
  },

  deleteStory: async (id: string) => {
    const cleanId = (id || "").trim();
    const axios = await useAxios();
    const response = await axios.delete(`/stories/${cleanId}`);
    return response.data;
  },
};
