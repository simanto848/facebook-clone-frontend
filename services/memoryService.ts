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
    const cleanId = (memoryId || "").trim();
    const cleanCaption = caption ? caption.trim().slice(0, 2000) : "";
    const rawVisibility = (visibility || "PUBLIC").toUpperCase();
    const normalizedVisibility =
      rawVisibility === "PUBLIC" || rawVisibility === "FRIENDS" || rawVisibility === "ONLY_ME"
        ? rawVisibility
        : "PUBLIC";
    const axios = await useAxios();
    // Memories represent historical posts; sharing a memory creates a share via the post share endpoint
    const response = await axios.post(`/posts/${cleanId}/share`, {
      content: cleanCaption,
      visibility: normalizedVisibility,
    });
    return response.data;
  },
};
