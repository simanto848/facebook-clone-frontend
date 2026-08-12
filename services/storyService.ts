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

  createStory: async (data: CreateStoryInput) => {
    const axios = await useAxios();
    const response = await axios.post("/stories", data);
    return response.data;
  },

  deleteStory: async (id: string) => {
    const axios = await useAxios();
    const response = await axios.delete(`/stories/${id}`);
    return response.data;
  },
};
