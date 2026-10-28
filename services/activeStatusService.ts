import { useAxios } from "@/lib/useAxios";

export interface ActiveStatusResponse {
  userId: string;
  isOnline: boolean;
  lastActiveAt?: string;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const activeStatusService = {
  sendHeartbeat: async () => {
    const axios = await useAxios();
    const response = await axios.post("/active-status/heartbeat");
    return response.data;
  },

  getBatchStatus: async (userIds: string[]) => {
    const validIds = Array.isArray(userIds)
      ? userIds
          .map((id) => (typeof id === "string" ? id.trim() : ""))
          .filter((id) => UUID_REGEX.test(id))
          .slice(0, 100)
      : [];
    if (validIds.length === 0) {
      return { success: true, data: [] };
    }
    const axios = await useAxios();
    const response = await axios.post("/active-status/batch", { userIds: validIds });
    return response.data;
  },

  getUserStatus: async (userId: string) => {
    const cleanId = typeof userId === "string" ? userId.trim() : "";
    if (!cleanId || !UUID_REGEX.test(cleanId)) {
      return { success: false, data: null };
    }
    const axios = await useAxios();
    const response = await axios.get(`/active-status/${cleanId}`);
    return response.data;
  },
};
