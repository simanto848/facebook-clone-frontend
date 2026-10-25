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
    const axios = await useAxios();
    const payload: { mediaUrl: string; caption?: string } = {
      mediaUrl: data.mediaUrl,
    };
    if (data.caption) {
      payload.caption = data.caption.trim().slice(0, 255);
    }
    const response = await axios.post("/stories", payload);
    return response.data;
  },

  deleteStory: async (id: string) => {
    const axios = await useAxios();
    const response = await axios.delete(`/stories/${id}`);
    return response.data;
  },
};
