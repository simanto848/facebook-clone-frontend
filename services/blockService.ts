import { useAxios } from "@/lib/useAxios";

export const blockService = {
  getBlockedUsers: async ({ page = 1, pageSize = 20 }: { page?: number; pageSize?: number } = {}) => {
    const axios = await useAxios();
    const response = await axios.get(`/blocks?page=${page}&pageSize=${pageSize}`);
    return response.data;
  },

  blockUser: async (userId: string) => {
    const axios = await useAxios();
    const response = await axios.post(`/blocks/${userId}`);
    return response.data;
  },

  unblockUser: async (userId: string) => {
    const axios = await useAxios();
    const response = await axios.delete(`/blocks/${userId}`);
    return response.data;
  },
};
