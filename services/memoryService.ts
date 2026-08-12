import { useAxios } from "@/lib/useAxios";

export const memoryService = {
  getMemories: async () => {
    const axios = await useAxios();
    const response = await axios.get("/memories");
    return response.data;
  },
};
