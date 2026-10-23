import { useAxios } from "@/lib/useAxios";

export interface ActiveStatusResponse {
  userId: string;
  isOnline: boolean;
  lastActiveAt?: string;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const activeStatusService = {
  sendHeartbeat: async () => {
    const axios = await useAxios();
    const response = await axios.post("/active-status/heartbeat");
    return response.data;
  },

  getBatchStatus: async (userIds: string[]) => {
    const validIds = Array.isArray(userIds)
      ? userIds.filter((id) => typeof id === "string" && UUID_REGEX.test(id))
      : [];
    if (validIds.length === 0) {
      return { success: true, data: [] };
    }
    const axios = await useAxios();
    const response = await axios.post("/active-status/batch", { userIds: validIds });
    return response.data;
  },

  getUserStatus: async (userId: string) => {
    if (!userId || typeof userId !== "string" || !UUID_REGEX.test(userId)) {
      return { success: false, data: null };
    }
    const axios = await useAxios();
    const response = await axios.get(`/active-status/${userId}`);
    return response.data;
  },
};
