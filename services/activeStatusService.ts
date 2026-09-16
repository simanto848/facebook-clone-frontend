import { useAxios } from "@/lib/useAxios";

export interface ActiveStatusResponse {
  userId: string;
  isOnline: boolean;
  lastActiveAt?: string;
}

export const activeStatusService = {
  sendHeartbeat: async () => {
    const axios = await useAxios();
    const response = await axios.post("/active-status/heartbeat");
    return response.data;
  },

  getBatchStatus: async (userIds: string[]) => {
    const axios = await useAxios();
    const response = await axios.post("/active-status/batch", { userIds });
    return response.data;
  },

  getUserStatus: async (userId: string) => {
    const axios = await useAxios();
    const response = await axios.get(`/active-status/${userId}`);
    return response.data;
  },
};
