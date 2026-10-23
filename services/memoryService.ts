import { useAxios } from "@/lib/useAxios";

export const memoryService = {
  getMemories: async () => {
    const axios = await useAxios();
    const response = await axios.get("/memories");
    return response.data;
  },

  shareMemory: async (
    memoryId: string,
    caption?: string,
    visibility: "PUBLIC" | "FRIENDS" | "ONLY_ME" = "PUBLIC"
  ) => {
    const axios = await useAxios();
    // Memories represent historical posts; sharing a memory creates a share via the post share endpoint
    const response = await axios.post(`/posts/${memoryId}/share`, {
      content: caption || "",
      visibility,
    });
    return response.data;
  },
};
