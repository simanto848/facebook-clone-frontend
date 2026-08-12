import useAxios from "@/lib/useAxios";

export const blockService = {
  getBlockedUsers: async () => {
    const axios = useAxios();
    const response = await axios.get("/blocks");
    return response.data;
  },

  blockUser: async (userId: string) => {
    const axios = useAxios();
    const response = await axios.post(`/blocks/${userId}`);
    return response.data;
  },

  unblockUser: async (userId: string) => {
    const axios = useAxios();
    const response = await axios.delete(`/blocks/${userId}`);
    return response.data;
  },
};
