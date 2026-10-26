import { useAxios } from "@/lib/useAxios";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const blockService = {
  getBlockedUsers: async ({ page = 1, pageSize = 20 }: { page?: number; pageSize?: number } = {}) => {
    const axios = await useAxios();
    const validPage = Math.max(1, page);
    const validPageSize = Math.max(1, Math.min(pageSize, 50));
    const response = await axios.get(`/blocks?page=${validPage}&pageSize=${validPageSize}`);
    return response.data;
  },

  blockUser: async (userId: string) => {
    const cleanId = (userId || "").trim();
    if (!UUID_REGEX.test(cleanId)) {
      return { success: false, message: "Invalid user ID format" };
    }
    const axios = await useAxios();
    const response = await axios.post(`/blocks/${cleanId}`);
    return response.data;
  },

  unblockUser: async (userId: string) => {
    const cleanId = (userId || "").trim();
    if (!UUID_REGEX.test(cleanId)) {
      return { success: false, message: "Invalid user ID format" };
    }
    const axios = await useAxios();
    const response = await axios.delete(`/blocks/${cleanId}`);
    return response.data;
  },
};
